import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * ETAPA 2 — Conexión y publicación real en Instagram (cuenta PROFESIONAL).
 *
 * Los tokens viven SOLO en public.social_connections, tabla que no es accesible
 * desde el navegador (sin grants para anon/authenticated): todo pasa por estas
 * funciones de servidor, que primero verifican rol admin.
 * `social_publications` sigue sin tokens.
 */

export interface InstagramConfigItem {
  name: string;
  label: string;
  state: "ok" | "missing" | "invalid";
  detail: string;
}

export interface InstagramConnectionStatus {
  /** Faltan credenciales de la app de Meta. */
  configured: boolean;
  missing: string[];
  /** Detalle exacto por variable de entorno. */
  configItems: InstagramConfigItem[];
  connected: boolean;
  username: string | null;
  externalAccountId: string | null;
  accountType: string | null;
  connectedAt: string | null;
  tokenExpiresAt: string | null;
  scopes: string | null;
  /** La API oficial no permite revocar el token desde el servidor. */
  remoteRevokeSupported: boolean;
}

function requestOrigin(): string | null {
  try {
    const req = getRequest();
    return req?.url ? new URL(req.url).origin : null;
  } catch {
    return null;
  }
}

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("No autorizado: se requiere rol admin");
}

/** Estado real de la conexión (sin exponer el token). */
export const getInstagramConnectionStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<InstagramConnectionStatus> => {
    await assertAdmin(context);
    const { checkInstagramConfig, REMOTE_REVOKE_SUPPORTED } = await import("./instagram-provider.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cfg = checkInstagramConfig(requestOrigin());

    const { data: row } = await supabaseAdmin
      .from("social_connections")
      .select("external_account_id,username,account_type,connected_at,token_expires_at,scopes")
      .eq("channel", "instagram")
      .eq("is_active", true)
      .maybeSingle();

    return {
      configured: cfg.configured,
      missing: cfg.missing,
      configItems: cfg.items,
      connected: !!row,
      username: row?.username ?? null,
      externalAccountId: row?.external_account_id ?? null,
      accountType: row?.account_type ?? null,
      connectedAt: row?.connected_at ?? null,
      tokenExpiresAt: row?.token_expires_at ?? null,
      scopes: row?.scopes ?? null,
      remoteRevokeSupported: REMOTE_REVOKE_SUPPORTED,
    };
  });

/** Inicia OAuth: genera `state` seguro, lo persiste y devuelve la URL oficial. */
export const startInstagramConnect = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ authorizeUrl: string }> => {
    await assertAdmin(context);
    const { requireInstagramConfig, buildAuthorizeUrl } = await import("./instagram-provider.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cfg = requireInstagramConfig(requestOrigin());

    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    const state = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

    const { error } = await supabaseAdmin.from("social_oauth_states").insert({
      state,
      channel: "instagram",
      created_by: context.userId,
      expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });
    if (error) throw new Error(error.message);

    return { authorizeUrl: buildAuthorizeUrl(cfg, state) };
  });

/** Desconecta la cuenta activa; deja el sistema listo para conectar otra. */
export const disconnectInstagram = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<{ disconnected: boolean }> => {
    await assertAdmin(context);
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("social_connections")
      .update({ is_active: false, disconnected_at: new Date().toISOString() })
      .eq("channel", "instagram")
      .eq("is_active", true)
      .select("id");
    if (error) throw new Error(error.message);
    return { disconnected: (data?.length ?? 0) > 0 };
  });

const PublishInput = z.object({ source_ref: z.string().min(1).max(120) });

const SIGNED_HINT = ["token=", "X-Amz-", "/object/sign/"];

/**
 * Publica ahora en Instagram una publicación ya persistida en
 * LISTO_PARA_PUBLICAR (o en ERROR, para reintentar). Nunca republica lo ya
 * PUBLICADO. El token nunca sale del servidor.
 */
export const publishInstagramNow = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PublishInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { publishImage } = await import("./instagram-provider.server");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: conn, error: connErr } = await supabaseAdmin
      .from("social_connections")
      .select("access_token,external_account_id,username")
      .eq("channel", "instagram")
      .eq("is_active", true)
      .maybeSingle();
    if (connErr) throw new Error(connErr.message);
    if (!conn) throw new Error("No hay una cuenta profesional de Instagram conectada.");

    // Control de estado: solo se toma la publicación si está lista o en error.
    // El cambio a PUBLICANDO actúa como candado de idempotencia contra doble envío.
    const { data: claimed, error: claimErr } = await supabaseAdmin
      .from("social_publications")
      .update({ status: "PUBLICANDO" })
      .eq("source_ref", data.source_ref)
      .eq("channel", "instagram")
      .in("status", ["LISTO_PARA_PUBLICAR", "ERROR"])
      .select("id,media_url,media_type,caption,hashtags,status")
      .maybeSingle();
    if (claimErr) throw new Error(claimErr.message);
    if (!claimed) {
      const { data: current } = await supabaseAdmin
        .from("social_publications")
        .select("status")
        .eq("source_ref", data.source_ref)
        .eq("channel", "instagram")
        .maybeSingle();
      if (current?.status === "PUBLICADO") throw new Error("Esta publicación ya fue publicada en Instagram.");
      if (current?.status === "PUBLICANDO") throw new Error("Ya hay una publicación en curso para este producto.");
      throw new Error("La publicación debe estar marcada como lista para publicar.");
    }

    const mediaUrl = claimed.media_url ?? "";
    const caption = [claimed.caption, claimed.hashtags].map((s) => (s || "").trim()).filter(Boolean).join("\n\n");

    async function fail(message: string): Promise<never> {
      await supabaseAdmin
        .from("social_publications")
        .update({ status: "ERROR", error_message: message.slice(0, 500) })
        .eq("id", claimed!.id);
      throw new Error(message);
    }

    if (claimed.media_type !== "image") await fail("En esta etapa solo se publican imágenes.");
    if (!mediaUrl || !/^https:\/\//i.test(mediaUrl) || SIGNED_HINT.some((h) => mediaUrl.includes(h))) {
      await fail("La imagen debe ser una URL aprobada y estable (no temporal).");
    }
    if (!caption) await fail("El texto de la publicación no puede estar vacío.");

    let externalPostId: string;
    try {
      externalPostId = await publishImage({
        accessToken: conn.access_token,
        igUserId: conn.external_account_id,
        imageUrl: mediaUrl,
        caption,
      });
    } catch (e) {
      await fail((e as Error).message);
      throw e;
    }

    const { data: updated, error: updErr } = await supabaseAdmin
      .from("social_publications")
      .update({
        status: "PUBLICADO",
        published_at: new Date().toISOString(),
        external_post_id: externalPostId,
        error_message: null,
      })
      .eq("id", claimed.id)
      .select("id,status,published_at,external_post_id")
      .single();
    if (updErr) throw new Error(updErr.message);

    return { ...updated, username: conn.username ?? null };
  });
