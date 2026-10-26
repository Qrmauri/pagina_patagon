# Pooh en toda la interfaz

> Registro de una decisión anterior. La distribución actual aprobada por el usuario reserva Pooh para títulos de páginas, secciones y productos. Descripciones, precios, menús, botones y formularios usan Nunito; administración también conserva Nunito. Se implementa mediante los roles de `src/styles/typography.css`.

Por solicitud del usuario, Pooh pasa a ser la primera familia tanto de títulos como de cuerpo: textos, navegación, precios, botones, formularios y administración. Se mantienen los tamaños por rol, interlineados, paleta y afinado de títulos existentes. No se aplica contorno de afinado al cuerpo pequeño porque perjudicaría su lectura.

El archivo local de Pooh declara un único peso regular. Se desactiva la síntesis de negritas e itálicas en la interfaz; los tokens de peso quedan disponibles para los caracteres de respaldo y para un eventual cambio de fuente. La jerarquía también depende del tamaño, color y espacio.

Nunito permanece como respaldo de los caracteres que no cubre la declaración local de Pooh, incluidas tildes y ñ. La corrección de caracteres acentuados en los títulos de categoría usa explícitamente ese respaldo.

El logo público es un PNG de 661 × 377 píxeles. No contiene un tamaño tipográfico original editable; no se puede deducir de manera exacta su tamaño en puntos ni identificar con certeza la fuente solo a partir de esa imagen. La imagen del logo no se modifica.

Archivos: `src/styles/typography.css`, `src/App.css`, `src/index.css` y `src/styles/interface.css`.

Comprobaciones: ESLint y compilación. La revisión visual de textos largos, formularios y consola queda pendiente por el acceso restringido al navegador. Pooh es una fuente de dibujo expresivo y esta adopción global necesita esa comprobación de legibilidad.
