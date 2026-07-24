# Registro — Módulo de carga y publicación de productos

## Enlace a la Google Sheet (fuente de datos)

**Vera Deportes - Catalogo**
https://docs.google.com/spreadsheets/d/1xNAPMMMBxe7e24kHvCx7Kd_cENEYZjrnlg3bgdq_Cyo/edit

Pestañas usadas por la app:

| Pestaña | Uso |
|---|---|
| `Productos` | Catálogo público que ve la landing. |
| `CARGAS_USUARIOS` | Fotos y datos que sube el encargado desde `/cargar`. |
| `PRODUCTOS_ADMIN` | Productos ya revisados y completados por el admin. |
| `Leads` | Consultas del formulario de contacto. |

Las imágenes cargadas desde `/cargar` se guardan en la carpeta de Google Drive
configurada en el secret `DRIVE_UPLOADS_FOLDER_ID`, y en la sheet queda la URL pública.

---

## Acciones implementadas

### 1. Landing pública
- Rediseño completo (Hero, marcas, categorías, productos, contacto).
- Logos reales de marcas (Nike, Adidas, Puma, Asics, New Balance, Skechers, Topper) en negro.
- Catálogo dinámico leído desde la pestaña `Productos` de la sheet.
- Filtros por categoría con scroll correcto (Zapatillas / Indumentaria / Remeras).
- Dialog de detalle con bloques "Ideal para" y "Características clave".
- Enlace a Instagram oficial: https://www.instagram.com/vera_deportes/
- Botón "Cómo llegar" con Google Maps (Corrientes 1635, Vera, Santa Fe).
- SEO: títulos únicos por ruta, meta descriptions, JSON-LD, `robots.txt`, `sitemap.xml`.

### 2. Carga pública `/cargar`
- Acceso con PIN (secret `UPLOAD_ACCESS_PIN`, actualmente **1974**).
- Formulario mobile-first: foto (cámara/galería) + nombre + marca/categoría sugerida + comentario.
- Sube la imagen a Google Drive, la hace pública, y appendea fila en `CARGAS_USUARIOS` con estado `PENDIENTE`.

### 3. Panel admin `/admin-cargas`
- Login con Supabase Auth + verificación de rol `admin`.
- Tabs: **Pendientes · Aprobados · Descartados · Productos · Landing**.
- Acciones por fila: ver imagen, aprobar, descartar, editar detalles finales.
- Al aprobar: se crea entrada en `PRODUCTOS_ADMIN`.
- Botón **"Publicar en landing"**: empuja el producto a la pestaña `Productos` (visible en la web).
- Tab **Landing**: edita en vivo lo que ya está publicado.
- Botón **"Inicializar"**: crea las pestañas faltantes con encabezados.
- Botón **"Reset total"**: limpia todas las filas dejando solo los encabezados.

### 4. Usuarios
- Admin: `bjcbaigo@gmail.com` (rol `admin`).
- Encargado: `test@test.com` (rol `admin` para operar el panel).
- Contraseñas manejadas por Supabase Auth. Roles en tabla `user_roles` con `has_role()` (SECURITY DEFINER).

### 5. Integración MCP (Codex / agentes externos)
Endpoint: `https://veradeportes.lovable.app/mcp` (OAuth).

Herramientas expuestas:
- `whoami`
- `list_pending_cargas`
- `update_carga_estado`
- `list_leads`
- `list_productos_admin`
- `list_landing_products`
- `publish_landing_product`
- `update_landing_product`

### 6. Secrets configurados
- `PRODUCTS_SHEET_ID` — ID de la sheet Vera Deportes - Catalogo.
- `GOOGLE_SHEETS_API_KEY` — connector Google Sheets.
- `GOOGLE_DRIVE_API_KEY` — connector Google Drive.
- `DRIVE_UPLOADS_FOLDER_ID` — carpeta de Drive donde se guardan las fotos.
- `UPLOAD_ACCESS_PIN` — PIN de `/cargar` (hoy `1974`).
- `LOVABLE_API_KEY` — gateway de connectors.

---

## Flujo end-to-end

```
Encargado (/cargar + PIN)
   └─► foto + datos → Drive + CARGAS_USUARIOS (PENDIENTE)
                              │
                              ▼
Admin (/admin-cargas)
   ├─ Aprueba  → PRODUCTOS_ADMIN
   ├─ Completa marca/modelo/descripción
   └─ "Publicar en landing" → Productos (visible en la web pública)
```
