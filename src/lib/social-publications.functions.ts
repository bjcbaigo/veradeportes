import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Publicación Instagram — ETAPA 1 (preparación interna).
 *
 * Persistencia real en Postgres (tabla public.social_publications), NO en Google Sheets.
 * En esta etapa NO existe conexión con Meta ni publicación externa: solo se pueden
 * producir los estados BORRADOR y LISTO_PARA_PUBLICAR, siempre por acción manual.
 * PUBLICADO / ERROR quedan definidos para la ETAPA 2 y nunca se establecen acá.
 *
 * LIMITACIÓN CONOCIDA: el catálogo sigue viviendo en Google Sheets, por lo que la
 * referencia estable al producto es `source_ref` = ID de la fila de PRODUCTOS_ADMIN
 * (con el SKU guardado aparte como referencia secundaria). No se migra el catálogo.
 */

export const SOCIAL_STATUSES = [
  "BORRADOR",
  "LISTO_PARA_PUBLICAR",
  "PUBLICANDO",
  "PUBLICADO",
  "ERROR",
] as const;
export type SocialStatus = (typeof SOCIAL_STATUSES)[number];

/** Estados alcanzables por el operador en la ETAPA 1. */
export const STAGE1_STATUSES = ["BORRADOR", "LISTO_PARA_PUBLICAR"] as const;

export interface SocialPublication {
  id: string;
  source_ref: string;
  source_sku: string | null;
  product_name: string | null;
  channel: string;
  media_url: string | null;
  media_type: string;
  caption: string;
  hashtags: string;
  status: string;
  published_at: string | null;
  external_post_id: string | null;
  error_message: string | null;
  updated_at: string;
}

const SELECT =
  "id,source_ref,source_sku,product_name,channel,media_url,media_type,caption,hashtags,status,published_at,external_post_id,error_message,updated_at";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("No autorizado: se requiere rol admin");
}

const RefInput = z.object({ source_ref: z.string().min(1).max(120) });

const SaveInput = z.object({
  source_ref: z.string().min(1).max(120),
  source_sku: z.string().max(120).optional(),
  product_name: z.string().max(300).optional(),
  media_url: z.string().url().max(2000).nullable().optional(),
  media_type: z.enum(["image", "video"]).default("image"),
  caption: z.string().max(4000).default(""),
  hashtags: z.string().max(1000).default(""),
});

/** Lee la publicación preparada del producto (si existe). */
export const getSocialPublication = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RefInput.parse(d))
  .handler(async ({ data, context }): Promise<SocialPublication | null> => {
    await assertAdmin(context);
    const { data: row, error } = await context.supabase
      .from("social_publications")
      .select(SELECT)
      .eq("source_ref", data.source_ref)
      .eq("channel", "instagram")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return (row as SocialPublication | null) ?? null;
  });

/**
 * Crea o actualiza el borrador. Guardar SIEMPRE deja el estado en BORRADOR:
 * pasar a LISTO_PARA_PUBLICAR requiere la acción manual explícita del operador.
 */
export const saveSocialPublicationDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveInput.parse(d))
  .handler(async ({ data, context }): Promise<SocialPublication> => {
    await assertAdmin(context);
    const payload = {
      source_ref: data.source_ref,
      source_sku: data.source_sku || null,
      product_name: data.product_name || null,
      channel: "instagram",
      media_url: data.media_url || null,
      media_type: data.media_type,
      caption: data.caption,
      hashtags: data.hashtags,
      status: "BORRADOR",
      created_by: context.userId,
    };
    const { data: row, error } = await context.supabase
      .from("social_publications")
      .upsert(payload, { onConflict: "source_ref,channel" })
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as SocialPublication;
  });

const StatusInput = z.object({
  source_ref: z.string().min(1).max(120),
  status: z.enum(STAGE1_STATUSES),
});

/**
 * Cambia el estado entre BORRADOR y LISTO_PARA_PUBLICAR. Nunca marca PUBLICADO
 * ni ERROR: eso corresponde a la ETAPA 2, cuando exista la cuenta profesional conectada.
 */
export const setSocialPublicationStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => StatusInput.parse(d))
  .handler(async ({ data, context }): Promise<SocialPublication> => {
    await assertAdmin(context);
    const { data: current, error: readErr } = await context.supabase
      .from("social_publications")
      .select(SELECT)
      .eq("source_ref", data.source_ref)
      .eq("channel", "instagram")
      .maybeSingle();
    if (readErr) throw new Error(readErr.message);
    if (!current) throw new Error("Guardá primero el borrador de la publicación.");

    const row = current as SocialPublication;
    if (data.status === "LISTO_PARA_PUBLICAR") {
      if (!row.media_url) throw new Error("Falta elegir una imagen aprobada.");
      if (!row.caption.trim()) throw new Error("El texto de la publicación no puede estar vacío.");
    }

    const { data: updated, error } = await context.supabase
      .from("social_publications")
      .update({ status: data.status, error_message: null })
      .eq("id", row.id)
      .select(SELECT)
      .single();
    if (error) throw new Error(error.message);
    return updated as SocialPublication;
  });
