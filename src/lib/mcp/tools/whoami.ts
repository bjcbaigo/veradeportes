import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { assertAdmin } from "../helpers";

export default defineTool({
  name: "whoami",
  title: "Quién soy",
  description: "Devuelve el usuario autenticado y si tiene rol admin en Vera Deportes.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "No autenticado" }], isError: true };
    }
    const check = await assertAdmin(ctx);
    const info = {
      userId: ctx.getUserId(),
      email: ctx.getUserEmail(),
      isAdmin: check.ok,
    };
    return {
      content: [{ type: "text", text: JSON.stringify(info) }],
      structuredContent: info,
    };
  },
});
