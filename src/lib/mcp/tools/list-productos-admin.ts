import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertAdmin, readRange } from "../helpers";

export default defineTool({
  name: "list_productos_admin",
  title: "Listar productos internos (aprobados)",
  description:
    "Devuelve el catálogo interno de la pestaña PRODUCTOS_ADMIN (fichas aprobadas listas para publicar). Requiere rol admin.",
  inputSchema: {
    estado: z.enum(["APROBADO", "PUBLICADO", "DESCARTADO"]).optional(),
    limite: z.number().int().min(1).max(500).optional(),
  },
  annotations: { readOnlyHint: true, openWorldHint: false },
  handler: async ({ estado, limite }, ctx) => {
    const check = await assertAdmin(ctx);
    if (!check.ok) return { content: [{ type: "text", text: check.message }], isError: true };
    const rows = await readRange("PRODUCTOS_ADMIN!A2:O2000");
    const items = rows.map((r, i) => ({
      rowIndex: i + 2,
      id: r[0] ?? "",
      fecha_revision: r[1] ?? "",
      url_imagen: r[2] ?? "",
      marca: r[3] ?? "",
      modelo: r[4] ?? "",
      categoria: r[5] ?? "",
      subcategoria: r[6] ?? "",
      descripcion: r[7] ?? "",
      caracteristicas: r[8] ?? "",
      uso: r[9] ?? "",
      hashtags: r[10] ?? "",
      texto_ig: r[11] ?? "",
      texto_wsp: r[12] ?? "",
      estado: (r[13] ?? "APROBADO").toUpperCase(),
      carga_id: r[14] ?? "",
    }));
    const filtered = estado ? items.filter((p) => p.estado === estado) : items;
    const out = filtered.slice(0, limite ?? 100);
    return {
      content: [{ type: "text", text: JSON.stringify(out, null, 2) }],
      structuredContent: { items: out, total: filtered.length },
    };
  },
});
