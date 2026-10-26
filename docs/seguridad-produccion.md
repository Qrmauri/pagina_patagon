# Preparación de producción

Esta configuración prepara el proyecto; no publica el sitio ni configura un hosting, certificados o copias de seguridad. El catálogo comercial queda pendiente de datos reales del cliente.

## Controles aplicados

- Con `DJANGO_DEBUG=false`, HTTPS obligatorio, cookies de sesión/CSRF seguras, HSTS de una hora, protección contra iframes, `nosniff` y política de referente. Desarrollo local conserva HTTP cuando `DJANGO_DEBUG=true`.
- Clave de producción aleatoria, de al menos 50 caracteres, fuera del repositorio. No usar claves de ejemplo.
- La confianza en el encabezado del proxy está desactivada por defecto. Activar `DJANGO_TRUST_PROXY=true` solo si el backend no es accesible desde Internet y el proxy elimina y reescribe `X-Forwarded-Proto`.
- CORS sigue restringido a orígenes explícitos. CSRF permite una lista explícita mediante `DJANGO_CSRF_TRUSTED_ORIGINS`.
- En producción no se pueden sembrar productos/reseñas ficticios ni crear cupones de demostración automáticamente.
- El frontend con `VITE_DEMO_MODE=false` no recupera el catálogo de una demostración desde localStorage ni sustituye fotos del servidor por ilustraciones. Si la API falla, deja de mostrar productos y explica la indisponibilidad.
- `audit_catalog` detecta catálogo vacío, posibles ejemplos, precios vacíos/cero y fotos pendientes sin modificar registros.
- Las variantes locales de `.env` y los archivos estáticos recolectados quedan fuera de Git.

## Activación en el hosting

1. Configurar las variables de `patagon-backend/.env.example` en el entorno del servicio. Django no lee ese archivo automáticamente. Establecer `DJANGO_DEBUG=false`, clave aleatoria, dominio real en `DJANGO_ALLOWED_HOSTS` y origen HTTPS real en `DJANGO_CSRF_TRUSTED_ORIGINS`. Con el proxy del ejemplo, frontend y API comparten origen; no se necesita ampliar CORS.
2. Instalar un servidor WSGI/ASGI de producción compatible con el hosting. `runserver` y los lanzadores `.bat` son solo para desarrollo. El backend debe escuchar en loopback o red privada.
3. Configurar el proxy. `deploy/nginx.conf.example` incluye HTTPS, CSP, límites de peticiones por IP con memoria compartida y límite de subida. Es una plantilla: requiere dominio, rutas y certificados reales y `nginx -t`; no se ha aplicado ni probado en un servidor Nginx en esta máquina. Si hay CDN u otro proxy delante, configurar por separado IPs confiables y comprobar los límites.
4. Ejecutar `python manage.py migrate`, `python manage.py collectstatic --noinput` y `python manage.py check --deploy`. Servir las fotos como archivos, sin permitir ejecución. La plantilla publica la API y el panel React `/admin`; no expone Django Admin.
5. Solicitar el catálogo mediante `docs/catalogo-para-el-cliente.md`, cargarlo, revisar ejemplos existentes y ejecutar `python manage.py audit_catalog`. Configurar correos reales y respaldos de base de datos/media. No se han borrado los ejemplos de la base de datos local.
6. Copiar `.env.production.example` a la configuración de compilación, completar datos y generar el frontend. Ninguna variable `VITE_*` puede contener secretos: se incluye en el navegador.
7. Comprobar en el dominio real HTTPS, cookies, cabeceras, login, permisos, límites, carga de imágenes, recuperación de datos y compra de prueba. Webpay real sigue pendiente y no se habilita con esta tarea.

## HSTS: decisiones pendientes del dominio

No se activa por defecto ni `includeSubDomains` ni `preload`: afectan a todo el dominio y requieren confirmar HTTPS en todos los subdominios. Por ello `check --deploy` puede informar W005/W021. No se silencian. Las cuatro advertencias iniciales (W004, W008, W012 y W016) se resuelven con los valores de producción.

`DJANGO_HSTS_INCLUDE_SUBDOMAINS` y `DJANGO_HSTS_PRELOAD` se pueden activar tras decidir la política del dominio. Publicar en una lista de preload requiere además cumplir sus condiciones; cambiar una variable no realiza esa publicación.

## Límites y revisión posterior

Desde el 21 de octubre de 2026, la administración usa sesiones nativas de Django con cookie HttpOnly, protección CSRF y revocación en el servidor al cerrar sesión. Los endpoints JWT antiguos se retiraron. Frontend y API deben compartir origen mediante el proxy Vite en desarrollo y Nginx en producción. Los límites del ejemplo Nginx solo son efectivos una vez instalados y configurados en el alojamiento. Ver [correcciones y migración](correcciones-seguridad-2026-10-21.md).

No se considera auditoría integral ni garantiza ausencia de vulnerabilidades. La aprobación de `check --deploy` no comprueba el catálogo, las reglas del negocio, el hosting ni la integración de pagos.

## Pruebas locales

Ejecutar `npm test`, `npm run lint` y `npm run build`. Para el backend, ejecutar `python manage.py test catalog --noinput` con `DJANGO_DEBUG=true` en el entorno del comando (las pruebas aíslan los controles HTTPS). Comprobar producción en otro comando con `DJANGO_DEBUG=false` y una clave de prueba aleatoria, sin cambiar los secretos reales.

## Referencias oficiales

- https://docs.djangoproject.com/en/6.1/howto/deployment/checklist/
- https://docs.djangoproject.com/en/6.1/ref/settings/#secure-proxy-ssl-header
- https://nginx.org/en/docs/http/ngx_http_limit_req_module.html
- https://nginx.org/en/docs/http/ngx_http_proxy_module.html#proxy_set_header
- https://reactrouter.com/changelog


## Resultado de esta revisión — 19 de octubre de 2026

- 33 pruebas frontend y 46 del backend aprobadas. ESLint y compilación aprobados. `pip check` sin incompatibilidades.
- `npm audit`: ocho avisos iniciales, cero después de doce actualizaciones compatibles. React Router DOM queda en 7.18.4 y el mínimo declarado también se eleva a esa versión. Los paquetes se actualizaron sin ejecutar scripts de instalación.
- `pip-audit` sobre las versiones declaradas en requirements: tres avisos iniciales, cero después de actualizar Django a 6.1.1 y PyJWT a 2.15.0. La auditoría usa `--no-deps --disable-pip`; no equivale a revisar paquetes adicionales ajenos al archivo. Las actualizaciones se instalaron como wheels en el entorno del proyecto y se repitieron las pruebas del backend.
- `check --deploy`: sin errores; quedan W005 y W021 por las decisiones de subdominios/preload explicadas arriba. No se han silenciado.
- `audit_catalog` detecta seis artículos de ejemplo en la base local. El comando termina con error de preparación, como corresponde, y no modifica registros.
- La revisión visual nueva del modo real no pudo completarse por desconexión del depurador del navegador. La separación de catálogo real/demo se verifica con las pruebas automatizadas. El servidor temporal se detuvo y la demostración existente se conserva.
- Nginx, certificados, dominio, límites de tráfico externos, almacenamiento y restauración de respaldos requieren validación en el hosting final. No se ha desplegado esta configuración.
