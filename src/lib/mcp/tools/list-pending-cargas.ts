import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertAdmin, readRange } from "../helpers";

export default defineTool({
  name: "list_pending_cargas",
  title: "Listar cargas pendientes",
  description: "Devuelve las cargas de fotos de productos con estado PENDIENTE (o todas si se indica). Requiere rol admin.",
  inputSchema: {
    incluir_todas: z
      .boolean()
      .optional()
      .describe("Si es true devuelve todas las cargas, no solo las PENDIENTE."),
    limite: z.number().int().min(1).max(200).optional().describe("Máximo de filas a devolver."),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ incluir_todas, limite }, ctx) => {
    const check = await assertAdmin(ctx);
    if (!check.ok) return { content: [{ type: "text", text: check.message }], isError: true };

    const rows = await readRange("CARGAS_USUARIOS!A2:I2000");
    const cargas = rows.map((r, i) => ({
      rowIndex: i + 2,
      id: r[0] ?? "",
      fecha: r[1] ?? "",
      usuario: r[2] ?? "",
      url_imagen: r[3] ?? "",
      marca_sugerida: r[4] ?? "",
      categoria_sugerida: r[5] ?? "",
      comentario: r[6] ?? "",
      estado: (r[7] ?? "PENDIENTE").toUpperCase(),
      url_drive: r[8] ?? "",
    }));
    const filtered = incluir_todas ? cargas : cargas.filter((c) => c.estado === "PENDIENTE");
    const out = filtered.slice(0, limite ?? 50);
    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
      structuredContent: { items: out, total: filtered.length },
    };
  },
});
