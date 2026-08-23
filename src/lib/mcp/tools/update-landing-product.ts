import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertAdmin, readRange, updateRow } from "../helpers";

export default defineTool({
  name: "update_landing_product",
  title: "Editar producto de la landing",
  description:
    "Actualiza campos de un producto existente en la pestaña Productos por rowIndex. Solo se modifican los campos que envíes. Requiere rol admin.",
  inputSchema: {
    rowIndex: z.number().int().min(2).max(1001).describe("Fila del producto en Productos."),
    nombre: z.string().min(1).max(200).optional(),
    categoria: z.string().min(1).max(100).optional(),
    precio: z.string().max(50).optional(),
    descripcion: z.string().max(2000).optional(),
    imagen_url: z.string().max(500).optional(),
    activo: z.boolean().optional(),
    destacado: z.boolean().optional(),
    genero: z.string().max(40).optional().describe("Género (columna P). Vacío para quitar."),
    precio_anterior: z.string().max(50).optional().describe("Precio anterior para ofertas (columna Q, se muestra tachado). Vacío para quitar."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async (input, ctx) => {
    const check = await assertAdmin(ctx);
    if (!check.ok) return { content: [{ type: "text", text: check.message }], isError: true };

    const rows = await readRange(`Productos!A${input.rowIndex}:H${input.rowIndex}`);
    const cur = rows[0] ?? [];
    if (!cur[0]) {
      return {
        content: [{ type: "text", text: `No hay producto en la fila ${input.rowIndex}` }],
        isError: true,
      };
    }
    const nombre = input.nombre ?? cur[1] ?? "";
    const categoria = input.categoria ?? cur[2] ?? "";
    const precio = input.precio ?? cur[3] ?? "";
    const descripcion = input.descripcion ?? cur[4] ?? "";
    const imagen_url = input.imagen_url ?? cur[5] ?? "";
    const activo =
      input.activo ?? (cur[6] ?? "").toUpperCase() === "TRUE";
    const destacado =
      input.destacado ?? (cur[7] ?? "").toUpperCase() === "TRUE";

    await updateRow("Productos", `B${input.rowIndex}:H${input.rowIndex}`, [
      nombre,
      categoria,
      precio,
      descripcion,
      imagen_url,
      activo ? "TRUE" : "FALSE",
      destacado ? "TRUE" : "FALSE",
    ]);
    if (input.genero !== undefined) {
      await updateRow("Productos", `P${input.rowIndex}`, [input.genero]);
    }
    if (input.precio_anterior !== undefined) {
      await updateRow("Productos", `Q${input.rowIndex}`, [input.precio_anterior]);
    }
    return {
      content: [{ type: "text", text: `Producto fila ${input.rowIndex} actualizado` }],
      structuredContent: {
        ok: true,
        rowIndex: input.rowIndex,
        producto: { id: cur[0], nombre, categoria, precio, descripcion, imagen_url, activo, destacado },
      },
    };
  },
});
