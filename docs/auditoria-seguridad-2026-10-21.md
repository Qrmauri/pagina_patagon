# Auditoría de seguridad — 21 de octubre de 2026

**Seguimiento:** posteriormente se implementaron [correcciones para los seis hallazgos](correcciones-seguridad-2026-10-21.md). Este informe conserva la evidencia del estado anterior; consultar ese documento para el comportamiento nuevo y sus límites.

## Resultado

Se identificaron seis hallazgos: dos de prioridad alta (P1) y cuatro de prioridad media (P2). Los dos primeros deberían corregirse antes de aceptar pedidos reales. No se modificó el código de la aplicación ni se aplicaron actualizaciones de dependencias.

Skills utilizadas: `using-agent-skills`, `security-and-hardening` y `code-review-and-quality`. Se revisó la disponibilidad de un grafo de arquitectura; no existe `graphify-out/graph.json`.

## Alcance y método

- Revisión del árbol de trabajo actual, incluidos cambios locales previos: React, cliente API, autenticación, Django, modelos, serializadores, rutas y plantilla Nginx.
- Activos: credenciales administrativas, datos de compradores, inventario y reputación de la tienda.
- Fronteras: navegador/API pública, API/administración, entradas/base de datos, aplicación/correo y proxy/backend.
- Casos de abuso: agotar stock sin pago, consultar datos ajenos, reutilizar credenciales copiadas y publicar contenido masivo sin moderación.
- Comprobaciones de comportamiento con APIClient, HTTPS simulado, `DEBUG=false`, clave efímera y base SQLite exclusivamente en memoria. No se enviaron correos externos: se usó el backend de correo en memoria.
- Suite existente del backend con base de pruebas aislada; pruebas del frontend; compatibilidad de paquetes Python; revisión de configuración de producción.

No se examinó un despliegue real, certificados, firewall, configuración efectiva de Nginx, respaldos ni registros reales. APIClient no atraviesa Nginx. No se hizo una prueba de carga ni una auditoría completa del historial Git.

## Hallazgos

### SEC-01 · P1 alta · Agotamiento de inventario mediante pedidos sin pagar

**Ubicación:** `patagon-backend/catalog/views.py:197`, especialmente líneas 242–248; `patagon-backend/catalog/models.py:43`.

La creación anónima de pedidos descuenta inmediatamente todas las unidades solicitadas y guarda el pago como pendiente. No se encontró vencimiento de reservas ni liberación automática de inventario. El stock se devuelve mediante cancelación administrativa, que requiere intervención.

**Evidencia:** un producto de prueba con cinco unidades quedó en cero después de una sola petición anónima que solicitó cinco unidades. Respuesta HTTP 201; `payment_status=pending`. No se realizó ningún pago.

**Impacto:** un visitante puede impedir la venta de productos sin pagar. El límite general de 10 solicitudes por segundo de la plantilla Nginx no impide este caso: basta una solicitud por producto.

**Corrección propuesta:** implementar reservas con vencimiento y liberación automática e idempotente; limitar unidades y reservas pendientes según reglas comerciales. Confirmar existencias y consumo definitivo al validar el pago. Probar caducidad, cancelación y concurrencia.

### SEC-02 · P1 alta · Datos personales accesibles con ID secuencial y correo

**Ubicación:** `patagon-backend/catalog/views.py:310–331`; campos de respuesta en `patagon-backend/catalog/serializers.py`, `OrderSerializer`.

El seguimiento público utiliza un ID numérico y el correo como única comprobación de acceso. El correo no acredita control del buzón y el ID es secuencial. Después de una coincidencia se devuelve el serializador completo del pedido.

**Evidencia:** una consulta sin autenticación devolvió HTTP 200 e incluyó `address`, `customer_phone`, `customer_name` y `postal_code`, además de productos e importes. La prueba conocía el correo del comprador; no se demostró acceso sin ese dato.

**Impacto:** alguien que conozca un correo puede recorrer números de pedido y obtener direcciones, teléfonos e historial de compras. La aplicación no configura throttles y la plantilla Nginx aplica al seguimiento únicamente su límite general, sin protección por comprador o pedido.

**Corrección propuesta:** exigir una prueba de acceso, por ejemplo autenticación del comprador o un token aleatorio de alta entropía, con alcance y vencimiento, entregado al buzón. Usar una respuesta mínima para seguimiento; proteger intentos por recurso y evitar diferencias que faciliten enumeración.

### SEC-03 · P2 media · Cerrar sesión no revoca los JWT copiados

**Ubicación:** `src/services/api.js:90–92`; `patagon-backend/productos/settings.py:147–150`; rutas JWT en `patagon-backend/productos/urls.py:95–96`.

El cierre de sesión elimina los tokens del navegador, sin invalidarlos en el servidor. El acceso dura un día y la renovación siete días. No hay blacklist instalada, rotación ni endpoint de revocación.

**Evidencia:** un token de acceso conservado por otro cliente permitió leer pedidos administrativos (HTTP 200). El mismo token de renovación se aceptó dos veces consecutivas (HTTP 200 y 200). El cierre de sesión se verificó mediante inspección del cliente: solo borra las dos claves locales; no se simuló un navegador.

**Impacto:** si alguien copia los tokens antes del cierre de sesión, puede seguir accediendo y renovando durante su vigencia. La prueba no demuestra un mecanismo para robarlos.

**Corrección propuesta:** revocar renovaciones en el servidor al salir, habilitar rotación y detección de reutilización, y reducir la duración de acceso. La blacklist de SimpleJWT cubre renovaciones; para invalidación inmediata del acceso se necesita además un mecanismo de sesión o revocación comprobado en cada petición.

Referencia: [Blacklist de SimpleJWT](https://django-rest-framework-simplejwt.readthedocs.io/en/stable/blacklist_app.html).

### SEC-04 · P2 media · Tokens administrativos persistentes accesibles a JavaScript

**Ubicación:** `src/services/api.js:82–85`, también líneas 28–29.

Los tokens de acceso y renovación se almacenan en `localStorage`, compartido por los scripts que se ejecutan en el mismo origen de la tienda. Las opciones `SESSION_COOKIE_HTTPONLY` de Django no protegen estos JWT.

**Evidencia:** inspección directa de las escrituras y lecturas del cliente API. No se identificó una vía explotable de XSS durante esta auditoría; el hallazgo describe la exposición de credenciales si un script del origen resulta comprometido.

**Impacto:** una inyección de script o dependencia comprometida podría extraer credenciales administrativas persistentes; SEC-03 prolonga su utilidad.

**Corrección propuesta:** migrar a sesiones o renovaciones en cookies `HttpOnly`, `Secure` y `SameSite`, con protección CSRF apropiada; evitar guardar credenciales persistentes en almacenamiento accesible a JavaScript. Evaluar separar el origen administrativo y mantener CSP estricta como defensa adicional.

Referencia: [OWASP: almacenamiento local y sesiones](https://cheatsheetseries.owasp.org/cheatsheets/HTML5_Security_Cheat_Sheet.html).

### SEC-05 · P2 media · Reseñas anónimas publicadas sin moderación ni límite de texto

**Ubicación:** `patagon-backend/catalog/views.py:334–345`; `patagon-backend/catalog/models.py:107`; `patagon-backend/productos/settings.py:142`.

Crear y listar testimonios permite acceso anónimo. La lista incluye todos los registros; no existe estado de aprobación, comprobación de compra, longitud máxima de comentario ni paginación.

**Evidencia:** una reseña anónima de 100.000 caracteres recibió HTTP 201 y apareció inmediatamente en el listado público con la misma longitud. No se enviaron múltiples solicitudes de carga.

**Impacto:** publicación de testimonios falsos, suplantación de nombres, contenido abusivo y crecimiento del almacenamiento y las respuestas. El límite de frecuencia de Nginx no limita el número total de registros ni la longitud del comentario.

**Corrección propuesta:** moderación antes de publicar, límite explícito de caracteres, paginación y controles de abuso. Si se requieren reseñas de compradores, vincularlas a una compra verificada y limitar su número por compra.

### SEC-06 · P2 media · Los datos de acceso al seguimiento se incluyen en URLs

**Ubicación:** `patagon-backend/catalog/views.py:261`; `src/services/api.js:228`; `src/pages/OrderTrackingPage.jsx:63`.

El correo y el número de pedido se incluyen tanto en el enlace de seguimiento como en la consulta GET de la API. Esa combinación funciona actualmente como credencial de acceso a datos personales, según SEC-02.

**Evidencia:** construcción explícita de las URLs en los tres puntos indicados. La prueba confirma el uso de la combinación para consultar el pedido; no se inspeccionaron registros reales.

**Impacto:** la combinación puede persistir en historial del navegador y registros de acceso del proxy, herramientas de observabilidad o enlaces compartidos. HTTPS protege el tránsito, pero no elimina esos registros. La política de referente reduce filtraciones a otros orígenes; no se afirma que el enlace se filtre a toda página externa.

**Corrección propuesta:** evitar PII en URLs y no usar el correo como secreto. Si se envía un enlace de acceso, usar un token limitado, intercambiarlo por una sesión, retirarlo de la barra de dirección y redactarlo en logs. Aplicar `Cache-Control: no-store` a respuestas con datos personales y revisar retención de registros.

## Controles existentes verificados

- Cambios de catálogo, consulta administrativa de pedidos y confirmación de transferencias requieren `IsAdminUser`.
- Precio, coste de envío, descuentos y totales de pedidos se calculan con datos del servidor.
- Los costes internos se eliminan de las respuestas públicas revisadas.
- Producción exige una clave y fuerza HTTPS, cookies seguras y cabeceras básicas; no confía en el proxy salvo activación explícita.
- CORS usa una lista explícita. Los datos demo se bloquean en producción.
- No se encontraron usos de `dangerouslySetInnerHTML`, `innerHTML` ni `eval` en el código revisado. Esto no demuestra ausencia de toda forma de XSS.

## Verificación y limitaciones

| Comprobación | Resultado |
| --- | --- |
| `npm test` | 35 pruebas aprobadas |
| `.venv/Scripts/python.exe manage.py test catalog --noinput` con entorno local de prueba | 46 pruebas aprobadas |
| Pruebas de abuso con APIClient y SQLite en memoria | Confirmados SEC-01, SEC-02, publicación masiva individual de SEC-05 y reutilización de SEC-03 |
| `.venv/Scripts/python.exe -m pip check` | Sin incompatibilidades declaradas |
| `check --deploy` con `DEBUG=false` y clave efímera | Sin errores; advertencias W005 y W021 sobre HSTS para subdominios y preload |
| Versiones Python instaladas frente a `requirements.txt` | Coinciden las diez dependencias declaradas |
| Búsqueda de firmas de claves privadas, AWS, GitHub y OpenAI en archivos de texto rastreados | Sin coincidencias; no cubre todos los formatos ni el historial |
| `npm audit --json` | No completado: fallo DNS en sandbox y consulta externa rechazada por revisión automática de permisos |
| `pip-audit` | No disponible en el entorno `.venv`; auditoría de avisos Python no completada |

W005 y W021 están documentadas como decisiones pendientes del dominio. No se recomienda activar subdominios/preload sin comprobar sus requisitos.

La plantilla Nginx contiene CSP y límites compartidos por IP para API y login, pero no está desplegada ni validada aquí. No se considera que esos controles estén activos por existir el archivo. DRF también advierte que sus throttles de aplicación no sustituyen una defensa contra ataques de fuerza bruta o denegación de servicio: [documentación oficial](https://www.django-rest-framework.org/api-guide/throttling/).

El backend de correo predeterminado es consola, incluso sin DEBUG. Si el operador omite la configuración SMTP, imprime la confirmación con dirección y enlace de seguimiento. La plantilla de entorno ya propone SMTP; comprobar la configuración efectiva y redactar PII en logs antes de producción.

No se certifica que las dependencias estén libres de vulnerabilidades conocidas. El informe anterior del 19 de octubre no sustituye una consulta actual. `pip check` revisa compatibilidad, no avisos de seguridad.

## Orden de corrección

1. Corregir reservas de inventario y acceso al seguimiento (SEC-01 y SEC-02).
2. Diseñar conjuntamente revocación y almacenamiento de sesiones administrativas (SEC-03 y SEC-04).
3. Moderar y acotar reseñas; retirar datos personales de URLs y revisar logs (SEC-05 y SEC-06).
4. Completar auditoría actual de dependencias y validación de controles en el alojamiento final.

La consulta a npm queda pendiente de autorización explícita: el servicio recibe metadatos del árbol de dependencias, que podrían incluir nombres de paquetes privados. La revisión automática rechazó ese envío; no se intentó otro canal para eludirla.
