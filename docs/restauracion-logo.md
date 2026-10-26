# Restauración del tamaño visible del logo

## Diagnóstico

Se buscaron referencias en todo el código: el PNG aparece en `Navbar.jsx` (cabecera compartida de las páginas públicas) y `Home.jsx` (footer). Login y administración no usan esta imagen. No se cambiaron esos componentes.

El único commit disponible, `cf0e73b`, define `.logo-image` con ancho 132 px y altura automática; el móvil usa 118 px. La hoja posterior `StorefrontHome.css` agrega reglas específicas: 205 px en escritorio, 130 px hasta 1100 px y 110 px hasta 768 px. En escritorio el contenedor de 180 × 90 px ocultaba el desbordamiento de un PNG de aproximadamente 205 × 117 px.

El PNG medía 661 × 377 px, con el contenido principal dentro de aproximadamente 480 × 261 px. Por ello, el tamaño CSS incluía bastante espacio transparente. La tipografía no cambia los píxeles del logo: el problema era su caja y el margen del archivo.

## Cambios

Se guardó el original sin modificar en `public/brand/originals/logo_patagon_store-removebg-preview.png`. Se recortó el PNG público al rectángulo `(96, 50, 584, 319)`, resultando en 488 × 269 px. Se detectó el contenido con alfa mayor a 16 y se conservaron 4 px de margen para los bordes; esto evita que residuos casi transparentes del fondo determinen el lienzo. Los píxeles dentro del recorte se conservaron exactamente, sin redibujar ni cambiar colores.

| Uso | Antes: caja de imagen CSS | Antes: contenido visible aproximado | Después: imagen sin margen amplio |
| --- | --- | --- | --- |
| Header, más de 1100 px | 205 × 117 px, dentro de contenedor con recorte | 148 × 81 px | 160 × 88 px |
| Header, 769–1100 px | 130 × 74 px | 94 × 51 px | 116 × 64 px |
| Header, hasta 768 px | 110 × 63 px | 80 × 43 px | 102 × 56 px |
| Footer | 180 × 104 px, `object-fit: contain` | 131 × 71 px | 160 × 88 px |

El escritorio conserva una altura visual de 88 px, en vez de reducirlo a 64 px, para que la corrección aumente su presencia respecto de la versión inmediata anterior. Los contenedores de header permanecen en 180 × 90, 130 × 76 y 110 × 62 px; el del footer sigue en 194 × 112 px. El contenido del logo cabe en todos ellos sin deformación.

Las imágenes usan una dimensión automática y `object-fit: contain`. Se especifican las dimensiones intrínsecas en JSX para reservar proporción antes de cargar. Los enlaces contenedores del logo tienen `line-height: 0` y padding cero; la imagen no depende de font-size ni de letter-spacing. No se modificó la regla global de imágenes, la paleta, las rutas ni la lógica.

## Archivos de esta corrección

- `public/logo_patagon_store-removebg-preview.png`: PNG recortado.
- `public/brand/originals/logo_patagon_store-removebg-preview.png`: copia original.
- `src/pages/StorefrontHome.css`: dimensiones y ajuste exclusivo de logos.
- `src/components/Navbar.jsx`: dimensiones intrínsecas del PNG.
- `src/pages/Home.jsx`: dimensiones intrínsecas del PNG en el footer.
- `docs/restauracion-logo.md`: este reporte.

## Comprobaciones

- ESLint y compilación correctos.
- PNG recortado inspeccionado visualmente; logo completo, proporción conservada.
- Se mantuvieron las medidas y alineaciones flex de los contenedores y se comprobó por dimensiones que la imagen cabe en escritorio, tablet y móvil.
- No se ha podido confirmar visualmente la alineación del header en una página renderizada ni revisar su consola por la restricción previa de acceso al navegador. No se presenta la inspección del PNG como prueba visual del header.
