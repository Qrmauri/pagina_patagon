import test from 'node:test';
import assert from 'node:assert/strict';
import { ensureCatalogConnection } from './catalogConnection.js';
import { api } from './api.js';

test('guardar vuelve a conectar si Django se inició después de abrir la tienda', async () => {
  let attempts = 0;
  await ensureCatalogConnection(false, async () => { attempts++; return []; });
  assert.equal(attempts, 1);
});

test('si Django continúa desconectado se impide guardar y se explica cómo reconectar', async () => {
  await assert.rejects(ensureCatalogConnection(false, async () => null), /No pudimos conectar/);
});

test('un token vencido no hace que el catálogo público parezca un backend apagado', async t => {
  const calls = [];
  t.mock.method(globalThis, 'fetch', async (_url, options) => {
    calls.push(options.headers);
    return options.headers.Authorization
      ? new Response('{}', { status: 401 })
      : Response.json([{ id: 1, title: 'Cuaderno' }]);
  });
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => 'expired-test-token' }, configurable: true });
  t.after(() => previousStorage ? Object.defineProperty(globalThis, 'localStorage', previousStorage) : delete globalThis.localStorage);
  assert.deepEqual(await api.getProducts(), [{ id: 1, title: 'Cuaderno' }]);
  assert.equal(calls.length, 2);
  assert.equal(calls[1].Authorization, undefined);
});

test('crear producto envía el enlace de imagen como JSON y conserva la autorización', async t => {
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => 'test-token' }, configurable: true });
  t.after(() => previousStorage ? Object.defineProperty(globalThis, 'localStorage', previousStorage) : delete globalThis.localStorage);
  const payload = { title: 'Cuaderno', price: 1990, category: 'libros', stock: 4, image: 'https://example.com/cuaderno.jpg' };
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    assert.ok(url.endsWith('/products/'));
    assert.equal(options.method, 'POST');
    assert.equal(options.headers.Authorization, 'Bearer test-token');
    assert.equal(options.headers['Content-Type'], 'application/json');
    assert.deepEqual(JSON.parse(options.body), payload);
    return Response.json({ id: 42, ...payload }, { status: 201 });
  });
  assert.equal((await api.createProduct(payload)).id, 42);
});

test('una sesión vencida al guardar se distingue de un backend desconectado', async t => {
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { value: { getItem: () => 'expired-test-token' }, configurable: true });
  t.after(() => previousStorage ? Object.defineProperty(globalThis, 'localStorage', previousStorage) : delete globalThis.localStorage);
  t.mock.method(globalThis, 'fetch', async () => Response.json({ detail: 'Invalid token' }, { status: 401 }));
  await assert.rejects(api.createProduct({ title: 'Cuaderno' }), /sesión de administración venció/);
});

function sessionStorage(t) {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const values = new Map([['patagon_access_token', 'old-access'], ['patagon_refresh_token', 'valid-refresh']]);
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: key => values.delete(key),
  } });
  t.after(() => previous ? Object.defineProperty(globalThis, 'localStorage', previous) : delete globalThis.localStorage);
  return values;
}

test('renueva el acceso y reintenta el mismo producto sin perder su imagen', async t => {
  const values = sessionStorage(t);
  const payload = { title: 'Cuaderno', image: 'https://example.com/foto.jpg' };
  let writes = 0;
  let refreshes = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/token/refresh/')) {
      refreshes++;
      assert.deepEqual(JSON.parse(options.body), { refresh: 'valid-refresh' });
      return Response.json({ access: 'new-access' });
    }
    writes++;
    assert.deepEqual(JSON.parse(options.body), payload);
    return options.headers.Authorization === 'Bearer new-access'
      ? Response.json({ id: 80, ...payload }, { status: 201 })
      : Response.json({}, { status: 401 });
  });
  assert.equal((await api.createProduct(payload)).id, 80);
  assert.equal(writes, 2);
  assert.equal(refreshes, 1);
  assert.equal(values.get('patagon_access_token'), 'new-access');
});

test('no insiste ni guarda si también venció la renovación', async t => {
  sessionStorage(t);
  const paths = [];
  t.mock.method(globalThis, 'fetch', async url => {
    paths.push(url);
    return Response.json({}, { status: 401 });
  });
  await assert.rejects(api.createProduct({ title: 'Cuaderno' }), /sesión de administración venció/);
  assert.equal(paths.length, 2);
  assert.ok(paths[1].endsWith('/token/refresh/'));
});

test('dos solicitudes simultáneas comparten una renovación', async t => {
  sessionStorage(t);
  let refreshes = 0;
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/token/refresh/')) { refreshes++; return Response.json({ access: 'new-access' }); }
    return options.headers.Authorization === 'Bearer new-access' ? Response.json({ id: 1 }) : Response.json({}, { status: 401 });
  });
  await Promise.all([api.getProduct(1), api.getProduct(2)]);
  assert.equal(refreshes, 1);
});

test('permisos insuficientes no renuevan ni reintentan la escritura', async t => {
  sessionStorage(t);
  let calls = 0;
  t.mock.method(globalThis, 'fetch', async () => { calls++; return Response.json({ detail: 'Sin permisos' }, { status: 403 }); });
  await assert.rejects(api.createProduct({ title: 'Cuaderno' }), /Sin permisos/);
  assert.equal(calls, 1);
});

test('renovar conserva el archivo multipart y deja que el navegador ponga su Content-Type', async t => {
  sessionStorage(t);
  const body = new FormData();
  body.append('title', 'Cuaderno');
  body.append('image_file', new Blob(['test-image'], { type: 'image/png' }), 'test.png');
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/token/refresh/')) return Response.json({ access: 'new-access' });
    assert.equal(options.body, body);
    assert.equal(options.headers['Content-Type'], undefined);
    return options.headers.Authorization === 'Bearer new-access' ? Response.json({ id: 1 }) : Response.json({}, { status: 401 });
  });
  assert.equal((await api.updateProduct(1, body)).id, 1);
});

test('cerrar sesión durante la renovación evita restaurarla y reenviar el producto', async t => {
  const values = sessionStorage(t);
  let writes = 0;
  t.mock.method(globalThis, 'fetch', async (url) => {
    if (url.endsWith('/token/refresh/')) {
      api.logout();
      return Response.json({ access: 'new-access' });
    }
    writes++;
    return Response.json({}, { status: 401 });
  });
  await assert.rejects(api.createProduct({ title: 'Cuaderno' }), /sesión de administración venció/);
  assert.equal(writes, 1);
  assert.equal(values.has('patagon_access_token'), false);
});
