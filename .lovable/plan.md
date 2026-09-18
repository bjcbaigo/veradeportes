# Opción B — Carga y mejora de imágenes (integral y controlada)

Objetivo: que alguien que trabaja desde el celular saque la foto, la procese, compare antes/después, apruebe una imagen base y de ahí derive versiones para catálogo e Instagram. La foto original nunca se toca ni se reemplaza.

## Decisiones de base (importante)

- **La mejora determinística (orientación, encuadre, tamaño/peso, brillo/contraste/nitidez, presets 4:5 y 1:1) se hace en el celular/navegador**, extendiendo el optimizador que ya existe. El servidor de este proyecto no puede procesar píxeles (no hay librería de imagen disponible en su runtime), así que hacerlo en el dispositivo es la única vía real y además es instantánea para el usuario.
- **Fondo blanco/limpio: no se promete automático.** Se implementa el estado y la acción, pero marcada como "limitada": ofrece fondo blanco sólido por relleno cuando la foto ya viene recortada, y para recorte real del producto deriva a la variante IA "Catálogo limpio" (con aprobación humana). Nunca se simula un recorte que no se puede garantizar.
- **Persistencia en la base de Lovable Cloud**, no en Google Sheets. Google Sheets sigue siendo la fuente del catálogo publicado; se le agrega solo la URL final aprobada que ya usa hoy.
- **Sin URLs temporales guardadas**: los archivos aprobados van a un almacenamiento público estable; las vistas previas privadas siguen siendo temporales y nunca se persisten.

## Estados y roles

- Estados del asset: `ORIGINAL`, `PROCESADA`, `APROBADA`, `DESCARTADA`.
- Roles: `PRINCIPAL`, `SECUNDARIA`, `CATALOGO`, `INSTAGRAM`, `DETALLE`, `EDITORIAL`, `MODELO_IA`.
- Reglas: una sola `PRINCIPAL` aprobada por producto; las variantes IA solo se generan desde un asset `APROBADA`; descartar borra el archivo del almacenamiento salvo que ya esté aprobado y en uso.

## Fases

### Fase 1 — Base de datos (aditiva, sin borrar nada)
Nueva tabla `product_assets`:
`id`, `source_ref` (fila/SKU del producto, misma referencia estable que usa Instagram), `source_sku`, `parent_asset_id` (trazabilidad de origen), `estado`, `rol`, `bucket`, `path`, `public_url`, `transform` (jsonb: tipo de transformación y parámetros aplicados), `width`, `height`, `bytes`, `mime`, `created_by`, `created_at`, `updated_at`, `approved_at`, `discarded_at`, `error_message`.
Acceso: solo admin (misma función de rol ya usada), con permisos explícitos y trigger de `updated_at`. Índices por `source_ref` y por `estado`. Nada de lo existente se modifica.

### Fase 2 — Motor de procesamiento en el dispositivo
`src/lib/image-processing.ts` (nuevo, extiende `image-optimize.ts` sin romperlo):
- corrección de orientación EXIF, redimensión y recompresión (ya existente, reutilizada);
- encuadre por preset: `catalogo` 1:1, `instagram_45` 4:5, `instagram_11` 1:1, con relleno de fondo configurable (blanco o gris #e5e7eb, según la norma de fotos del proyecto);
- ajustes moderados y acotados de brillo, contraste y nitidez, con límites fijos para no alterar color ni geometría;
- salida con métricas (peso antes/después, dimensiones) para mostrar al usuario.

### Fase 3 — Guardado y limpieza (servidor)
`src/lib/product-assets.functions.ts` + `product-assets.server.ts`:
- `listAssets(source_ref)`, `registerOriginal`, `saveProcessed` (sube el archivo procesado y registra el asset), `approveAsset(rol)`, `discardAsset` (marca y borra el archivo del almacenamiento), `deriveInstagramVersion`.
- Todo admin-only, con validación de tipo/tamaño; cualquier descarga remota reutiliza la protección anti-SSRF y el timeout ya implementados.
- Aprobar como principal/secundaria devuelve una URL estable que el editor de ficha escribe recién al "Guardar cambios" (el comportamiento actual no cambia).

### Fase 4 — Interfaz mobile-first
Nuevo `src/components/studio/ImageWorkbench.tsx`, integrado en el editor de ficha de `/admin-cargas` justo antes de "Fotografías", y enlace desde `/cargar` para seguir usando la foto recién subida:
- tira de miniaturas con estado y rol en texto claro;
- botones grandes: Procesar imagen · Reprocesar · Comparar antes/después · Aprobar como principal · Aprobar como secundaria · Descartar procesada · Crear versión Instagram;
- comparador con control deslizante antes/después y las medidas de peso/tamaño;
- mensajes de error en lenguaje común y aviso visible cuando una acción es limitada (fondo).
`AiContentStudio` pasa a exigir un asset `APROBADA` como punto de partida, manteniendo su aprobación humana.

### Fase 5 — Documentación y registro
- `docs/PROCESAMIENTO_IMAGENES.md`: arquitectura, estados, flujo operativo paso a paso para el encargado, límites conocidos y cómo revertir.
- Actualización breve de `docs/registro-modulo-cargas.md`.

## Plan de commits y GitHub

Commits en este orden (Lovable sincroniza solo con `bjcbaigo/veradeportes`; no haría push manual):
1. `feat(db): tabla product_assets con trazabilidad y acceso admin`
2. `feat(images): motor de procesamiento determinístico con presets`
3. `feat(images): funciones de servidor para guardar, aprobar y limpiar assets`
4. `feat(studio): mesa de trabajo de imágenes mobile-first`
5. `refactor(ai): variantes IA solo desde imagen aprobada`
6. `docs: procesamiento de imágenes`

Verificación de la sincronización: en el panel de GitHub del proyecto, confirmar que los commits aparecen en la rama principal del repo con esos mensajes y que la última fecha coincide con la del trabajo.

## Riesgos

| Riesgo | Mitigación |
|---|---|
| Celulares viejos con fotos muy grandes | límite de tamaño y procesamiento por lotes de a una |
| Expectativa de recorte de fondo automático | acción marcada como limitada + derivación a IA con aprobación |
| Duplicación de imágenes en almacenamiento | descartar borra el archivo; solo lo aprobado queda |
| Romper la publicación en Instagram | se reutiliza la misma referencia de producto; no se toca su arquitectura |
| Regresión en /cargar o /tienda | cambios aditivos; smoke test de las tres pantallas |

## Criterio de aceptación

- Original siempre presente e inmutable; ninguna procesada la sobrescribe.
- Los cuatro estados y los siete roles visibles y operables desde el celular.
- Comparador antes/después funcionando con métricas.
- Presets catálogo, 4:5 y 1:1 generados correctamente.
- Variantes IA solo desde imagen aprobada.
- Descartar elimina el archivo del almacenamiento.
- Tipos sin errores; `/cargar`, `/admin-cargas` y `/tienda` cargan bien; un asset recorre todo el flujo sin publicar nada en Instagram.
