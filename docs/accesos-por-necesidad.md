# Accesos por necesidad de Patagon

La portada incorpora cuatro accesos debajo de las categorías: Vuelta a clases, Para la oficina, Para crear y Para regalar. Conserva las categorías existentes y la tipografía del sitio.

Los enlaces abren `/libreria?necesidad=escolar`, `/libreria?necesidad=oficina`, `/libreria?necesidad=crear` y `/juguetes?necesidad=regalos`. No se agregan rutas ni solicitudes de API. Los filtros existentes de precio, búsqueda y disponibilidad se aplican sobre esa selección. El enlace «Ver toda la categoría» elimina la selección por necesidad.

Escolar, oficina y creatividad usan coincidencias del nombre y descripción dentro de Librería, ignorando tildes y mayúsculas. Regalos reúne los juguetes. Un artículo puede aparecer en más de una selección. No se supone disponibilidad de productos ausentes: se muestra un estado vacío cuando no hay coincidencias. Para clasificaciones más precisas a futuro conviene incorporar etiquetas administrables en el catálogo; esta versión no modifica el backend.

## Presentación

Iconos de mochila, maletín, paleta y regalo; huellas decorativas excluidas de lectores de pantalla; acentos rojos, turquesa y amarillos. Cuatro columnas en escritorio, dos hasta 1024 px y una hasta 576 px. Los enlaces tienen foco visible y respetan la preferencia de movimiento mediante las transiciones compartidas.

## Archivos

- `src/components/ShoppingNeeds.jsx` y `.css`: accesos y detalles de marca.
- `src/pages/Home.jsx`: incorpora la sección.
- `src/pages/CategoryPage.jsx`: selección desde la URL, aviso y retorno a la categoría completa.
- `src/services/shoppingNeeds.js`: metadatos y filtro sin mutar productos.
- `src/services/shoppingNeeds.test.js`: coincidencias, tildes, exclusión de otras categorías, casos vacíos y parámetros desconocidos.

Validación: ESLint, compilación y pruebas de Node. La revisión visual y de consola en el navegador sigue pendiente por la restricción de acceso documentada anteriormente.
