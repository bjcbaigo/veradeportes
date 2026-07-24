import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const SHEET_NAME = "Productos";

function sheetEnv() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.PRODUCTS_SHEET_ID;
  if (!lovableKey || !sheetsKey || !sheetId) {
    throw new Error("Missing Google Sheets credentials");
  }
  return { lovableKey, sheetsKey, sheetId };
}

function gwHeaders(lovableKey: string, sheetsKey: string) {
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": sheetsKey,
    "Content-Type": "application/json",
  };
}

export type SheetProduct = {
  id: string;
  nombre: string;
  categoria: string;
  precio: string;
  descripcion: string;
  imagen_url: string;
  activo: boolean;
  destacado: boolean;
  imagenes_extra: string; // pipe-separated URLs
  rowIndex: number; // 1-based sheet row (header = 1)
};

export const listSheetProducts = createServerFn({ method: "GET" }).handler(
  async (): Promise<SheetProduct[]> => {
    const { lovableKey, sheetsKey, sheetId } = sheetEnv();
    const res = await fetch(
      `${GATEWAY}/spreadsheets/${sheetId}/values/${SHEET_NAME}!A1:I1000`,
      { headers: gwHeaders(lovableKey, sheetsKey) },
    );
    if (!res.ok) {
      throw new Error(`Sheets read failed [${res.status}]: ${await res.text()}`);
    }
    const json = (await res.json()) as { values?: string[][] };
    const rows = json.values ?? [];
    if (rows.length < 2) return [];
    return rows.slice(1).map((r, i) => ({
      id: r[0] ?? "",
      nombre: r[1] ?? "",
      categoria: r[2] ?? "",
      precio: r[3] ?? "",
      descripcion: r[4] ?? "",
      imagen_url: r[5] ?? "",
      activo: (r[6] ?? "").toUpperCase() === "TRUE",
      destacado: (r[7] ?? "").toUpperCase() === "TRUE",
      imagenes_extra: r[8] ?? "",
      rowIndex: i + 2,
    }));
  },
);

const UpdateInput = z.object({
  rowIndex: z.number().int().min(2).max(1001),
  nombre: z.string().min(1).max(200),
  categoria: z.string().min(1).max(100),
  precio: z.string().max(50),
  descripcion: z.string().max(2000),
  imagen_url: z.string().max(500),
  activo: z.boolean(),
  destacado: z.boolean(),
  imagenes_extra: z.string().max(3000).default(""),
});

export const updateSheetProduct = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => UpdateInput.parse(data))
  .handler(async ({ data }) => {
    const { lovableKey, sheetsKey, sheetId } = sheetEnv();
    const range = `${SHEET_NAME}!B${data.rowIndex}:I${data.rowIndex}`;
    const body = {
      range,
      majorDimension: "ROWS",
      values: [[
        data.nombre,
        data.categoria,
        data.precio,
        data.descripcion,
        data.imagen_url,
        data.activo ? "TRUE" : "FALSE",
        data.destacado ? "TRUE" : "FALSE",
        data.imagenes_extra,
      ]],
    };
    const res = await fetch(
      `${GATEWAY}/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`,
      {
        method: "PUT",
        headers: gwHeaders(lovableKey, sheetsKey),
        body: JSON.stringify(body),
      },
    );
    if (!res.ok) {
      throw new Error(`Sheets update failed [${res.status}]: ${await res.text()}`);
    }
    return { ok: true };
  });
