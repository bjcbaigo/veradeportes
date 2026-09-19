# Roadmap

## Completado
- [x] URL individual por producto: `/producto/<marca-modelo>--<id-estable>` (`src/lib/product-url.ts`, `src/routes/producto.$slug.tsx`).
- [x] Ficha pública completa: galería, precio/oferta, talles, sellos, WhatsApp, compartir/copiar, metas OG + canonical, 404 amigable.
- [x] Integración catálogo: "Ver ficha completa" + "Copiar enlace" en ProductDetailDialog; sitemap dinámico con fichas.
- [x] Product Studio: sección "Enlace del producto" (copiar/abrir) en ficha admin.
- [x] Instagram: botón "Copiar enlace del producto" en módulo de publicación (captions orgánicos no clickeables).
- [x] Typecheck OK; smoke /, /tienda, /ofertas, /cargar, /admin-cargas, /sitemap.xml OK; deep link + refresh + móvil verificados.

## Abierto
- [ ] Publicar (Publish del editor) para que producción reciba esta feature + el diagnóstico Instagram [IG-DIAG-v2] (commit b59ecf2). Producción hoy sirve build viejo (coming soon).
- [ ] Tras publicar: reintentar publicación Instagram y leer el error detallado por etapa.
