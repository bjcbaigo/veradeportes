// Almacenamiento y trazabilidad de imágenes de producto. Server-only.
//
// Decisiones:
// - La imagen ORIGINAL nunca se copia, modifica ni reemplaza: se registra por
//   referencia (su URL de origen) y queda inmutable.
// - Las imágenes PROCESADAS se guardan en el bucket público estable "productos"
//   bajo el prefijo "assets/". Se usa una URL pública que NO expira: no hay
//   signed URLs persistidas en ningún lado.
// - Descartar una procesada elimina físicamente el archivo del bucket.

export const ASSETS_BUCKET = "productos";
const MAX_BYTES = 8 * 1024 * 1024;

export const ASSET_ESTADOS = ["ORIGINAL", "PROCESADA", "APROBADA", "DESCARTADA"] as const;
export type AssetEstado = (typeof ASSET_ESTADOS)[number];

export const ASSET_ROLES = [
  "PRINCIPAL",
  "SECUNDARIA",
  "CATALOGO",
  "INSTAGRAM",
  "DETALLE",
  "EDITORIAL",
  "MODELO_IA",
] as const;
export type AssetRol = (typeof ASSET_ROLES)[number];

export type TransformMeta = Record<string, string | number | boolean | null>;

export interface ProductAsset {
  id: string;
  source_ref: string;
  source_sku: string | null;
  parent_asset_id: string | null;
  estado: string;
  rol: string;
  bucket: string | null;
  path: string | null;
  public_url: string;
  transform: TransformMeta;
  width: number | null;
  height: number | null;
  bytes: number | null;
  mime: string | null;
  created_at: string;
  approved_at: string | null;
  discarded_at: string | null;
}

export const ASSET_SELECT =
  "id,source_ref,source_sku,parent_asset_id,estado,rol,bucket,path,public_url,transform,width,height,bytes,mime,created_at,approved_at,discarded_at";

function slug(s: string) {
  return s.replace(/[^\w.-]+/g, "_").slice(0, 60) || "producto";
}

/** Sube un archivo procesado al bucket público estable y devuelve path + URL fija. */
export async function uploadProcessed(
  sourceRef: string,
  dataBase64: string,
  mime: string,
  preset: string,
): Promise<{ path: string; publicUrl: string; bytes: number }> {
  if (!/^image\/(png|jpeg|webp)$/.test(mime)) {
    throw new Error("Formato de imagen no soportado (solo PNG, JPG o WEBP)");
  }
  const bytes = Buffer.from(dataBase64, "base64");
  if (bytes.byteLength > MAX_BYTES) throw new Error("La imagen procesada supera el máximo permitido (8 MB)");
  if (bytes.byteLength < 500) throw new Error("La imagen procesada está vacía");

  const ext = mime.includes("png") ? "png" : mime.includes("webp") ? "webp" : "jpg";
  const path = `assets/${slug(sourceRef)}/${Date.now()}-${slug(preset)}-${Math.random()
    .toString(36)
    .slice(2, 8)}.${ext}`;

  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const up = await supabaseAdmin.storage
    .from(ASSETS_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (up.error) throw new Error(`No se pudo guardar la imagen procesada: ${up.error.message}`);

  const { data } = supabaseAdmin.storage.from(ASSETS_BUCKET).getPublicUrl(path);
  return { path, publicUrl: data.publicUrl, bytes: bytes.byteLength };
}

/** Elimina el archivo del bucket (solo si el asset es propio del bucket de assets). */
export async function removeStoredFile(bucket: string | null, path: string | null): Promise<void> {
  if (!bucket || !path) return; // originales externos: no se tocan jamás
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.storage.from(bucket).remove([path]);
  if (error) throw new Error(`No se pudo eliminar el archivo: ${error.message}`);
}
