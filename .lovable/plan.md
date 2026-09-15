# Badges uniformes en tienda y ofertas

## Objetivo
Unificar las etiquetas de estado de todos los productos sin cambiar datos ni reglas comerciales.

## Implementación
- Crear una única presentación reutilizable para `DESTACADO`, `NUEVO` y descuentos porcentuales.
- Mantener todas las etiquetas en la esquina superior izquierda de la foto, con tamaño, altura y espaciado estables.
- Usar colores diferenciados y accesibles: naranja para descuentos, azul marino para destacados y verde para nuevos.
- Normalizar mayúsculas y evitar que textos largos deformen o desplacen la tarjeta.
- Aplicar el mismo sistema en la grilla general, el carrusel de destacados y la página de ofertas mediante la tarjeta compartida.

## Verificación
- Revisar `/tienda` y `/ofertas` en móvil y escritorio.
- Confirmar ausencia de solapamientos con el corazón, fotos, nombres y precios.
- Confirmar que selección de productos, favoritos y apertura del detalle sigan funcionando igual.
