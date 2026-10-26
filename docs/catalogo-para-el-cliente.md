# Datos que faltan para cerrar el catálogo

Estado: pendiente de información y aprobación del cliente. Los precios y existencias de la demostración no son datos comerciales confirmados.

## Mensaje para copiar y enviar al cliente

Para terminar el catálogo de Patagon necesito la lista de los productos que quieren vender en la web. Por cada producto, envíen nombre, categoría, marca/modelo o referencia, descripción, precio final en pesos chilenos, unidades disponibles y fotografías del artículo. Si tiene variantes, indiquen el precio y stock de cada una por separado. Pueden enviarlo en una planilla y acompañarlo con una carpeta de fotos; el nombre de cada foto debe coincidir con la referencia del producto. Indiquen también quién aprueba la información y la fecha en que se revisó el stock.

## Plantilla para completar

Copiar esta tabla y añadir una fila por artículo o variante. No completar precios ni stock por aproximación.

| Referencia | Nombre | Categoría | Marca/modelo | Descripción y contenido | Precio CLP | Stock | Archivo de foto | Variante | Aprobado por / fecha |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Pendiente | Pendiente | Librería / Juguetes / Electrónica | Pendiente | Pendiente | Pendiente | Pendiente | Pendiente | Si corresponde | Pendiente |

Necesitamos fotos individuales, nítidas y autorizadas para publicar. Las fotos del local sirven para presentar la tienda; no acreditan el precio ni la disponibilidad de cada artículo. Para electrónica, añadir compatibilidad y especificaciones; para juguetes, edad recomendada si está indicada en el producto; para librería, tamaño, cantidad de hojas/unidades o contenido según corresponda.

## Carga y revisión

1. Revisar los datos con el cliente; guardar su confirmación.
2. Respaldar la base de datos y las fotos antes de sustituir artículos de ejemplo.
3. Cargar artículos y fotografías desde el panel administrativo. El código interno de Librería sigue siendo `libros`.
4. Identificar y retirar manualmente los ejemplos una vez confirmada su sustitución. Esta tarea no elimina datos existentes.
5. Ejecutar desde `patagon-backend`: `python manage.py audit_catalog`.
6. El comando solo revisa campos, fotografías y posibles ejemplos; no certifica que precio y stock sean verdaderos. Eso lo confirma el cliente.

Hasta entonces se mantiene la demostración. No activar ventas reales ni presentar este documento como catálogo definitivo.
