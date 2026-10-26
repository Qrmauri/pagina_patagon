# Identidad visual de Patagon Store

Referencia: logo original de la tienda y portada con fachada elegida por el usuario.
Objetivo: reconocer la marca y encontrar productos con claridad.

- Turquesa del logo para identidad y navegación; variante oscura para texto y contraste.
- Rojo para acciones de compra y amarillo para acentos, nunca como texto pequeño sobre blanco.
- Pooh se mantiene en títulos principales por su forma redondeada; Nunito de peso alto organiza categorías y secciones, con texto normal para lectura y precios.
- Fachada como imagen principal; categorías con acentos de los tres colores del logo.
- Fondos turquesa suaves y superficies blancas; evitar colores ajenos a la marca y texto decorativo en formularios.
- En celular, categorías apiladas, lectura sin desplazamiento horizontal y controles de al menos 44 px.

## Refinamiento con referencias UI UX Pro Max

Fuente consultada: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/blob/main/.claude/skills/ui-ux-pro-max/SKILL.md
UI UX Pro Max no estaba instalada localmente. Se consultaron sus criterios públicos y se implementó con la skill frontend-ui-engineering; no se ejecutó su generador ni se atribuyen resultados a una búsqueda local de su base de datos.

Aplicación: Librería primero, acceso directo desde portada, mensaje Ideas para crear y jugar, categorías con rojo/turquesa/amarillo y tonos suaves, iconos SVG consistentes y enlaces útiles en la sección de ayuda. Logo original en el pie. Control móvil del título en dos líneas y ausencia de desbordamiento horizontal. Verificados enlace a Librería y logo del pie; capturas patagon-ui-ux.png y patagon-ui-ux-mobile.png en output/selected-design.

## Detalles propios de la marca

Se añadió una huella decorativa vectorial inspirada en el logo, sin sustituir el logotipo original. La selección destacada se presenta como El rincón Patagon y usa superficies suaves por familia: librería amarilla, juguetes roja y electrónica turquesa. Las fichas repiten el código de color e iconos Phosphor para vista rápida, favoritos y carrito. La huella es decorativa y no recibe foco. Se redujo el desplazamiento al pasar el puntero y se mantuvieron los estados de foco y movimiento reducido.

Verificación: portada de escritorio, catálogo de celular sin desbordamiento y apertura/cierre de vista rápida. Evidencia: output/selected-design/patagon-identidad-plus.png y patagon-catalogo-plus-mobile.png.

## Pooh más ligera y detalles de papelería

Pooh es una fuente estática con un solo peso: @font-face declara ahora 400. En títulos principales sobre blanco y en la portada se aplica un contorno del color de la superficie para reducir visualmente el grosor sin sustituir la familia ni alterar el archivo original. El ajuste se reduce en móvil.

Se añadieron etiquetas Escolar, Oficina, Manualidades y Libros en la portada, un rayado muy suave de cuaderno tras el catálogo, indicadores circulares en las categorías y una franja de los tres colores en el pie. Las etiquetas son informativas, no controles.

ESLint y compilación verificados. La comprobación visual de esta revisión quedó pendiente porque el navegador integrado rechazó el acceso por su política de URL; no se intentaron vías alternativas.

## Revisión de composición de la tienda

Cambios implementados: Librería encabeza el menú, NavLink identifica la sección activa, la firma Patagon Store aparece en la portada, las categorías tienen un encabezado más compacto y la promoción genérica se reemplazó por Las buenas ideas dejan huella. El nuevo bloque utiliza la huella decorativa existente, tres iconos del sistema y la paleta del logo; el título conserva Pooh afinada. La composición usa dos columnas en escritorio y una en móvil, con enlaces de al menos 44 px.

Alcance de evidencia: revisión de código y compilación. No se considera una auditoría visual completa: el navegador integrado rechazó el acceso en la revisión anterior, por lo que no se reutilizan capturas antiguas como prueba de estos cambios.


## Aplicación de los seis puntos — 19 de octubre de 2026

1. Se unifican sugerencias del buscador, navegación y colores del checkout con los tokens del logo. Librería usa dorado, Juguetes rojo y Electrónica turquesa; la compra usa rojo y la información turquesa oscuro.
2. Pooh 400 y Nunito se conservan. BrandText compone acentos sobre letras Pooh en los títulos principales del catálogo, categorías, productos y galería. El texto accesible conserva las tildes y ñ originales. El OTF y el logo no se modifican. El afinado se reduce a .025em para conservar los trazos.
3. La huella firma encabezados y estados vacíos de inicio, categorías y favoritos; los tres puntos del logo acompañan la selección destacada. Los elementos decorativos no reciben foco.
4. Navegación y accesos de categorías utilizan iconos Phosphor duotone: lápiz, puzle y rayo. Buscar, precio y acceso administrativo también usan la misma biblioteca. Las imágenes de producto se reservan para catálogo y fotografía.
5. El inicio prioriza presentación, categorías, selección, catálogo y tienda real. Necesidades, combinaciones, reseñas y guía de compra se conservan en desplegables nativos. Los enlaces de categorías y el catálogo completo siguen disponibles.
6. La historia incorpora fachada, papelería, instrumentos y accesorios visibles en las fotos reales, con enlace al recorrido fotográfico. No se inventan fundadores, antigüedad, ubicación ni horarios; esos datos deben aportarse antes de ampliar la historia humana.

Validación: 30 pruebas frontend aprobadas, ESLint y compilación aprobados. Revisión visual actual de portada y Librería en navegador local; controles desplegables, búsqueda vacía y navegación comprobados. Vista móvil de 390 px sin desbordamiento y sin errores de consola capturados. No se afirma auditoría WCAG completa ni validación de pagos/backend. Capturas en output/identity-review/desktop.png, libreria.png, mobile.png y mobile-libreria.png. Las capturas pueden incluir controles de extensiones del navegador que no pertenecen al sitio.


## Huellas y trazos de lápiz — 19 de octubre de 2026

Se añaden dos separadores con tres huellas y rayados a mano: después de las categorías y antes del relato del local. La palabra «crear» lleva un subrayado de lápiz. Los márgenes de escritorio repiten más huellas y trazos, con opacidad moderada. En móvil se reducen los separadores y se mantienen ocultos los adornos de margen para preservar el espacio de lectura.

Los SVG son decorativos, no reciben foco, no capturan clics y no tienen animación. Usan exclusivamente tonos de la paleta del logo. No se cambian fuentes, fotografías, datos ni lógica de compra. ESLint y compilación aprobados; revisión visual actual de escritorio y móvil de 390 px sin desbordamiento horizontal. Capturas: output/identity-review/huellas-escritorio.png y huellas-movil.png.
