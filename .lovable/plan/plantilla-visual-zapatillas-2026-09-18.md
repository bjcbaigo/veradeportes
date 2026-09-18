# Plantilla visual Zapatillas

## Alcance

- Agregar en “Mejorar fotos” el selector `Automática / Zapatillas / Neutra`.
- Pasar la categoría actual desde la ficha; si contiene `zapatillas`, `calzado` o `running`, iniciar en Zapatillas. La selección seguirá siendo editable.
- Renombrar los rellenos a “Completar bordes en blanco” y “Completar bordes en gris claro”, con ayuda explícita de que no eliminan el fondo.

## Procesamiento

- Extender las opciones determinísticas con la plantilla visual.
- Zapatillas usará lienzo blanco, proporción original, `contain`, caja útil del 80% y centro vertical aproximado al 54%, sin recorte ni deformación, en los tres formatos existentes.
- Mantener el comparador con el “antes” normalizado exactamente al mismo formato, escala, posición y fondo.
- No dibujar sombra artificial: sin segmentación se superpondría al fondo original y podría falsear el producto. Guardar `shadow: false` y explicarlo en pantalla; recomendar “Catálogo limpio IA” para una sombra fiable.
- Guardar en `transform`: `template`, `normalized`, `fill_mode`, `shadow` y `preset`, además de los ajustes actuales.

## Archivos

- `src/lib/image-processing.ts`
- `src/components/studio/ImageWorkbench.tsx`
- `src/routes/admin-cargas.tsx`
- `docs/PROCESAMIENTO_IMAGENES.md`

## Validación

- Typecheck.
- Smoke de `/admin-cargas`, `/cargar` y `/tienda`.
- Verificación visual de una zapatilla real en la ficha, confirmando fondo blanco, proporción, escala y comparador alineado.
- Confirmar el SHA sincronizado; no tocar almacenamiento, aprobaciones, catálogo público, Sheets ni Instagram.
