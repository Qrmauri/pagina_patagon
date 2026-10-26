# Mejoras de la tienda

## Catálogo y atención

Las categorías incorporan búsqueda, rango de precios, disponibilidad y orden.
El inicio añade disponibilidad y una sugerencia de juguete más libro, a precios
habituales y con control del stock ya agregado al carrito.
La página `/ayuda` reúne contacto, despacho, cambios y estado del pago.
Configura los campos públicos `VITE_STORE_*` de `.env.example` y reinicia Vite.
Sin datos reales, se muestran los pendientes y no se enlaza un número ficticio.

El administrador puede registrar características y costo unitario. El costo no
se devuelve a visitantes ni al seguimiento público de pedidos. Las fichas no
inventan medidas, compatibilidad o opiniones verificadas.

## Ventas y margen

El administrador puede confirmar un abono de transferencia únicamente después
de comprobarlo en su cuenta. El endpoint está protegido para personal de la
tienda; repetir la confirmación conserva su fecha original. Webpay no puede
confirmarse por esta acción. El estado de despacho y el estado de pago son
independientes. Cancelar un pedido no ejecuta un reembolso bancario automáticamente.
Los pedidos antiguos migran con pago pendiente: no se infiere
que estén pagados por su estado de despacho.

El panel cuenta pagos confirmados en pedidos no cancelados, excluye demostraciones
y calcula el ticket sin envío. El margen de productos resta el costo unitario
guardado al crear el pedido y los descuentos; no incluye gastos de despacho,
comisiones, publicidad, impuestos ni costos fijos. Si falta cualquier costo,
el margen se muestra como pendiente. Cambiar costos hoy no altera pedidos antiguos.
Las unidades más vendidas proceden de pedidos con pago confirmado.

## Correos y pagos pendientes

Los correos admiten SMTP mediante variables de entorno y usan `STOREFRONT_URL`
para seguimiento. El mensaje de registro aclara que el pago sigue pendiente,
sin indicar que el pedido ya se esté despachando. Consulta el ejemplo de variables
en `patagon-backend/.env.example`; no contiene credenciales reales.

Webpay real permanece pendiente de cuenta de comercio, credenciales e integración
con confirmación en servidor. Mantén `VITE_DEMO_MODE=true` hasta completar la
configuración comercial, verificar pagos reales, correos y condiciones de entrega.
No configures claves SMTP o Transbank con prefijo `VITE_`: serían públicas.

## Imágenes

Las ilustraciones originales PNG se conservan. La tienda consume copias WebP
de 800 píxeles y carga las tarjetas bajo demanda. Los PNG y los prompts permiten
volver a exportar los archivos. Las fotos personalizadas conservan prioridad.

## Verificación

Ejecuta `npm test`, `npm run lint`, `npm run build` y, dentro del backend,
`.venv/Scripts/python.exe manage.py test` con las variables de desarrollo.
Aplica `manage.py migrate` antes de usar campos nuevos. El lanzador existente
también aplica migraciones.
