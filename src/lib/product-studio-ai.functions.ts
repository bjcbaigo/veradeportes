import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const suggestProductMetadata = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data) =>
    z
      .object({
        marca: z.string().min(1),
        modelo: z.string().optional(),
        categoria: z.string().optional(),
        subcategoria: z.string().optional(),
        descripcion: z.string().optional(),
        caracteristicas: z.string().optional(),
        uso: z.string().optional(),
        color: z.string().optional(),
        ideal_para: z.string().optional(),
        sellos: z.string().optional(),
        genero: z.string().optional(),
      })
      .parse(data),
  )
  .handler(async ({ data, context }) => {
    const { data: isAdmin } = await context.supabase.rpc("has_role", {
      _user_id: context.userId,
      _role: "admin",
    });
    if (!isAdmin) throw new Error("No autorizado: se requiere rol admin");
    const { runSuggestion } = await import("./product-studio-ai.server");
    return runSuggestion(data);
  });
