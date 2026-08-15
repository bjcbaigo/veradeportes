# Rediseño estético: estilo "azul marino + naranja"

Llevar toda la app al look de la imagen de referencia: fondo blanco muy limpio, bloques azul marino profundo, acento naranja y tipografía negra muy gruesa.

## Dirección visual

- Fondo general: blanco casi puro (#F7F7F8), sin grises sucios.
- Color de marca principal: azul marino profundo (#0F1B3D) para tiles, banners, textos de título y barras.
- Acento: naranja (#FF6A00) solo para precios, botón de oferta, ícono activo del menú inferior y detalles.
- Títulos: display muy pesado (peso 800/900), gran tamaño, con punto final estilo "Explorá. Elegí. Encontrá.".
- Esquinas: tiles de categoría cuadradas con radio grande (~22px), tarjetas de producto blancas con radio suave y sombra mínima.

## Cambios por sección

1. Tokens (`src/styles.css`): agregar/ajustar navy como color de tinta y superficies, dejar naranja como acento, subir peso tipográfico del display; misma actualización en modo oscuro.
2. Categorías: pasar de círculos blancos a tiles cuadrados azul marino con ícono blanco al centro y etiqueta debajo en gris oscuro (como en la imagen).
3. Banner promocional: caja azul marino con texto blanco grande ("50% OFF / EN CALZADO SELECCIONADO"), botón naranja redondeado y puntos de carrusel debajo.
4. Tarjetas de producto: fondo blanco, imagen sobre gris muy claro, corazón arriba a la derecha, nombre en azul marino y precio en naranja.
5. Encabezado de secciones: título en mayúsculas azul marino + enlace "Ver más" en naranja a la derecha.
6. Header y menú inferior: header blanco con logo centrado y carrito con badge naranja; menú inferior blanco con ícono e etiqueta naranja para el activo, resto en gris.
7. Hero, Ofertas, Promo, Trust, Social, Contacto, Footer, carrito, registro y diálogo de detalle: alinear a la misma paleta y radios para que no queden pantallas con el estilo viejo.

## Alcance

Solo presentación (clases, tokens, estructura visual). No se cambian datos, catálogo, permisos ni flujos de carga/administración. La imagen subida se usa como referencia, no se incorpora al sitio.
