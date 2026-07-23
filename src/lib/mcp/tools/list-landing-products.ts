import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertAdmin, readRange } from "../helpers";

export default defineTool({
  name: "list_landing_products",
  title: "Listar productos publicados",
  description:
    "Devuelve los productos de la pestaña Productos (los que ve la landing pública). Requiere rol admin.",
  inputSchema: {
    solo_activos: z.boolean().optional().describe("Si es true devuelve solo activos."),
    limite: z.number().int().min(1).max(500).optional(),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ solo_activos, limite }, ctx) => {
    const check = await assertAdmin(ctx);
    if (!check.ok) return { content: [{ type: "text", text: check.message }], isError: true };
    const rows = await readRange("Productos!A2:H1000");
    const items = rows.map((r, i) => ({
      rowIndex: i + 2,
      id: r[0] ?? "",
      nombre: r[1] ?? "",
      categoria: r[2] ?? "",
      precio: r[3] ?? "",
      descripcion: r[4] ?? "",
      imagen_url: r[5] ?? "",
      activo: (r[6] ?? "").toUpperCase() === "TRUE",
      destacado: (r[7] ?? "").toUpperCase() === "TRUE",
    }));
    const filtered = solo_activos ? items.filter((p) => p.activo) : items;
    const out = filtered.slice(0, limite ?? 100);
    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
      structuredContent: { items: out, total: filtered.length },
    };
  },
});
