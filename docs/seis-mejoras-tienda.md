# Seis mejoras de la experiencia Patagon

## Cambios aplicados

| Punto | Antes | Ahora |
| --- | --- | --- |
| Catálogo de librería | Selecciones inferidas del nombre y descripción | Etiquetas editables por producto. Si un producto tiene etiquetas explícitas, estas prevalecen; los catálogos antiguos sin ese campo conservan el filtro por palabras |
| Legibilidad | Descripciones pequeñas y párrafos densos | Texto de ficha y descripciones a 16 px de referencia, interlineado 1,75 y ancho de lectura existente. Se conserva Pooh en la tienda y Nunito en administración |
| Ficha de producto | Una foto y características en texto libre | Galería con hasta ocho enlaces adicionales, miniaturas con teclado y ficha de medidas, materiales, contenido y colores. Los campos vacíos no se inventan |
| Favoritos | Estado separado por tarjeta, sin página de consulta | Página `/favoritos`, enlace con contador y sincronización entre tarjetas y pestañas del mismo navegador. Los productos retirados no aparecen en la lista ni en el contador |
| Llegar al catálogo | Categorías, accesos y destacados precedían al listado completo | Accesos compactos; destacados pasan después del catálogo; categorías móviles más bajas y desplazables lateralmente |
| Información comercial | Configuración de entorno y mensajes pendientes | Sección «Datos de la tienda» en administración, persistida en Django y publicada en ayuda, ficha, carrito y checkout. Se eliminan del seguimiento el correo ficticio, el transportista inventado y la promesa fija de 24–48 horas |

## Cómo utilizarlo

1. En administración → Catálogo, crea o edita un producto. Marca las selecciones de compra correspondientes. Escolar, oficina y creatividad se ofrecen para Librería; regalos, para Juguetes. Cambiar la categoría limpia las etiquetas del formulario.
2. Completa únicamente información comprobada en medidas, materiales, contenido y colores. El texto libre de características sigue disponible.
3. Conserva la foto principal por archivo o enlace. Para la galería, agrega hasta ocho URLs HTTP o HTTPS, una por línea. Las fotos adicionales no se suben como archivos en esta versión.
4. Para preparar ejemplos, usa «Añadir ejemplos demo». Incluye cuaderno, lápices, carpeta y pinturas, todos identificados como ejemplos, con precios y stock ficticios. Solo añade títulos que faltan; no sobrescribe los productos ni sus precios existentes. Los artículos existentes requieren asignar sus propias etiquetas en edición. No se ejecutó esta acción sobre la base de datos del usuario.
5. En «Datos de la tienda», completa WhatsApp con código de país y solo dígitos, correo, horario, despacho, retiro y cambios. Un campo sin definir conserva un mensaje pendiente o el valor de entorno existente. No se activan pagos reales ni se cambian tarifas del carrito.
6. El corazón guarda favoritos en este navegador. El acceso de la cabecera abre su lista; no requiere una cuenta. Un bloqueo del almacenamiento muestra un error al intentar guardar.

Los datos de productos, fotos y condiciones reales deben ser proporcionados por la tienda. Los ejemplos preparados no se presentan como inventario real ni se añaden automáticamente a un catálogo existente.

## Archivos principales

- Backend: `catalog/models.py`, `catalog/serializers.py`, `catalog/views.py`, `productos/urls.py`, migración `0006_catalog_details_store_settings.py` y `catalog/test_catalog_enrichment.py`.
- Datos y servicios: `src/services/shoppingNeeds.js`, `productsData.js`, `productExperience.js`, `productExperience.test.js`, `storeConfig.js` y `api.js`.
- Estado compartido: `src/hooks/useFavorites.js` y `useStoreContact.js`.
- Componentes: `ProductCard.jsx`, `Navbar.jsx`, `AdminLayout.jsx`, `CheckoutForm.jsx`, `StorePurchaseInfo.jsx` y `StoreSettingsForm.jsx`.
- Páginas: `Home.jsx`, `CategoryPage.jsx` (consume las etiquetas mediante el servicio), `FavoritesPage.jsx`, `AdminProductsPage.jsx`, `ProductDetailPage.jsx`, `CartPage.jsx`, `StoreHelpPage.jsx` y `OrderTrackingPage.jsx`.
- Integración y estilos: `src/Router.jsx` y `src/styles/shopping-experience.css`.

## API y compatibilidad

Los productos añaden `shopping_needs` (lista de identificadores), `gallery` (hasta ocho URLs) y `specifications` (objeto con `dimensions`, `materials`, `contents`, `colors`). Los campos anteriores se conservan. En multipart estos tres campos se serializan como JSON; se conserva el tratamiento de costo vacío y la carga de archivos.

`GET /api/store-settings/` permite consultar solo los datos públicos de contacto y condiciones. `PUT` requiere administrador. No contiene claves de pago ni credenciales. La validación rechaza etiquetas desconocidas, esquemas de URL no permitidos, contactos inválidos y campos de ficha no admitidos.

## Datos y validación

Se respaldó SQLite en `patagon-backend/backups/before-catalog-details-20261015-231604.sqlite3` antes de aplicar la migración. Se comprobó que los ocho productos existentes conservaron exactamente sus columnas previas. La nueva tabla comercial empieza sin datos inventados.

Pruebas: 28 pruebas Node de carrito, catálogo, sesiones, favoritos y galería aprobadas; 36 pruebas Django de permisos, contactos, etiquetas y metadatos JSON/multipart, además de las comprobaciones existentes, aprobadas. ESLint y compilación correctos. La migración se aplicó y no quedan cambios de modelo sin migración.

La inspección visual y de consola en móvil, tablet y escritorio sigue pendiente por la restricción de acceso al navegador previamente encontrada. Las comprobaciones de compilación y datos no sustituyen esa revisión visual.
