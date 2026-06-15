import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const SHEETS_GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";
const DRIVE_UPLOAD = "https://connector-gateway.lovable.dev/google_drive/upload/drive/v3/files";
const DRIVE_API = "https://connector-gateway.lovable.dev/google_drive/drive/v3";
const SHEET_NAME = "CARGAS_USUARIOS";

function env() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
  const driveKey = process.env.GOOGLE_DRIVE_API_KEY;
  const sheetId = process.env.PRODUCTS_SHEET_ID;
  const folderId = process.env.DRIVE_UPLOADS_FOLDER_ID;
  const pin = process.env.UPLOAD_ACCESS_PIN;
  if (!lovableKey || !sheetsKey || !driveKey || !sheetId || !folderId || !pin) {
    throw new Error("Faltan credenciales del servidor");
  }
  return { lovableKey, sheetsKey, driveKey, sheetId, folderId, pin };
}

const Input = z.object({
  pin: z.string().min(1).max(50),
  usuario: z.string().trim().min(1).max(80),
  marca: z.string().trim().max(80).optional().default(""),
  categoria: z.string().trim().max(80).optional().default(""),
  comentario: z.string().trim().max(500).optional().default(""),
  filename: z.string().min(1).max(120),
  mime: z.string().regex(/^image\/(png|jpeg|jpg|webp|heic|heif)$/i),
  // base64 sin prefijo data:
  dataBase64: z.string().min(100).max(15_000_000),
});

export const submitUpload = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const { lovableKey, sheetsKey, driveKey, sheetId, folderId, pin } = env();

    if (data.pin !== pin) {
      throw new Error("PIN incorrecto");
    }

    // 1) Subir imagen a Drive (multipart)
    const boundary = "veraboundary" + Math.random().toString(36).slice(2);
    const metadata = {
      name: `${Date.now()}-${data.filename}`.replace(/[^\w.\-]+/g, "_"),
      parents: [folderId],
    };
    const bytes = Buffer.from(data.dataBase64, "base64");
    const head =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\n` +
      `Content-Type: ${data.mime}\r\n` +
      `Content-Transfer-Encoding: base64\r\n\r\n`;
    const tail = `\r\n--${boundary}--`;
    const body = Buffer.concat([
      Buffer.from(head, "utf8"),
      Buffer.from(data.dataBase64, "utf8"),
      Buffer.from(tail, "utf8"),
    ]);

    const upRes = await fetch(
      `${DRIVE_UPLOAD}?uploadType=multipart&fields=id,name,webViewLink`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${lovableKey}`,
          "X-Connection-Api-Key": driveKey,
          "Content-Type": `multipart/related; boundary=${boundary}`,
          "Content-Length": String(body.length),
        },
        body,
      },
    );
    if (!upRes.ok) {
      throw new Error(`Drive upload failed [${upRes.status}]: ${await upRes.text()}`);
    }
    const file = (await upRes.json()) as { id: string; webViewLink?: string };

    // 2) Hacer público (anyone reader)
    await fetch(`${DRIVE_API}/files/${file.id}/permissions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": driveKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ role: "reader", type: "anyone" }),
    });

    const publicUrl = `https://lh3.googleusercontent.com/d/${file.id}`;
    const viewUrl = file.webViewLink ?? `https://drive.google.com/file/d/${file.id}/view`;

    // 3) Append a CARGAS_USUARIOS
    const id = `C-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const fecha = new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date());

    const range = `${SHEET_NAME}!A:I`;
    const appRes = await fetch(
      `${SHEETS_GATEWAY}/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
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
          values: [[
            id, fecha, data.usuario, publicUrl,
            data.marca, data.categoria, data.comentario,
            "PENDIENTE", viewUrl,
          ]],
        }),
      },
    );
    if (!appRes.ok) {
      throw new Error(`Sheets append failed [${appRes.status}]: ${await appRes.text()}`);
    }

    return { ok: true, id, url: publicUrl };
  });

// Verificar PIN sin subir nada (para gate del formulario)
export const verifyUploadPin = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => z.object({ pin: z.string().min(1).max(50) }).parse(data))
  .handler(async ({ data }) => {
    const expected = process.env.UPLOAD_ACCESS_PIN;
    if (!expected) throw new Error("PIN no configurado");
    return { ok: data.pin === expected };
  });
