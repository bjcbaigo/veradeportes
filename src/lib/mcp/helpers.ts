import { createClient } from "@supabase/supabase-js";
import type { ToolContext } from "@lovable.dev/mcp-js";

export function supabaseAsUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function assertAdmin(ctx: ToolContext) {
  if (!ctx.isAuthenticated()) {
    return { ok: false as const, message: "No autenticado" };
  }
  const supa = supabaseAsUser(ctx);
  const { data, error } = await supa.rpc("has_role", {
    _user_id: ctx.getUserId(),
    _role: "admin",
  });
  if (error) return { ok: false as const, message: error.message };
  if (!data) return { ok: false as const, message: "No autorizado: se requiere rol admin" };
  return { ok: true as const, supabase: supa };
}

const SHEETS_GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

export function sheetsEnv() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.PRODUCTS_SHEET_ID;
  if (!lovableKey || !sheetsKey || !sheetId) {
    throw new Error("Faltan credenciales de Google Sheets");
  }
  return { lovableKey, sheetsKey, sheetId };
}

export async function readRange(range: string): Promise<string[][]> {
  const { lovableKey, sheetsKey, sheetId } = sheetsEnv();
  const res = await fetch(`${SHEETS_GATEWAY}/spreadsheets/${sheetId}/values/${range}`, {
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": sheetsKey,
    },
  });
  if (res.status === 400 || res.status === 404) return [];
  if (!res.ok) throw new Error(`Sheets read [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as { values?: string[][] };
  return json.values ?? [];
}

export async function updateCell(sheetName: string, cell: string, value: string) {
  const { lovableKey, sheetsKey, sheetId } = sheetsEnv();
  const range = `${sheetName}!${cell}`;
  const res = await fetch(
    `${SHEETS_GATEWAY}/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": sheetsKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [[value]] }),
    },
  );
  if (!res.ok) throw new Error(`Sheets update [${res.status}]: ${await res.text()}`);
}
