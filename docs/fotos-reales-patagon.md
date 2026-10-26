# Fotografías reales de Patagon

Se revisaron las 27 imágenes JPG de `C:/Users/mauri/OneDrive/Desktop/imagenes patagon/` y se eligieron cinco por su variedad, encuadre y utilidad para reconocer la tienda. No se modificaron los originales.

| Archivo original | Uso | Motivo |
| --- | --- | --- |
| IMG_20261016_151442.jpg | Portada y fachada en la galería | Muestra el frente completo y permite reconocer el letrero y el turquesa del local |
| IMG_20261016_152524.jpg | Imagen principal del mosaico | Vista horizontal del interior que relaciona librería y accesorios |
| IMG_20261016_151832.jpg | Rincón de librería | Muestra papelería, materiales y artículos de escritorio |
| IMG_20261016_151757.jpg | Instrumentos | Aporta una sección distinta del local, con guitarras y ukeleles |
| IMG_20261016_151910.jpg | Accesorios | Presenta un expositor reconocible de fundas y tecnología |

Se priorizó variedad sobre publicar todas las fotos: varias repiten la caja o el mismo pasillo; algunas fachadas tienen reflejos fuertes, ramas sobre el letrero o un encuadre menos completo.

## Presentación aplicada

- La portada utiliza la fotografía real de la fachada y ofrece un enlace a «Conoce nuestra tienda». La ilustración anterior se conserva en el proyecto.
- La portada también dispone de un carrusel con las cinco fotos: avance cada 6,5 segundos, flechas, indicadores y gestos horizontales en móvil. La navegación manual o el foco en los controles detienen la reproducción hasta pulsar reproducir. Pasar el cursor por la foto o dejar la pestaña en segundo plano suspende el avance temporalmente. Con movimiento reducido se desactivan tanto el avance automático como la transición.
- Después de la selección de productos se incluye «Así es Patagon», con una imagen de interior amplia y cuatro fotos de apoyo. En tablet se organiza en dos columnas y en móvil conserva una imagen principal y miniaturas en dos columnas.
- Las fotos del mosaico enlazan a sus versiones completas en otra pestaña, con nombre accesible. El carrusel de portada es un componente local sin dependencias adicionales; la galería mantiene su distribución estática.
- Se mantienen los títulos en Pooh, los textos en Nunito y los acentos del logo.
- Las fotografías muestran el local y sus espacios; no sustituyen fotos de productos concretos ni prometen stock o precios de los artículos fotografiados.

## Preparación y archivos

Las copias están en `public/brand/store/`, en WebP y anchos 640, 960 y 1600 px. Mantienen proporción, orientación y colores; solo se redimensionan y comprimen. El encuadre de miniaturas se realiza mediante CSS y el usuario puede abrir la foto entera. No se copian metadatos EXIF a las versiones web.

Los cinco JPG originales pesan 15.183.182 bytes. Las cinco versiones de 1600 px suman 1.589.420 bytes: aproximadamente un 89,5 % menos. `srcset` permite descargar versiones menores según pantalla y densidad; solo la portada tiene prioridad alta, y la galería carga de forma diferida.

Archivos de interfaz: `src/components/StorefrontHero.jsx`, `src/components/HeroPhotoCarousel.jsx`, `src/components/HeroPhotoCarousel.css`, `src/components/StorePhotoGallery.jsx`, `src/components/StorePhotoGallery.css` y `src/pages/Home.jsx`. La navegación circular, la pausa y el reconocimiento de gestos se comprueban en `src/services/heroCarousel.test.js`.

Material de revisión: `output/store-photos/contact-sheet.jpg` (27 fotos), `selection-preview.jpg` (selección), `inventory.json` y `selected.json` (procedencia, dimensiones y pesos).

## Ideas para seguir

1. Una página «Nuestra tienda» con más fotos y ubicación cuando se confirmen dirección y horarios.
2. Fotografías de rincones por categoría, vinculadas al catálogo correspondiente.
3. Un pequeño recorrido en vídeo, grabado lentamente y con buena luz, como complemento opcional.
4. Fotos individuales sobre fondo limpio para reemplazar las ilustraciones de productos, usando sus referencias reales y sin tomar una estantería completa como foto de un artículo.

## Comprobaciones

Se inspeccionaron la hoja de contacto, varias fotos a mayor tamaño y la selección optimizada. Se verificaron la lectura y dimensiones de los 15 WebP. ESLint y compilación se ejecutan para comprobar integración. La validación visual y de consola de la página renderizada permanece pendiente por la restricción anterior del navegador integrado; la inspección de imágenes no sustituye esa comprobación.

Las fotos están incorporadas al proyecto local. Esta tarea no publica la web en un alojamiento externo.
