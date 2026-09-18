# Roadmap — Opción B (procesamiento de imágenes)

- [x] Migración aditiva `product_assets` (estados, roles, trazabilidad, RLS admin)
- [x] Motor determinístico en cliente `src/lib/image-processing.ts` (presets catálogo / 4:5 / 1:1)
- [x] Funciones server admin-only: listar, guardar procesada, aprobar, descartar, versión Instagram
- [x] UI mobile-first `ImageWorkbench` integrada en el editor de ficha de /admin-cargas
- [x] Variantes IA solo desde imagen APROBADA
- [x] Docs: docs/PROCESAMIENTO_IMAGENES.md + actualizar docs/registro-modulo-cargas.md
- [x] Pruebas: typecheck + smoke /cargar /admin-cargas /tienda + flujo de asset sin publicar en Instagram
