# Roadmap — Opción B (procesamiento de imágenes)

- [ ] Migración aditiva `product_assets` (estados, roles, trazabilidad, RLS admin)
- [ ] Motor determinístico en cliente `src/lib/image-processing.ts` (presets catálogo / 4:5 / 1:1)
- [ ] Funciones server admin-only: listar, guardar procesada, aprobar, descartar, versión Instagram
- [ ] UI mobile-first `ImageWorkbench` integrada en el editor de ficha de /admin-cargas
- [ ] Variantes IA solo desde imagen APROBADA
- [ ] Docs: docs/PROCESAMIENTO_IMAGENES.md + actualizar docs/registro-modulo-cargas.md
- [ ] Pruebas: typecheck + smoke /cargar /admin-cargas /tienda + flujo de asset sin publicar en Instagram
