import { createFileRoute } from "@tanstack/react-router";

/**
 * Callback OAuth de Instagram (cuenta PROFESIONAL) — ETAPA 2.
 *
 * Va bajo /api/public/* porque Meta redirige el navegador acá sin sesión de la
 * app. La autorización real la da el `state` de un solo uso creado por un admin
 * autenticado (tabla social_oauth_states), que se valida y consume acá.
 * El app secret y el token nunca llegan al navegador.
 */

function back(origin: string, params: Record<string, string>) {
  const url = new URL("/admin-cargas", origin);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  return new Response(null, { status: 302, headers: { location: url.toString() } });
}

export const Route = createFileRoute("/api/public/instagram/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = url.origin;
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        const denied = url.searchParams.get("error_description") || url.searchParams.get("error");

        const { checkInstagramConfig, requireInstagramConfig, exchangeCodeForToken, fetchIdentity, sanitizeInstagramError } =
          await import("@/lib/instagram-provider.server");

        if (!checkInstagramConfig(origin).configured) {
          return back(origin, { instagram: "error", ig_msg: "Instagram no está configurado en el proyecto." });
        }
        if (denied) return back(origin, { instagram: "error", ig_msg: sanitizeInstagramError(denied) });
        if (!code || !state) return back(origin, { instagram: "error", ig_msg: "Respuesta de Instagram incompleta." });

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

        // state de un solo uso: se consume condicionalmente para evitar reuso/CSRF.
        const { data: consumed } = await supabaseAdmin
          .from("social_oauth_states")
          .update({ used_at: new Date().toISOString() })
          .eq("state", state)
          .is("used_at", null)
          .gt("expires_at", new Date().toISOString())
          .select("created_by")
          .maybeSingle();
        if (!consumed) {
          return back(origin, { instagram: "error", ig_msg: "La solicitud de conexión venció o no es válida. Volvé a intentar." });
        }

        try {
          const cfg = requireInstagramConfig(origin);
          const token = await exchangeCodeForToken(cfg, code);
          const identity = await fetchIdentity(token.accessToken);

          // Una sola conexión activa: se desactiva la anterior antes de insertar.
          await supabaseAdmin
            .from("social_connections")
            .update({ is_active: false, disconnected_at: new Date().toISOString() })
            .eq("channel", "instagram")
            .eq("is_active", true);

          const { error } = await supabaseAdmin.from("social_connections").insert({
            channel: "instagram",
            provider: "instagram_login",
            external_account_id: identity.id,
            username: identity.username,
            account_type: identity.accountType,
            access_token: token.accessToken,
            token_expires_at: token.expiresAt,
            scopes: token.scopes,
            is_active: true,
            connected_by: consumed.created_by,
          });
          if (error) throw new Error(error.message);

          return back(origin, { instagram: "connected", ig_user: identity.username || identity.id });
        } catch (e) {
          return back(origin, { instagram: "error", ig_msg: sanitizeInstagramError((e as Error).message) });
        }
      },
    },
  },
});
