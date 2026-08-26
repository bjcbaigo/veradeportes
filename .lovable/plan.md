# Auditoría móvil /tienda (320-430 px) — diagnóstico y recomendaciones

Medido con navegador real en 320, 360, 375, 390, 412 y 430 px. El layout es estable: `scrollWidth === clientWidth` en los seis anchos (no hay scroll horizontal de página; los desbordes detectados son carruseles internos, correctos). Bottom nav 67 px + padding de página reservado: no tapa contenido. FAB de WhatsApp 56x56 px, sin solaparse con la nav.

## Severidad Alta

1. **Imágenes de producto rotas en varias fichas** (ON Cloudrunner 3, Skechers GO WALK, NB 520 V9, Adidas Response Runner 2, FILA Court, Adidas Questar 4, FILA Progress Kids). Se ve el texto `alt` dentro de la card, rompiendo la grilla y la legibilidad. Es el problema visual más grave en móvil, por encima de cualquier ajuste de espaciado. Requiere revisar las URLs de esas filas en la planilla.
2. **Logo del header sub-dimensionado**: la imagen mide **36x36 px** reales en todos los anchos (h-9), con el lockup de texto a 12 px. Se percibe pequeño y pierde presencia de marca.
   - Recomendado: logo **44 px** de alto (2.75rem) en ≥360 px y **40 px** en 320 px; texto del lockup a **14 px** (0.875rem), peso 900, `leading-none`.
   - Altura del header: de 58 px a **64 px** (4rem) en móvil para acompañar sin agrandar de más.
3. **Doble buscador**: hay un buscador en el bloque superior y otro dentro de "PRODUCTOS" con placeholder distinto. Duplica función y consume ~110 px de alto útil. Recomendado dejar solo el superior (sticky) y en el bloque de productos mantener únicamente los chips de categoría.

## Severidad Media

4. **Cards con ancho fijo en la grilla**: las cards miden **154 px** incluso a 430 px, dejando aire lateral y bandas irregulares. Recomendado que en la grilla usen ancho fluido (`w-full`, `grid-cols-2`, gap 10-12 px) y reserven el ancho fijo solo para los carruseles horizontales.
5. **Áreas táctiles por debajo de 44 px**:
   - Botón favorito (corazón): **32x32** → subir a **40x40** (icono 18 px), sin cambiar posición ni color.
   - Chips de categoría: alto **30 px** → **36-38 px**, padding vertical 8 px.
   - Enlaces "Ver mas" / "Ver todos": alto **16 px** → agregar padding para caja táctil de **≥40 px** (el texto puede seguir igual).
   - Botón "BUSCAR" dentro del input: **69x32** → alto **36-40 px**.
6. **Precio anterior a 10 px**: al límite de legibilidad. Recomendado **11-12 px** con `line-through` y color `muted-foreground` (sin tocar el precio principal, que a 14-16 px está bien).
7. **Título de producto**: 12 px con `min-h-[34px]`; a 320 px queda a 3 líneas visualmente apretadas. Recomendado **13 px** con `leading-tight` y `line-clamp-2` firme.

## Severidad Baja

8. **Promo/carrusel de 120 px de alto** compite en jerarquía con el hero de marca: podría subir a **132-140 px** para que el CTA "VER OFERTAS" respire, o dejarse igual (no es un defecto).
9. **Separación entre secciones** ("DESTACADOS" → "PRODUCTOS") ~40 px: correcta, sin exceso de aire. No requiere cambio.
10. **Indicadores de puntos del carrusel** son muy chicos como control táctil; sirven bien como indicador pasivo. Opcional: 8 px de diámetro y 10 px de separación.

## Prioridad sugerida

1. Arreglar las imágenes rotas del catálogo (dato, no código).
2. Escalar logo/header y unificar el buscador.
3. Cards fluidas y áreas táctiles a 40-44 px.
4. Ajustes tipográficos menores de precio anterior y título.

Ninguna de estas medidas cambia paleta, tipografía ni identidad visual: solo escala, densidad y superficie táctil.

## Nota

Este documento es solo diagnóstico. No se modificó código, datos, secretos ni publicaciones. Aprobar únicamente si querés que pase a implementar los puntos 2-7.
