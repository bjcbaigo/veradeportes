import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { appendRow, assertAdmin } from "../helpers";

export default defineTool({
  name: "publish_landing_product",
  title: "Publicar producto en la landing",
  description:
    "Agrega un producto nuevo a la pestaña Productos (visible en la web). Requiere rol admin.",
  inputSchema: {
    nombre: z.string().min(1).max(200),
    categoria: z.string().min(1).max(100),
    precio: z.string().min(1).max(50).describe("Precio como texto, ej: $85.000"),
    descripcion: z.string().max(2000).optional(),
    imagen_url: z.string().min(1).max(500),
    activo: z.boolean().optional().describe("Default true"),
    destacado: z.boolean().optional().describe("Default false"),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const check = await assertAdmin(ctx);
    if (!check.ok) return { content: [{ type: "text", text: check.message }], isError: true };
    const id = `L-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const activo = input.activo ?? true;
    const destacado = input.destacado ?? false;
    await appendRow("Productos", "A:H", [
      id,
      input.nombre,
      input.categoria,
      input.precio,
      input.descripcion ?? "",
      input.imagen_url,
      activo ? "TRUE" : "FALSE",
      destacado ? "TRUE" : "FALSE",
    ]);
    return {
      content: [{ type: "text", text: `Producto publicado con id ${id}` }],
      structuredContent: { ok: true, id },
    };
  },
});
