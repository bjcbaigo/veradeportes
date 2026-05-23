## Vera Deportes — Landing mobile-first

Vidriera digital deportiva para Vera, Santa Fe. Foco en conversión por WhatsApp, sin carrito ni checkout.

### Identidad visual
- Paleta: blanco `#FFFFFF` y gris `#F4F4F4` de base, negro `#050505` para bloques de impacto, naranja `#FF4B00` como acento (CTAs, promos, highlights).
- Tipografía: Montserrat (titulares contundentes con palabras en naranja) + Inter (cuerpo).
- Logo subido en header y footer.
- Botón flotante de WhatsApp + bottom nav fija en mobile.

### Estructura (mobile-first, una sola ruta `/`)
1. **Header** — logo + menú hamburguesa + ícono WhatsApp.
2. **Hero** — fondo con imagen deportiva dinámica, overlay oscuro, título "Zapatillas e indumentaria deportiva en **Vera**", subtítulo corto, CTA naranja "Consultar por WhatsApp" + secundario "Ver productos".
3. **Categorías rápidas** — grilla horizontal scrollable: Zapatillas, Remeras, Shorts, Buzos, Accesorios, Ofertas (íconos + label).
4. **Productos destacados** — 8 cards limpias (imagen generada, nombre, categoría, precio/consulta, botón WhatsApp por producto).
5. **Promo de la semana** — bloque negro con acento naranja, mensaje corto, CTA WhatsApp. Estética más enérgica.
6. **Bloque de confianza** — 5 íconos: atención personalizada, consultá antes de venir, retiro en local, promos vigentes, respuesta rápida.
7. **Redes / Instagram** — mini galería 2x3 con CTA a Instagram.
8. **Ubicación y contacto** — dirección, horarios, botón Google Maps + WhatsApp.
9. **Footer** — logo, links, mención Vera, Santa Fe.
10. **Bottom nav fija mobile** — Inicio · Productos · Ofertas · WhatsApp.
11. **FAB WhatsApp** — siempre visible.

### Contenido
- Datos de contacto (WhatsApp, Instagram, dirección, horarios): placeholders editables claramente marcados.
- 8 productos ficticios con imágenes generadas (mix de zapatillas, remeras, shorts, buzos, accesorios).
- Copy comercial, cercano y breve siguiendo el tono del brief.

### Detalles técnicos
- TanStack Start, ruta única `src/routes/index.tsx` con secciones componentizadas en `src/components/landing/`.
- Tokens semánticos en `src/styles.css` (`--primary` = naranja, `--background` blanco, etc.) en oklch.
- Fuentes Montserrat + Inter vía Google Fonts en `__root.tsx`.
- Generación de ~10 imágenes (hero + 8 productos + 1 promo) con imagegen, guardadas en `src/assets/`.
- SEO: title, description, OG tags en español orientados a "Vera, Santa Fe".
- Sin backend ni Cloud (no se requiere persistencia).

### Lo que NO se construye
Tienda online, carrito, checkout, login, filtros complejos, fichas extendidas.
