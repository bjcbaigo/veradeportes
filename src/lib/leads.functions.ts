import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type Lead = {
  id: string;
  nombre: string;
  whatsapp: string | null;
  email: string | null;
  created_at: string;
};

export const listLeads = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const ctx = context as { supabase: any; userId: string };
    const { data: isAdmin, error: roleError } = await ctx.supabase.rpc("has_role", {
      _user_id: ctx.userId,
      _role: "admin",
    });
    if (roleError) throw new Error(roleError.message);
    if (!isAdmin) throw new Error("No autorizado");

    const { data, error } = await ctx.supabase
      .from("leads")
      .select("id, nombre, whatsapp, email, created_at")
      .order("created_at", { ascending: false });
    if (error) throw new Error(error.message);
    return (data ?? []) as Lead[];
  });
