# Guardar productos

1. Inicia `start-backend.bat` desde la carpeta principal. Debe quedar abierto y mostrar el servidor en `http://127.0.0.1:8000/`.
2. Inicia sesión como administrador en la tienda y abre Catálogo de Productos.
3. Completa nombre, categoría, precio, stock y descripción. Para una foto por enlace, selecciona URL e introduce la dirección directa de la imagen.
4. Guarda el producto. Si Django se inició después de abrir la página, el formulario vuelve a comprobar la conexión al guardar.

Si Django sigue inaccesible, el formulario conserva sus datos y muestra el mensaje de conexión. Si venció el acceso, intenta renovarlo con el token de renovación y reenvía la misma solicitud una sola vez, conservando el enlace o archivo de imagen. Si también venció la renovación, pide iniciar sesión nuevamente; ese caso es distinto de un servidor desconectado. Un enlace inválido se rechaza y el producto no se crea.

La comprobación pública del catálogo puede funcionar aunque un token anterior haya vencido. Las operaciones de escritura siguen requiriendo un administrador autenticado; no se guardan cambios solamente en el navegador.

Verificación de la corrección: pruebas frontend de reconexión, sesión y envío de URL; pruebas Django de creación y edición con URL, archivo PNG con costo opcional vacío y rechazo de enlaces inválidos. Los datos de prueba se guardan en una base separada del inventario de la tienda.
