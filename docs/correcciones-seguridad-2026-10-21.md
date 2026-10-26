# Correcciones de seguridad — 21 de octubre de 2026

## Cambios y decisiones

Se implementaron correcciones para los seis hallazgos de la [auditoría](auditoria-seguridad-2026-10-21.md).

| Hallazgo | Corrección |
| --- | --- |
| SEC-01, agotamiento de stock | Un pedido nuevo sin pagar no reserva ni descuenta unidades. La conciliación administrativa de la transferencia comprueba y descuenta stock con actualizaciones condicionales dentro de una transacción. Si falla un producto, se revierte toda la operación. |
| SEC-02, seguimiento con datos previsibles | El seguimiento exige un código aleatorio de 256 bits. Devuelve únicamente ID, estado, estado del pago y fecha. El código vence 30 días después de crear el pedido. |
| SEC-03, tokens válidos después de salir | Se retiraron los endpoints y la autenticación JWT. El cierre de sesión elimina la sesión de la base de datos: una copia de la cookie deja de autenticar. |
| SEC-04, credenciales en localStorage | Se usan sesiones Django de ocho horas, con cookie HttpOnly, SameSite=Lax y Secure en producción. Se borran las claves antiguas del navegador sin reutilizarlas. |
| SEC-05, reseñas sin moderación | Las reseñas se crean sin aprobación, aunque el cliente envíe `approved=true`. Solo el personal puede aprobarlas. Máximo 2.000 caracteres y páginas de 20 registros. El panel incluye aprobación y navegación por páginas. |
| SEC-06, datos en URLs | El enlace de correo usa un código en el fragmento, sin correo ni ID en parámetros. El fragmento no se envía al servidor HTTP. La página retira fragmento, parámetros y estado privado de navegación; consulta mediante POST. Respuestas de pedidos y sesiones usan no-store. |

### Inventario

Se eligió descontar al confirmar el pago para evitar que las solicitudes anónimas bloqueen existencias y para no introducir un servicio de reservas ni una tarea programada. Esto cambia la regla comercial: **un pedido pendiente no garantiza disponibilidad**. La interfaz lo explica. Si el producto se agotó antes de conciliar una transferencia, la API rechaza la confirmación; el personal debe resolver la disponibilidad o devolver el dinero por su procedimiento habitual. No se automatizan cobros ni devoluciones.

Las cancelaciones devuelven stock solo si ese pedido lo había descontado y una sola vez. No se permite despachar un pedido sin pago confirmado, reabrir uno cancelado ni borrarlo desde la API. Django Admin muestra los pedidos como datos de solo lectura para evitar saltarse la lógica de inventario.

### Sesiones y CSRF

Se reutiliza el almacenamiento de sesiones y la protección CSRF de Django, sin añadir bibliotecas de autenticación. El login usa una vista Django protegida con CSRF incluso para visitantes anónimos. Solo acepta personal activo. El cliente obtiene un token CSRF actual antes de cada escritura; no reintenta automáticamente escrituras ni guarda credenciales persistentes. Si el servidor no confirma el logout, la interfaz informa el error.

Los endpoints nuevos son:

- `GET /api/auth/session/`: estado administrativo y token CSRF; no devuelve credenciales de sesión.
- `POST /api/auth/login/`: usuario y contraseña, con CSRF.
- `POST /api/auth/logout/`: revocación en el servidor, con CSRF.
- `POST /api/orders/track/`: cuerpo JSON `{ "token": "código privado" }`.

Los endpoints `/api/token/` y `/api/token/refresh/` dejaron de existir. Los JWT emitidos antes del cambio no autentican ninguna ruta protegida de la API. Las respuestas protegidas sin sesión usan HTTP 403, conforme a SessionAuthentication.

Referencias: [autenticación de DRF](https://www.django-rest-framework.org/api-guide/authentication/) y [CSRF de Django](https://docs.djangoproject.com/en/6.0/ref/csrf/).

## Migración y operación

1. Guardar copia consistente de SQLite antes de desplegar; detener escrituras durante el cambio de versión.
2. Aplicar `python manage.py migrate` antes de arrancar el backend nuevo. La migración `0007_security_controls` crea códigos únicos para pedidos existentes y marca los pedidos anteriores no cancelados como inventario ya descontado. Así se evita descontar o devolver stock dos veces. No cambia cantidades ni elimina pedidos.
3. **Los pedidos antiguos pendientes conservan el inventario que ya habían descontado.** Revisarlos y cancelar los que no procedan para liberar esas unidades. No se liberaron automáticamente porque algunos pueden corresponder a transferencias en conciliación o despachos reales.
4. Las reseñas existentes también quedan pendientes de aprobación. Revisarlas desde el panel. No se publican automáticamente contenidos anteriores sin revisar.
5. Usar `VITE_API_BASE_URL=/api`. Desarrollo usa el proxy de Vite; producción, el proxy Nginx. Reiniciar los dos servidores y reconstruir el frontend para desplegar ambos lados del contrato a la vez.
6. Se necesita iniciar sesión de nuevo. Los enlaces antiguos de seguimiento con correo e ID ya no conceden acceso. El administrador puede consultar el código nuevo en el resumen del pedido y facilitarlo por un canal adecuado tras verificar al comprador. Los pedidos de más de 30 días se atienden por soporte.
7. En producción configurar HTTPS, proxy confiable y SMTP según `seguridad-produccion.md`. Sin configuración de correo, producción usa el backend dummy para no imprimir datos personales en consola; no envía confirmaciones. El comprador puede conservar el código mostrado al terminar la compra. Los errores del proveedor se registran sin datos personales ni enlaces privados.
8. Instalar y validar Nginx con `nginx -t`. El límite estricto de login ahora apunta a `/api/auth/login/`. Los límites de una plantilla no están activos hasta desplegarla.

En este workspace la migración ya fue aplicada, con copia en `patagon-backend/backups/security-before-20261021-3eb2ca14.sqlite3`. Se comprobó que conserva el número de pedidos y todas las cantidades de stock. La copia está excluida de Git por la regla de archivos SQLite.

No revertir únicamente la migración después de aceptar tráfico nuevo: los pedidos nuevos y los anteriores usan reglas de inventario distintas. Para volver a la versión anterior, detener escrituras y restaurar una copia consistente junto con esa versión, o conciliar los pedidos posteriores antes de una reversión específica.

## Verificación

- Pruebas de regresión nuevas primero fallaron con el comportamiento anterior y después pasaron.
- 60 pruebas del backend aprobadas, incluidas pruebas de migración de registros anteriores, rollback de stock de varios productos, confirmaciones repetidas, acceso con códigos válidos/inválidos/vencidos, CSRF y origen no confiable, rechazo de JWT, caducidad de sesión, revocación de cookie copiada, moderación y paginación.
- 35 pruebas frontend aprobadas; se sustituyeron las expectativas del esquema JWT por los contratos nuevos de sesión, manteniendo comprobaciones de permisos, JSON, archivos multipart, errores y ausencia de reintentos de escrituras.
- `makemigrations --check --dry-run`: sin cambios pendientes.
- `pip check`: sin incompatibilidades declaradas.
- `check --deploy`: sin errores; permanecen W005 y W021 por la política HSTS de subdominios/preload, documentada previamente. No se silenciaron.
- ESLint y compilación Vite aprobados. La compilación avisa de un chunk mayor de 500 kB; no afecta a la corrección de estos hallazgos.
- Prueba real en Edge headless sobre la compilación final y API Django temporal con SQLite en memoria: login desde el formulario, sesión conservada al recargar, cookie HttpOnly, seguimiento por enlace con retirada del código de la URL, ausencia de correo en el resultado, aprobación de reseñas desde el panel y rechazo de una cookie copiada después de salir. Sin errores JavaScript en la página administrativa. Captura móvil en `output/security-tracking-mobile.png`.
- Prueba de navegador reproducible con `node output/check_security.cjs`, después de compilar. Usa Playwright ya disponible en el entorno local y Edge; arranca y cierra sus servidores, bloquea recursos externos y nunca abre la base de datos de la tienda. Requiere los puertos 5179 y 8000 libres. Los primeros intentos detectaron restricciones del sandbox y el coste del servidor de desarrollo; la ejecución final usa la compilación servida por Vite preview y terminó correctamente.

Las auditorías actuales de avisos de dependencias siguen pendientes: npm requiere el envío de metadatos que fue rechazado por la revisión automática de permisos en la auditoría anterior; pip-audit no está instalado. No se actualizaron ni se certificaron las dependencias como libres de vulnerabilidades. Tampoco se desplegó esta versión a un alojamiento externo.


## Revisión para GitHub: 25 de octubre de 2026

Se ejecutaron nuevamente las 60 pruebas de Django y las 35 pruebas frontend, sin fallos, y la comprobación de migraciones no detectó cambios pendientes. Se aplicaron actualizaciones compatibles con `npm audit fix`, sin `--force`; la auditoría npm posterior informó cero vulnerabilidades conocidas en ese momento. Esto no sustituye una auditoría del backend ni verifica un despliegue de producción. Las exportaciones y capturas de trabajo en `output/` se conservan localmente y no se incluyen en el repositorio.
