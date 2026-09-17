# Etapa 2 — Publicación real en Instagram (cuenta profesional)

Objetivo: dejar lista la conexión y la publicación reales contra la API oficial de Meta, con bloqueo claro mientras falten las credenciales de la app de Meta. La Etapa 1 sigue funcionando igual.

## Qué va a ver el usuario

En el bloque "Publicación Instagram" de cada ficha, el estado de conexión pasa a ser real, con cuatro situaciones posibles:

1. **Falta configuración** — lista exacta de datos pendientes de Meta.
2. **Configurado, sin cuenta conectada** — botón "Conectar Instagram".
3. **Conectando / error** — mensaje de Meta sanitizado, sin ocultar el motivo.
4. **Conectado como @usuario** — muestra usuario y id de cuenta, con "Desconectar".

Con cuenta activa y la publicación en estado LISTO PARA PUBLICAR aparece "Publicar ahora". Si falla, la publicación queda en ERROR con el motivo y un botón "Reintentar". Si ya está publicada, no se puede volver a publicar. Aviso permanente: la cuenta debe ser profesional (Business/Creator).

## Base de datos (migración nueva)

Tabla `public.social_connections`, separada de `social_publications` (que sigue sin tokens):

- `channel` ('instagram'), `provider` ('instagram_login'), `external_account_id`, `username`, `account_type`
- `access_token`, `token_expires_at`, `scopes`
- `is_active`, `connected_by`, `connected_at`, `updated_at`, `disconnected_at`
- Índice único parcial: **una sola conexión activa por canal**.
- RLS: solo `admin` autenticado lee/gestiona; `REVOKE ALL FROM anon, authenticated` sobre la tabla y acceso únicamente vía funciones del servidor con rol de servicio, para que el token nunca sea legible desde el navegador.

Tabla auxiliar `public.social_oauth_states` para el `state` de OAuth (valor aleatorio, admin que lo inició, vencimiento corto, marca de uso) — evita CSRF y se limpia al usarse.

## Flujo elegido

**Instagram API con Instagram Login** (`instagram_business_basic` + `instagram_business_content_publish`), que es el flujo oficial vigente para cuentas profesionales y no requiere página de Facebook vinculada. La elección queda encapsulada en un único módulo proveedor, de modo que cambiar a Facebook Login más adelante no toca el panel.

Publicación de imagen en dos pasos oficiales: crear contenedor de media con la URL de la imagen aprobada + caption, y luego publicarlo; se guarda el id del posteo devuelto.

## Archivos

- Nuevos: `src/lib/social-connections.functions.ts` (conectar/estado/desconectar/publicar, solo admin), `src/lib/instagram-provider.server.ts` (OAuth, identidad, publicación, errores sanitizados), rutas de servidor para inicio de OAuth y callback.
- `src/lib/social-publisher.ts`: el stub se reemplaza por la implementación real cuando la configuración está completa; el contrato no cambia.
- `src/lib/social-publications.functions.ts`: se agrega el paso a PUBLICADO/ERROR desde el servidor, con control para no publicar dos veces.
- `src/components/studio/InstagramPublication.tsx`: bloque de conexión real y botones nuevos.
- No se toca la tienda, la carga, la planilla, los permisos existentes ni los depósitos de imágenes (solo lectura de una imagen ya aprobada).

## Cambio de cuenta

Conectar una cuenta nueva desactiva la anterior en la misma operación (queda registrada la fecha de desconexión). Las publicaciones ya hechas conservan su id de posteo y no se reescriben. "Desconectar" deja el sistema listo para conectar otra cuenta; la revocación remota del permiso, si Meta no la expone de forma segura, queda documentada como paso manual en la configuración de Instagram.

## Lo que necesito de tu lado (Meta Developers)

Sin estos datos la conexión queda bloqueada a propósito. Al terminar te dejo los pasos exactos; en resumen: crear la app de Meta, agregar el producto de Instagram, tomar el ID y la clave secreta de la app, autorizar la URL de retorno que te voy a indicar, y agregar la cuenta profesional de prueba como usuaria de prueba. El ID y la clave se guardan en los ajustes del proyecto, nunca en el código.

## Validación

Compilación y tipos, que un visitante anónimo no pueda leer ni escribir la tabla de conexiones, que sin credenciales la interfaz explique qué falta y los endpoints rechacen la operación, y que el panel, la carga y la tienda sigan funcionando. No publico el proyecto a producción.
