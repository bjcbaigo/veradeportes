import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const CONTENT_VARIANTS = ["catalogo", "editorial", "modelo", "detalle"] as const;
export type ContentVariantId = (typeof CONTENT_VARIANTS)[number];

export const CONTENT_VARIANT_LABELS: Record<ContentVariantId, string> = {
  catalogo: "Catálogo limpio",
  editorial: "Editorial",
  modelo: "Modelo en uso",
  detalle: "Detalle / Textura",
};

const Input = z.object({
  variant: z.enum(CONTENT_VARIANTS),
  imagen_url: z.string().url(),
  marca: z.string().max(120).optional(),
  modelo: z.string().max(160).optional(),
  categoria: z.string().max(120).optional(),
  color: z.string().max(120).optional(),
  descripcion: z.string().max(1200).optional(),
});

const PathInput = z.object({
  path: z.string().min(3).max(300).regex(/^(catalogo|editorial|modelo|detalle)\/[\w.\-]+$/),
});

async function assertAdmin(context: { supabase: any; userId: string }) {
  const { data: isAdmin } = await context.supabase.rpc("has_role", {
    _user_id: context.userId,
    _role: "admin",
  });
  if (!isAdmin) throw new Error("No autorizado: se requiere rol admin");
}

/**
 * Genera un BORRADOR de imagen comercial a partir de la imagen principal.
 * Solo admin. No modifica la ficha, la hoja ni la imagen principal.
 * La IA intenta preservar el producto, pero no garantiza fidelidad: revisión humana obligatoria.
 */
export const generateProductContentDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);

    const { generateDraftImage } = await import("./product-content-ai.server");
    return generateDraftImage(data.variant, {
      imagen_url: data.imagen_url,
      marca: data.marca,
      modelo: data.modelo,
      categoria: data.categoria,
      color: data.color,
      descripcion: data.descripcion,
    });
  });

/** Elimina físicamente el archivo del borrador (Descartar / limpieza al regenerar). */
export const deleteProductContentDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => PathInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { deleteDraftImage } = await import("./product-content-ai.server");
    await deleteDraftImage(data.path);
    return { ok: true as const };
  });

/** Promueve el borrador a almacenamiento estable y devuelve una URL que no expira. */
export const promoteProductContentDraft = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => PathInput.parse(data))
  .handler(async ({ data, context }) => {
    await assertAdmin(context);
    const { promoteDraftImage } = await import("./product-content-ai.server");
    return promoteDraftImage(data.path);
  });
