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

function sheetsHeaders() {
  const { lovableKey, sheetsKey } = sheetsEnv();
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": sheetsKey,
    "Content-Type": "application/json",
  };
}

export async function updateCell(sheetName: string, cell: string, value: string) {
  const { sheetId } = sheetsEnv();
  const range = `${sheetName}!${cell}`;
  const res = await fetch(
    `${SHEETS_GATEWAY}/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: sheetsHeaders(),
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [[value]] }),
    },
  );
  if (!res.ok) throw new Error(`Sheets update [${res.status}]: ${await res.text()}`);
}

export async function updateRow(sheetName: string, range: string, values: (string | number)[]) {
  const { sheetId } = sheetsEnv();
  const fullRange = `${sheetName}!${range}`;
  const res = await fetch(
    `${SHEETS_GATEWAY}/spreadsheets/${sheetId}/values/${fullRange}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: sheetsHeaders(),
      body: JSON.stringify({ range: fullRange, majorDimension: "ROWS", values: [values] }),
    },
  );
  if (!res.ok) throw new Error(`Sheets update [${res.status}]: ${await res.text()}`);
}

export async function appendRow(sheetName: string, cols: string, values: (string | number)[]) {
  const { sheetId } = sheetsEnv();
  // Anclar a A1 (ver admin-cargas.functions.ts): evita filas corridas a la derecha.
  void cols;
  const range = `${sheetName}!A1`;
  const res = await fetch(
    `${SHEETS_GATEWAY}/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: sheetsHeaders(),
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [values] }),
    },
  );
  if (!res.ok) throw new Error(`Sheets append [${res.status}]: ${await res.text()}`);
}
