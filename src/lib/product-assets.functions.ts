import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { ASSET_ROLES } from "./product-assets.server";

/**
 * Imágenes de producto (Opción B) — todas las operaciones son admin-only.
 *
 * ORIGINAL: se registra por referencia (URL de origen), nunca se copia ni se
 * sobrescribe. PROCESADA: archivo nuevo en el bucket público estable.
 * APROBADA / DESCARTADA: solo cambian el estado; descartar borra el archivo.
 */

export type { ProductAsset, AssetEstado, AssetRol, TransformMeta } from "./product-assets.server";

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("No autorizado: se requiere rol admin");
}

const RefInput = z.object({ source_ref: z.string().min(1).max(160) });

const RegisterOriginalInput = z.object({
  source_ref: z.string().min(1).max(160),
  source_sku: z.string().max(120).optional(),
  url: z.string().url().max(1000),
});

const SaveProcessedInput = z.object({
  source_ref: z.string().min(1).max(160),
  source_sku: z.string().max(120).optional(),
  parent_asset_id: z.string().uuid().optional(),
  rol: z.enum(ASSET_ROLES),
  mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  dataBase64: z.string().min(500).max(12_000_000),
  width: z.number().int().positive().max(6000),
  height: z.number().int().positive().max(6000),
  transform: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])).default({}),
});

const ApproveInput = z.object({
  id: z.string().uuid(),
  rol: z.enum(ASSET_ROLES),
});

const IdInput = z.object({ id: z.string().uuid() });

/** Lista los assets de un producto (sin los descartados ya limpiados). */
export const listProductAssets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RefInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { ASSET_SELECT } = await import("./product-assets.server");
    const { data: rows, error } = await context.supabase
      .from("product_assets")
      .select(ASSET_SELECT)
      .eq("source_ref", data.source_ref)
      .order("created_at", { ascending: true });
    if (error) throw new Error(error.message);
    return (rows ?? []) as unknown as import("./product-assets.server").ProductAsset[];
  });

/**
 * Registra la imagen original por referencia. Idempotente por (source_ref, url):
 * si ya existe, devuelve la existente. Nunca copia ni modifica el archivo origen.
 */
export const registerOriginalAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => RegisterOriginalInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { ASSET_SELECT } = await import("./product-assets.server");

    const existing = await context.supabase
      .from("product_assets")
      .select(ASSET_SELECT)
      .eq("source_ref", data.source_ref)
      .eq("public_url", data.url)
      .eq("estado", "ORIGINAL")
      .maybeSingle();
    if (existing.data) return existing.data as unknown as import("./product-assets.server").ProductAsset;

    const { data: row, error } = await context.supabase
      .from("product_assets")
      .insert({
        source_ref: data.source_ref,
        source_sku: data.source_sku ?? null,
        estado: "ORIGINAL",
        rol: "PRINCIPAL",
        public_url: data.url,
        transform: { tipo: "origen", inmutable: true } as unknown as never,
        created_by: context.userId,
      })
      .select(ASSET_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as import("./product-assets.server").ProductAsset;
  });

/** Guarda una imagen procesada (determinística) como nuevo asset en estado PROCESADA. */
export const saveProcessedAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => SaveProcessedInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { uploadProcessed, removeStoredFile, ASSETS_BUCKET, ASSET_SELECT } = await import(
      "./product-assets.server"
    );

    const preset = String(data.transform["preset"] ?? "procesada");
    const { path, publicUrl, bytes } = await uploadProcessed(
      data.source_ref,
      data.dataBase64,
      data.mime,
      preset,
    );

    const { data: row, error } = await context.supabase
      .from("product_assets")
      .insert({
        source_ref: data.source_ref,
        source_sku: data.source_sku ?? null,
        parent_asset_id: data.parent_asset_id ?? null,
        estado: "PROCESADA",
        rol: data.rol,
        bucket: ASSETS_BUCKET,
        path,
        public_url: publicUrl,
        transform: data.transform as unknown as never,
        width: data.width,
        height: data.height,
        bytes,
        mime: data.mime,
        created_by: context.userId,
      })
      .select(ASSET_SELECT)
      .single();

    if (error) {
      // No dejamos archivos huérfanos si falla el registro.
      await removeStoredFile(ASSETS_BUCKET, path).catch(() => {});
      throw new Error(error.message);
    }
    return row as unknown as import("./product-assets.server").ProductAsset;
  });

/**
 * Aprueba un asset con un rol. Si es PRINCIPAL, la principal anterior pasa a
 * SECUNDARIA (nunca se borra ni se pierde la trazabilidad).
 * Devuelve la URL estable para usar en la ficha.
 */
export const approveAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ApproveInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { ASSET_SELECT } = await import("./product-assets.server");

    const actual = await context.supabase
      .from("product_assets")
      .select(ASSET_SELECT)
      .eq("id", data.id)
      .single();
    if (actual.error || !actual.data) throw new Error("La imagen no existe");
    const asset = actual.data as unknown as import("./product-assets.server").ProductAsset;

    if (data.rol === "PRINCIPAL") {
      const prev = await context.supabase
        .from("product_assets")
        .update({ rol: "SECUNDARIA" })
        .eq("source_ref", asset.source_ref)
        .eq("estado", "APROBADA")
        .eq("rol", "PRINCIPAL")
        .neq("id", data.id);
      if (prev.error) throw new Error(prev.error.message);
    }

    const { data: row, error } = await context.supabase
      .from("product_assets")
      .update({
        estado: "APROBADA",
        rol: data.rol,
        approved_at: new Date().toISOString(),
        discarded_at: null,
      })
      .eq("id", data.id)
      .select(ASSET_SELECT)
      .single();
    if (error) throw new Error(error.message);
    return row as unknown as import("./product-assets.server").ProductAsset;
  });

/**
 * Descarta un asset procesado y elimina su archivo del almacenamiento.
 * Nunca descarta un ORIGINAL (es inmutable y es la fuente de verdad).
 */
export const discardAsset = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => IdInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { removeStoredFile, ASSET_SELECT } = await import("./product-assets.server");

    const actual = await context.supabase
      .from("product_assets")
      .select(ASSET_SELECT)
      .eq("id", data.id)
      .single();
    if (actual.error || !actual.data) throw new Error("La imagen no existe");
    const asset = actual.data as unknown as import("./product-assets.server").ProductAsset;
    if (asset.estado === "ORIGINAL") throw new Error("La imagen original no se puede descartar");

    await removeStoredFile(asset.bucket, asset.path);

    const { error } = await context.supabase
      .from("product_assets")
      .update({
        estado: "DESCARTADA",
        discarded_at: new Date().toISOString(),
        approved_at: null,
      })
      .eq("id", data.id);
    if (error) throw new Error(error.message);
    return { ok: true as const, id: data.id, url: asset.public_url };
  });
