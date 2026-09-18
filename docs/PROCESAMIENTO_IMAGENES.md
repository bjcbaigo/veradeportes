# Procesamiento de imágenes de producto (Opción B)

Objetivo: que alguien sin conocimientos técnicos pueda subir fotos desde el celular,
mejorarlas, comparar antes/después, aprobar una imagen base y derivar variantes para
catálogo e Instagram, sin perder nunca la foto original.

## Principios

1. **La ORIGINAL es inmutable.** Se registra por referencia (su URL) y nunca se
   sobrescribe ni se borra desde este módulo. Toda mejora es un archivo nuevo.
2. **Determinístico ≠ IA.** "Mejorar fotos" no inventa nada (giro, encuadre, tamaño,
   luz, nitidez). Las variantes generativas viven en "Contenido IA".
3. **Aprobación humana obligatoria** en todos los casos.
4. **Sin URLs temporales persistidas.** Las procesadas/aprobadas se guardan en el
   bucket público estable `productos` (carpeta `assets/`).

## Estados y roles

- Estados: `ORIGINAL`, `PROCESADA`, `APROBADA`, `DESCARTADA`.
- Roles: `PRINCIPAL`, `SECUNDARIA`, `CATALOGO`, `INSTAGRAM`, `DETALLE`, `EDITORIAL`, `MODELO_IA`.
- Solo puede haber **una** imagen `APROBADA` con rol `PRINCIPAL` por producto
  (índice único parcial en la base). Al aprobar una nueva principal, la anterior
  pasa a `SECUNDARIA` (no se borra: se conserva la trazabilidad).
- Descartar una `PROCESADA` marca el estado `DESCARTADA` **y elimina el archivo**
  del almacenamiento. La `ORIGINAL` no se puede descartar.

## Presets

| Preset | Relación | Uso |
| --- | --- | --- |
| Catálogo 1:1 | 1:1 | grilla de tienda y ficha |
| Instagram 4:5 | 4:5 | feed |
| Instagram 1:1 | 1:1 | feed cuadrado |

Fondo del borde: conservar / blanco / gris `#e5e7eb`. Ajustes acotados:
brillo ±20, contraste ±20, nitidez 0–30.

## Comparación antes/después

El comparador no usa la foto original cruda contra la procesada. Primero genera
un **antes normalizado** con el mismo preset, relación, encuadre `contain`, fondo
y tamaño final que la imagen procesada; después compara esa referencia contra la
versión con brillo/contraste/nitidez aplicados. Así se evita una comparación
engañosa por diferencias de escala o encuadre, y no se modifica ni se guarda la
ORIGINAL.

## Limitación explícita (no simulada)

El runtime del servidor no tiene librerías de imagen, así que el procesamiento
determinístico corre en el navegador (Canvas). Por eso **no hay recorte real del
producto contra el fondo**: la opción de fondo solo pinta el área que sobra del
encuadre. Para fondo blanco limpio real se usa la variante IA "Catálogo limpio",
siempre con revisión y aprobación manual.

No hay procesamiento de video en esta etapa.

## Piezas técnicas

| Archivo | Rol |
| --- | --- |
| `src/lib/image-processing.ts` | motor determinístico en el navegador (presets, fondos, ajustes, métricas) |
| `src/lib/product-assets.server.ts` | subida/borrado en storage, constantes, tipos, límite 8 MB |
| `src/lib/product-assets.functions.ts` | funciones de servidor admin-only (listar, registrar original, guardar procesada, aprobar, descartar) |
| `src/components/studio/ImageWorkbench.tsx` | UI mobile-first "Mejorar fotos" |
| `src/components/studio/AiContentStudio.tsx` | variantes IA; exige imagen base `APROBADA` |
| tabla `product_assets` | persistencia y trazabilidad |

### Tabla `product_assets` (aditiva)

`id`, `source_ref`, `source_sku`, `parent_asset_id`, `estado`, `rol`, `bucket`,
`path`, `public_url`, `transform` (jsonb con el detalle de la transformación),
`width`, `height`, `bytes`, `mime`, `created_by`, `created_at`, `updated_at`,
`approved_at`, `discarded_at`, `error_message`.

RLS: solo admin (`has_role(auth.uid(),'admin')`). Todas las operaciones sensibles
pasan por funciones de servidor autenticadas; el cliente nunca recibe claves.

## Seguridad

- Admin-only en cada función de servidor (verificación de rol, no solo sesión).
- Tipos permitidos: JPEG/PNG/WebP; tamaño máximo 8 MB por archivo.
- Las descargas remotas del módulo IA mantienen la protección SSRF existente
  (validación de URL + resolución DNS antes de cada fetch y de cada redirect).
- Si falla el registro en la base, el archivo subido se elimina (sin huérfanos).

## Relación con Google Sheets e Instagram

Google Sheets sigue siendo la fuente del catálogo publicado: este módulo solo
escribe la URL final aprobada en los campos de imagen de la ficha, al presionar
**Guardar cambios**. La publicación en Instagram no se modificó; sigue eligiendo
entre las imágenes ya aprobadas de la ficha.
