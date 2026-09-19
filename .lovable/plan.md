# Diagnóstico de producción y dominios (solo lectura)

## Resultado del diagnóstico

1. **URL de producción asociada al proyecto**: `veradeportes.com` es el dominio primario y está **active** (conectado hace ~98 días). `www.veradeportes.com` y `veradeportes.lovable.app` responden 302 → `https://veradeportes.com/`. El proyecto está publicado y con visibilidad pública.

2. **veradeportes.com pertenece a ESTE proyecto** (no a otro deployment). Los tres dominios sirven el mismo build; no hay diferencia de contenido entre ellos, solo redirecciones al primario.

3. **Build que sirve producción**: es un build **viejo**. La home publicada devuelve el título "Vera Deportes - Estamos trabajando en algo para vos" (página de coming soon anterior al rediseño) y no contiene ninguno de los textos recientes ("NUEVOS INGRESOS", "MOVIMIENTO", etc.). Es decir, producción no refleja ni el rediseño de la home ni el panel nuevo ni nada de Instagram Etapa 2.

4. **El commit b59ecf2 ("Añadió diagnóstico IG v2", HEAD, hoy 21:00 UTC) NO está en producción.** Tampoco lo está el diagnóstico v1 (commit 6c084d2). Esto explica por qué `error_message` sigue mostrando solo "API access blocked." sin los campos de diagnóstico: el servidor publicado corre código anterior.

5. **Acción manual que falta**: ninguna en Settings → Domains (ambos dominios están active, sin acción pendiente). Lo que falta es una **nueva publicación**: en este proyecto los cambios de frontend y del servidor de la app solo llegan a producción al publicar de nuevo.

## Acción propuesta (única)

- Publicar el proyecto (botón **Publish/Update** del editor). Eso actualiza a la vez `veradeportes.com`, `www.veradeportes.com` y `veradeportes.lovable.app` con el commit b59ecf2, incluyendo el diagnóstico `[IG-DIAG-v2]`.
- Después de publicar, reintentar la publicación de Instagram desde la ficha: el error guardado dirá exactamente etapa + HTTP status + type/code/subcode/trace de Meta.

## Verificación posterior sugerida

- Confirmar que la home publicada ya no muestra el coming soon sino el diseño actual.
- Reintentar la publicación en Instagram y leer el mensaje de error completo con el marcador `[IG-DIAG-v2]`.
