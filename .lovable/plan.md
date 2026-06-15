## Resumen

Construyo dos flujos separados sobre la app actual:

1. **Carga pública con PIN** en `/cargar` — vendedores/empleados suben fotos con datos mínimos.
2. **Panel admin privado** en `/_authenticated/admin-productos` — revisión, edición, cambio de estado y planificación.

Imágenes a Google Drive, datos a Google Sheets (mismo sheet `Vera Deportes - Catalogo`, nuevas pestañas).

---

## Lo que vas a tener que hacer vos (manual, una sola vez)

1. **Conectar Google Drive** como connector cuando te lo pida.
2. **Crear una carpeta en tu Google Drive** llamada "Vera Deportes - Cargas" y pasarme el ID (lo guardo como secret `DRIVE_UPLOADS_FOLDER_ID`).
3. **Definir un PIN** de acceso para el formulario público (lo guardo como secret `UPLOAD_ACCESS_PIN`).
4. **Crear las 3 pestañas** en el Sheet existente con los encabezados exactos (te paso el detalle abajo) — o me autorizás y las creo yo desde el admin la primera vez.
5. **Asignarte el rol `admin`** en la base (lo hago yo con tu user_id una vez que tengas cuenta creada en `/auth`).

---

## Flujo 1 — Carga pública `/cargar`

- Pantalla simple, mobile-first, blanco + naranja.
- Pide PIN una vez (lo guardo en `sessionStorage`).
- Form: foto (cámara o galería), nombre/alias del cargador, marca sugerida (opcional), categoría sugerida (opcional), comentario.
- Subida: la imagen va a Google Drive vía server function → devuelve URL pública → se appendea fila en `CARGAS_USUARIOS` con estado `PENDIENTE`.
- Confirmación visual y botón "Subir otra".
- NO se ve el panel admin desde acá.

## Flujo 2 — Panel admin `/admin-productos` (bajo `_authenticated`)

- Solo accesible con rol `admin`. Si no tenés rol → 403.
- Tabs: **Pendientes** · **En revisión** · **Aprobados** · **Publicados** · **Descartados** · **Calendario**.
- Tabla con miniatura, fecha, cargador, marca/cat sugerida, comentario, estado.
- Acciones por fila: Ver imagen grande · Editar · Aprobar · Descartar.
- Al editar abre un diálogo con los campos finales (marca, modelo, categoría, subcategoría, descripción comercial, características, uso, hashtags, texto IG, texto WhatsApp). Al aprobar:
  - Se actualiza estado en `CARGAS_USUARIOS` → `APROBADO`.
  - Se crea fila en `PRODUCTOS_ADMIN` con todos los campos.
- "Programar publicación" agrega fila en `CALENDARIO_PUBLICACIONES` (Producto_ID, fecha, canal IG/WSP, tipo, estado `PROGRAMADO`).
- Filtros y búsqueda por marca/categoría.

---

## Estructura técnica

### Tablas Sheet (mismo `Vera Deportes - Catalogo`)

```
CARGAS_USUARIOS:    ID | Fecha | Usuario | URL_Imagen | Marca_Sugerida | Categoria_Sugerida | Comentario | Estado
PRODUCTOS_ADMIN:    ID | Fecha_Revision | URL_Imagen | Marca | Modelo | Categoria | Subcategoria | Descripcion_Comercial | Caracteristicas | Uso_Recomendado | Hashtags | Texto_Instagram | Texto_WhatsApp | Estado_Publicacion | Carga_ID
CALENDARIO_PUBLICACIONES: ID | Producto_ID | Fecha_Publicacion | Canal | Tipo_Publicacion | Estado
```

### Backend (TanStack server functions)

Nuevos archivos en `src/lib/`:

- `uploads-sheet.functions.ts` — `submitUpload({pin, usuario, marca, categoria, comentario, imageBase64, mime})`: valida PIN, sube a Drive, appendea a `CARGAS_USUARIOS`. Sin auth (público con PIN).
- `admin-products.functions.ts` — protegidas con `requireSupabaseAuth` + check `has_role('admin')`:
  - `listCargas(estado?)`
  - `updateCargaEstado(rowIndex, estado)`
  - `aprobarYCrearProducto(payload)` — escribe `PRODUCTOS_ADMIN` y marca carga `APROBADO`.
  - `listProductos(estado?)`, `updateProducto(...)`
  - `agendarPublicacion(...)`, `listAgenda(...)`

Drive vía connector gateway: `POST connector-gateway/google_drive/upload/drive/v3/files?uploadType=multipart` → luego `PATCH` para `permissions` (anyone reader) → guardo el `webContentLink` o `https://drive.google.com/uc?id={id}`.

### Frontend (rutas TanStack)

- `src/routes/cargar.tsx` — público, gate por PIN local.
- `src/routes/_authenticated/admin-productos.tsx` — gate adicional `has_role('admin')`. Componentes: `CargasTable`, `ProductoEditorDialog`, `AgendaCalendar`.

### Secrets necesarios

- `DRIVE_UPLOADS_FOLDER_ID` (lo pido cuando me pases el ID de la carpeta).
- `UPLOAD_ACCESS_PIN` (lo pido junto con lo anterior).
- Google Drive connector (te dispara el flujo de conexión).
- Reutilizo `PRODUCTS_SHEET_ID`, `GOOGLE_SHEETS_API_KEY`, `LOVABLE_API_KEY`.

---

## Lo que NO hago en esta etapa

- Publicación automática a Instagram/WhatsApp (queda para fase 2).
- Generación automática de texto IG/WSP con IA (puedo agregarla después con Lovable AI).
- Edición de imágenes (recorte/fondo) — la curaduría sigue siendo manual según tu regla de fotos.

---

## Orden de ejecución

1. Conectar Google Drive + cargar secrets `DRIVE_UPLOADS_FOLDER_ID` y `UPLOAD_ACCESS_PIN`.
2. Crear ruta `/cargar` + `submitUpload` server fn.
3. Crear panel admin + server fns protegidas.
4. Probar flujo end-to-end con una imagen real.
5. Asignarte rol admin.

¿Avanzo así?