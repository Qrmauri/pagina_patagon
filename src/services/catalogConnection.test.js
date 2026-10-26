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

function mockSession(t, handler) {
  t.mock.method(globalThis, 'fetch', async (url, options) => {
    if (url.endsWith('/auth/session/')) return Response.json({ csrfToken: 'csrf-fixture', isAdmin: true });
    return handler(url, options);
  });
}

test('catálogo público usa cookies del mismo origen sin tokens del almacenamiento', async t => {
  mockSession(t, async (_url, options) => {
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.headers.Authorization, undefined);
    return Response.json([{ id: 1 }]);
  });
  assert.deepEqual(await api.getProducts(), [{ id: 1 }]);
});

test('crear producto conserva JSON y exige CSRF con sesión', async t => {
  const payload = { title: 'Cuaderno', image: 'https://example.com/cuaderno.jpg' };
  mockSession(t, async (url, options) => {
    assert.ok(url.endsWith('/products/'));
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['X-CSRFToken'], 'csrf-fixture');
    assert.equal(options.credentials, 'same-origin');
    assert.equal(options.headers.Authorization, undefined);
    assert.deepEqual(JSON.parse(options.body), payload);
    return Response.json({ id: 42, ...payload });
  });
  assert.equal((await api.createProduct(payload)).id, 42);
});

test('una sesión vencida no reintenta escrituras ni llama renovación JWT', async t => {
  let writes = 0;
  mockSession(t, async (url) => {
    assert.ok(!url.includes('/token/'));
    writes++;
    return Response.json({ detail: 'Vuelve a iniciar sesión.' }, { status: 403 });
  });
  await assert.rejects(api.createProduct({ title: 'Cuaderno' }), /iniciar sesión/);
  assert.equal(writes, 1);
});

test('permisos insuficientes no reintentan escrituras', async t => {
  let writes = 0;
  mockSession(t, async () => { writes++; return Response.json({ detail: 'Sin permisos' }, { status: 403 }); });
  await assert.rejects(api.createProduct({}), /Sin permisos/);
  assert.equal(writes, 1);
});

test('sesión conserva archivo multipart sin imponer Content-Type', async t => {
  const body = new FormData();
  body.append('image_file', new Blob(['fixture'], { type: 'image/png' }), 'fixture.png');
  mockSession(t, async (_url, options) => {
    assert.equal(options.body, body);
    assert.equal(options.headers['Content-Type'], undefined);
    assert.equal(options.headers['X-CSRFToken'], 'csrf-fixture');
    return Response.json({ id: 1 });
  });
  assert.equal((await api.updateProduct(1, body)).id, 1);
});

test('login y logout usan servidor sin guardar credenciales', async t => {
  const previous = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  const removed = [];
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    removeItem: key => removed.push(key),
    setItem: () => assert.fail('No guardar credenciales'),
    getItem: () => assert.fail('No leer tokens'),
  } });
  t.after(() => previous ? Object.defineProperty(globalThis, 'localStorage', previous) : delete globalThis.localStorage);
  const paths = [];
  mockSession(t, async (url, options) => {
    paths.push(url);
    assert.equal(options.method, 'POST');
    assert.equal(options.headers['X-CSRFToken'], 'csrf-fixture');
    return Response.json({ isAdmin: url.endsWith('/login/') });
  });
  await api.login('fixture', 'password');
  await api.logout();
  assert.ok(paths[0].endsWith('/auth/login/'));
  assert.ok(paths[1].endsWith('/auth/logout/'));
  assert.ok(removed.includes('patagon_refresh_token'));
});

test('logout fallido no informa un cierre de sesión que el servidor no confirmó', async t => {
  mockSession(t, async () => Response.json({}, { status: 500 }));
  await assert.rejects(api.logout(), /cerrar la sesión en el servidor/);
});

test('seguimiento envía solo el código en POST sin correo ni secretos en URL', async t => {
  mockSession(t, async (url, options) => {
    assert.ok(url.endsWith('/orders/track/'));
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { token: 'private-code' });
    assert.equal(options.cache, 'no-store');
    return Response.json({ id: 1, status: 'pending' });
  });
  assert.equal((await api.trackOrder('private-code')).status, 'pending');
});

test('listado de reseñas consume una página acotada y moderación usa CSRF', async t => {
  mockSession(t, async (url, options) => {
    if (options.method === 'PATCH') {
      assert.deepEqual(JSON.parse(options.body), { approved: true });
      assert.equal(options.headers['X-CSRFToken'], 'csrf-fixture');
      return Response.json({ id: 1, approved: true });
    }
    assert.ok(url.endsWith('?page=2'));
    return Response.json({ results: [{ id: 1 }], next: null, previous: 'previous' });
  });
  assert.deepEqual(await api.getTestimonials(2), [{ id: 1 }]);
  assert.equal((await api.approveTestimonial(1)).approved, true);
});
