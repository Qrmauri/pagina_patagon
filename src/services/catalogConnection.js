export async function ensureCatalogConnection(available, reconnect) {
  if (available) return;
  const catalog = await reconnect();
  if (!Array.isArray(catalog)) {
    throw new Error('No pudimos conectar con el backend. Inicia start-backend.bat y vuelve a guardar; los datos del formulario se conservan.');
  }
}
