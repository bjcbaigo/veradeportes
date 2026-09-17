# Fase 1 — Mejoras seguras en Product Studio (sin tocar datos)

Todo es UI derivada: no se crean columnas, no se modifican hojas, ni tablas, ni auth, ni integraciones. La tienda pública (`/tienda`) y la carga (`/cargar`) no cambian.

## 1. Criterio "listo para publicar" (derivado, sin escribir nada)

Nuevo archivo `src/lib/product-readiness.ts` con una función pura que calcula, a partir de la ficha ya existente:

- Requisitos base (visibles en la tarjeta y en el editor):
  - imagen principal presente
  - categoría presente
  - modelo presente o validación de modelo distinta de RECHAZADO
- Requisitos extra solo en el diálogo de publicación: precio y talles.

Resultado: lista de faltantes + nivel (`listo` / `advertencias`).

Aplicación:
- `StudioCard`: chip "Listo para publicar" o "Faltan datos (n)" con detalle al pasar/expandir. No se ocultan ni se deshabilitan acciones existentes.
- `StudioEditor`: bloque de checklist arriba, informativo.
- `PublishDialog`: checklist visible. Se mantiene el bloqueo actual (nombre, categoría, precio, imagen — ya obligatorios hoy). Los talles faltantes se muestran como advertencia, no bloquean, para no frenar fichas históricas.

Riesgo: bajo (solo lectura y render).

## 2. Sección "Contenido IA" en el editor (preparación, sin generar)

En `StudioEditor`, nueva sección informativa con cuatro tarjetas: Catálogo limpio, Editorial, Modelo en uso, Detalle/Textura. Todas en estado "No generado", sin botones activos, con nota: "La foto original cargada es la fuente de verdad. Nada se genera ni se guarda en esta fase."

Riesgo: nulo (UI estática).

## 3. Reforzar que la IA es copiloto

- En el diálogo de sugerencias: aviso fijo "Las sugerencias no se guardan. Aplicar solo completa el formulario; tenés que presionar Guardar cambios."
- Verificar y mantener que `applyAi` solo actualice el estado local del formulario, nunca dispare guardado ni publicación.

Riesgo: bajo.

## 4. Advertencia en Calendario

En `AgendaView` y en el diálogo "Agendar publicación": aviso claro de que es una agenda de planificación interna y que **no publica** automáticamente en Instagram, Facebook ni WhatsApp.

Riesgo: nulo.

## Archivos que se tocarían

| Archivo | Cambio |
|---|---|
| `src/lib/product-readiness.ts` | nuevo, función pura de checklist |
| `src/routes/admin-cargas.tsx` | chips/checklist en tarjeta, editor, diálogo de publicación; sección Contenido IA; avisos de IA y Calendario |

No se toca: `admin-cargas.functions.ts`, `product-studio-ai.*`, `cargar.tsx`, componentes de la tienda, migraciones, secrets, MCP.

## Validación

- Typecheck del proyecto.
- Revisión en navegador de `/admin-cargas` (login existente) en 390px y 1280px: pestañas Studio, Catálogo, Landing y Calendario cargan; abrir editor, ver checklist y Contenido IA; abrir Publicar y confirmar que publica igual que hoy cuando los campos obligatorios están completos; abrir Agendar y ver el aviso.
- `/tienda` y `/cargar` en 390px y 1280px: sin cambios visuales, sin errores de consola.
- Sin cambios en hojas ni base de datos durante las pruebas (solo se publica/agenda si vos lo pedís explícitamente).

## Fases siguientes (no ahora)

- Fase 2: generación real de contenido IA de imágenes con almacenamiento propio y revisión humana.
- Fase 3: migración gradual del catálogo de Sheets a base de datos, con doble lectura y rollback.
- Fase 4: publicación asistida en redes, con aprobación manual obligatoria.
