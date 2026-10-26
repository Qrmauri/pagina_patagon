# Sistema tipográfico Patagon y aplicación

## Decisiones

Se conserva Pooh 400 para títulos expresivos y Nunito 400/500/600/700 para lectura, controles y secciones. Las fuentes usan swap. Se retiraron de la solicitud de Nunito 800/900 después de migrar sus declaraciones a bold 700. La administración y la pantalla de error usan la familia de lectura del sistema. No se instalaron paquetes nuevos.

Pooh mantiene su limitación de caracteres ASCII: las tildes y ñ siguen recurriendo a Nunito. El archivo original de la fuente no se alteró. Su afinado visual usa el token --display-thinning y el color de la superficie; no se presenta como un peso real adicional.

## Fuente de verdad

src/styles/typography.css define las familias, pesos, escala 1,25, títulos fluidos con rem y clamp, interlineados 1,15/1,25/1,5/1,6, tracking por rol, medida de lectura de 65ch y espacio en pasos de 4 px sobre una raíz predeterminada de 16 px. La raíz es 100% y respeta la preferencia del navegador. Existen bases para h1–h6, párrafos, small, enlaces, controles, etiquetas, listas y código. El código mantiene el respaldo monoespaciado nativo del navegador, sin cargar otra fuente.

Tamaños de lectura: small .875rem y base 1rem. Escala superior: 1.25rem, 1.5625rem, 1.953125rem, 2.44140625rem y 3.0517578125rem. Los títulos usan roles fluidos; las secciones funcionales usan Nunito y las expresivas Pooh. Los precios tienen un rol con cifras tabulares.

## Archivos de aplicación modificados

| Archivo | Cambio |
| --- | --- |
| index.html | Nunito 400/500/600/700, manteniendo swap y español. |
| src/Router.jsx | Importación del sistema de estilos; rutas sin cambios. |
| src/styles/typography.css | Tokens, bases, roles, ancho de lectura y ajustes responsive. |
| src/index.css | Tamaños e interlineado base referenciados a tokens. |
| src/App.css | Migración de tamaños, pesos, tracking e interlineado; selectores de headings corregidos. |
| src/pages/StorefrontHome.css | Estilos de marca migrados a tokens y títulos fluidos. |
| src/pages/CartPage.css | Tipografía del carrito, avisos y controles migrada. |
| src/components/AdminLayout.jsx | Nunito, tokens y texto legible sobre navegación oscura. |
| src/components/CartDrawer.jsx | Título h2 y productos h3. |
| src/components/CheckoutForm.jsx | Tipografía de etiquetas, avisos y controles. |
| src/components/ErrorBoundary.jsx | Familia y tamaños consistentes. |
| src/components/Navbar.jsx | Tipografía y texto secundario. |
| src/components/OrderReceiptModal.jsx | Familia, tamaños y pesos del comprobante. |
| src/components/ProductCard.jsx | Texto auxiliar con mínimo de 14 px sobre raíz estándar. |
| src/components/TestimonialsSection.jsx | Tipografía del formulario y reseñas. |
| src/pages/AdminLoginPage.jsx | Familia, título fluido y controles. |
| src/pages/AdminProductsPage.jsx | Tokens y h2 para secciones principales; contraste de acciones y métricas. |
| src/pages/CartPage.jsx | Tokens y título de página fluido. |
| src/pages/CategoryPage.jsx | Título fluido y h2 explícito para el catálogo. |
| src/pages/Home.jsx | Encabezados h2 del pie y texto claro sobre fondo oscuro. |
| src/pages/OrderTrackingPage.jsx | Tokens; encabezado de contenido del paquete h3. |
| src/pages/ProductDetailPage.jsx | Tokens, estado de carga semántico, encabezado de información y pestañas que pueden envolver. |

Documentación: este archivo. Utilidad de migración utilizada: output/migrate_typography.py. La compilación también regenera dist. No se cambiaron servicios, API, estados, condiciones de negocio ni rutas.

## Antes y después

- Se detectaron 439 declaraciones numéricas de tamaño, 180 entre 10 y 13 px. La búsqueda estática final no encuentra tamaños font-size/fontSize fijos en px en los JSX y CSS heredados; los estilos ahora referencian tokens.
- Peso 800/900 disperso: ahora bold 700. Pooh conserva 400.
- Párrafos sin medida de lectura general: ahora límite de 65ch en las superficies principales.
- Categorías h1 seguidas de fichas h3: ahora se introduce un h2 de listado. Administración y carrito lateral también corrigen los saltos identificados.
- Texto gris #9ca3af sobre blanco (2,54:1): ahora variante de tinta secundaria para esas declaraciones directas en superficies claras.
- Acción con blanco sobre #059669 (3,77:1) y controles naranjas #f26419 (3,18:1): ahora variantes oscuras de marca (turquesa 5,50:1 o rojo 5,65:1 sobre blanco).
- Texto de métricas #16a34a sobre blanco (3,30:1): ahora turquesa oscuro. Los fondos oscuros conservan un rol específico de texto claro.
- Las pestañas del producto pueden pasar a otra línea, los pasos del carrito pueden envolver y la selección destacada adapta sus columnas en móvil.

## Validación y límites

22 pruebas frontend aprobadas. ESLint y compilación de producción aprobados. Los cálculos de contraste corresponden a pares sólidos detectados en código; no constituyen certificación WCAG de todos los estados renderizados.

La consola y la revisión visual de móvil/tablet/escritorio permanecen sin verificar: el navegador integrado rechazó el acceso por su política de URL en esta sesión. No se intentaron mecanismos alternativos para eludir el bloqueo ni se usaron capturas antiguas como prueba de esta migración. La limitación de glifos acentuados de Pooh sigue pendiente y se comunica al usuario.

## Cierre de aplicación — Fase 3

Se revisó la migración previamente aplicada y se corrigieron los elementos restantes:

| Archivo | Remate de Fase 3 |
| --- | --- |
| src/pages/AdminProductsPage.jsx | Subsecciones de analítica h3 en lugar de h4, bajo su h2. Estrellas de reseñas con dorado oscuro. |
| src/App.css | Selector de subtítulos de analítica actualizado a h3 y estrellas con el dorado de texto de la marca. |
| src/pages/OrderTrackingPage.jsx | Pasos futuros legibles con el rol text-muted; no cambia la condición ni el estado del seguimiento. |
| src/components/TestimonialsSection.jsx | Introducción limitada por el token de 65ch; estrellas claras/oscuras sustituidas por colores de texto con mayor contraste. |

La búsqueda estática no encuentra tamaños font-size/fontSize fijos en px en los JSX/CSS de src. Los pesos e interlineados se refieren a tokens. Las excepciones restantes de #9ca3af corresponden a bordes, fondos o controles deshabilitados, no a las etiquetas futuras del seguimiento.

Comprobaciones de esta fase: ESLint y compilación aprobados. No se repitieron pruebas de negocio por cambios exclusivamente de estilos y niveles de headings. No se modificaron API, rutas, estados ni eventos. Sigue pendiente la validación visual y la consola del navegador por la limitación de acceso documentada; no se afirma conformidad WCAG completa.
