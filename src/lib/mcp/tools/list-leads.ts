import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertAdmin } from "../helpers";

export default defineTool({
  name: "list_leads",
  title: "Listar leads",
  description: "Devuelve leads (potenciales clientes) capturados desde la web. Requiere rol admin.",
  inputSchema: {
    limite: z.number().int().min(1).max(500).optional().describe("Máximo de leads a devolver (default 50)."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ limite }, ctx) => {
    const check = await assertAdmin(ctx);
    if (!check.ok) return { content: [{ type: "text", text: check.message }], isError: true };
    const { data, error } = await check.supabase
      .from("leads")
      .select("id, nombre, email, whatsapp, created_at")
      .order("created_at", { ascending: false })
      .limit(limite ?? 50);
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: JSON.stringify(data, null, 2) }],
      structuredContent: { items: data ?? [], total: data?.length ?? 0 },
    };
  },
});
