import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertAdmin, updateCell } from "../helpers";

const ESTADOS = ["PENDIENTE", "EN_REVISION", "ANALIZADO", "APROBADO", "PUBLICADO", "DESCARTADO"] as const;

export default defineTool({
  name: "update_carga_estado",
  title: "Cambiar estado de una carga",
  description: "Actualiza el estado de una carga (aprobar, descartar, etc.) por rowIndex. Requiere rol admin.",
  inputSchema: {
    rowIndex: z.number().int().min(2).max(2000).describe("Fila de la carga en CARGAS_USUARIOS."),
    estado: z.enum(ESTADOS).describe("Nuevo estado."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ rowIndex, estado }, ctx) => {
    const check = await assertAdmin(ctx);
    if (!check.ok) return { content: [{ type: "text", text: check.message }], isError: true };
    await updateCell("CARGAS_USUARIOS", `H${rowIndex}`, estado);
    return {
      content: [{ type: "text", text: `Carga fila ${rowIndex} → ${estado}` }],
      structuredContent: { ok: true, rowIndex, estado },
    };
  },
});
