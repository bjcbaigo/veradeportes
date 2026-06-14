import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const SHEET_NAME = "clientes_online";

const Input = z.object({
  nombre: z.string().min(1).max(120),
  email: z.string().email().max(200),
  telefono: z.string().min(6).max(30),
});

export const appendLeadToSheet = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const lovableKey = process.env.LOVABLE_API_KEY;
    const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
    const sheetId = process.env.LEADS_SHEET_ID;
    if (!lovableKey || !sheetsKey || !sheetId) {
      throw new Error("Faltan credenciales de Google Sheets");
    }

    const now = new Date();
    const tz = "America/Argentina/Buenos_Aires";
    const fecha = new Intl.DateTimeFormat("es-AR", {
      timeZone: tz,
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(now);
    const hora = new Intl.DateTimeFormat("es-AR", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).format(now);

    const range = `${SHEET_NAME}!A:E`;
    const res = await fetch(
      `${GATEWAY}/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": sheetsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          range,
          majorDimension: "ROWS",
          values: [[fecha, hora, data.nombre, data.email, data.telefono]],
        }),
      },
    );
    if (!res.ok) {
      throw new Error(`Sheets append failed [${res.status}]: ${await res.text()}`);
    }
    return { ok: true };
  });

