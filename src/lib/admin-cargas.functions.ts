import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const GATEWAY = "https://connector-gateway.lovable.dev/google_sheets/v4";

function env() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const sheetsKey = process.env.GOOGLE_SHEETS_API_KEY;
  const sheetId = process.env.PRODUCTS_SHEET_ID;
  if (!lovableKey || !sheetsKey || !sheetId) {
    throw new Error("Faltan credenciales de Google Sheets");
  }
  return { lovableKey, sheetsKey, sheetId };
}

function headers(lovableKey: string, sheetsKey: string) {
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": sheetsKey,
    "Content-Type": "application/json",
  };
}

async function assertAdmin(ctx: { supabase: any; userId: string }) {
  const { data, error } = await ctx.supabase.rpc("has_role", {
    _user_id: ctx.userId, _role: "admin",
  });
  if (error) throw new Error(error.message);
  if (!data) throw new Error("No autorizado");
}

async function fetchWithRetry(url: string, init: RequestInit): Promise<Response> {
  const delays = [400, 900, 1800];
  let res = await fetch(url, init);
  for (const d of delays) {
    if (res.status !== 429) return res;
    await new Promise((r) => setTimeout(r, d + Math.floor(Math.random() * 250)));
    res = await fetch(url, init);
  }
  return res;
}

async function readRange(range: string) {
  const { lovableKey, sheetsKey, sheetId } = env();
  const res = await fetchWithRetry(
    `${GATEWAY}/spreadsheets/${sheetId}/values/${range}`,
    { headers: headers(lovableKey, sheetsKey) },
  );
  if (res.status === 400 || res.status === 404) return [];
  if (!res.ok) throw new Error(`Sheets read [${res.status}]: ${await res.text()}`);
  const json = (await res.json()) as { values?: string[][] };
  return json.values ?? [];
}

async function appendRow(sheetName: string, cols: string, values: (string | number)[]) {
  const { lovableKey, sheetsKey, sheetId } = env();
  const range = `${sheetName}!${cols}`;
  const res = await fetchWithRetry(
    `${GATEWAY}/spreadsheets/${sheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`,
    {
      method: "POST",
      headers: headers(lovableKey, sheetsKey),
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [values] }),
    },
  );
  if (!res.ok) throw new Error(`Sheets append [${res.status}]: ${await res.text()}`);
}

async function updateCell(sheetName: string, cell: string, value: string) {
  const { lovableKey, sheetsKey, sheetId } = env();
  const range = `${sheetName}!${cell}`;
  const res = await fetchWithRetry(
    `${GATEWAY}/spreadsheets/${sheetId}/values/${range}?valueInputOption=USER_ENTERED`,
    {
      method: "PUT",
      headers: headers(lovableKey, sheetsKey),
      body: JSON.stringify({ range, majorDimension: "ROWS", values: [[value]] }),
    },
  );
  if (!res.ok) throw new Error(`Sheets update [${res.status}]: ${await res.text()}`);
}

/* ============ Inicializar pestañas ============ */
const TAB_HEADERS = {
  CARGAS_USUARIOS: ["ID","Fecha","Usuario","URL_Imagen","Marca_Sugerida","Categoria_Sugerida","Comentario","Estado","URL_Drive"],
  PRODUCTOS_ADMIN: ["ID","Fecha_Revision","URL_Imagen","Marca","Modelo","Categoria","Subcategoria","Descripcion_Comercial","Caracteristicas","Uso_Recomendado","Hashtags","Texto_Instagram","Texto_WhatsApp","Estado_Publicacion","Carga_ID","Imagenes_Extra"],
  CALENDARIO_PUBLICACIONES: ["ID","Producto_ID","Fecha_Publicacion","Canal","Tipo_Publicacion","Estado"],
} as const;

export const initAdminSheets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    const { lovableKey, sheetsKey, sheetId } = env();

    // Listar pestañas existentes
    const meta = await fetch(
      `${GATEWAY}/spreadsheets/${sheetId}?fields=sheets(properties(title))`,
      { headers: headers(lovableKey, sheetsKey) },
    );
    if (!meta.ok) throw new Error(`meta [${meta.status}]: ${await meta.text()}`);
    const metaJson = (await meta.json()) as { sheets?: { properties?: { title?: string } }[] };
    const existing = new Set((metaJson.sheets ?? []).map(s => s.properties?.title).filter(Boolean) as string[]);

    const toCreate = Object.keys(TAB_HEADERS).filter(n => !existing.has(n));
    if (toCreate.length > 0) {
      const requests = toCreate.map(title => ({ addSheet: { properties: { title } } }));
      const bu = await fetch(`${GATEWAY}/spreadsheets/${sheetId}:batchUpdate`, {
        method: "POST",
        headers: headers(lovableKey, sheetsKey),
        body: JSON.stringify({ requests }),
      });
      if (!bu.ok) throw new Error(`batchUpdate [${bu.status}]: ${await bu.text()}`);
    }

    // Escribir encabezados en cada pestaña (si la primer celda está vacía)
    for (const [name, cols] of Object.entries(TAB_HEADERS)) {
      const first = await readRange(`${name}!A1:A1`);
      if (!first[0] || !first[0][0]) {
        const endCol = String.fromCharCode("A".charCodeAt(0) + cols.length - 1);
        const range = `${name}!A1:${endCol}1`;
        const res = await fetch(
          `${GATEWAY}/spreadsheets/${sheetId}/values/${range}?valueInputOption=RAW`,
          {
            method: "PUT",
            headers: headers(lovableKey, sheetsKey),
            body: JSON.stringify({ range, majorDimension: "ROWS", values: [cols as unknown as string[]] }),
          },
        );
        if (!res.ok) throw new Error(`headers ${name} [${res.status}]: ${await res.text()}`);
      }
    }

    return { ok: true, created: toCreate };
  });

/* ============ Tipos ============ */
export type Carga = {
  rowIndex: number;
  id: string; fecha: string; usuario: string;
  url_imagen: string; marca: string; categoria: string;
  comentario: string; estado: string; url_drive: string;
};
export type Producto = {
  rowIndex: number;
  id: string; fecha_revision: string; url_imagen: string;
  marca: string; modelo: string; categoria: string; subcategoria: string;
  descripcion: string; caracteristicas: string; uso: string;
  hashtags: string; texto_ig: string; texto_wsp: string;
  estado: string; carga_id: string; imagenes_extra: string;
};
export type Agenda = {
  rowIndex: number;
  id: string; producto_id: string; fecha: string;
  canal: string; tipo: string; estado: string;
};

/* ============ Cargas ============ */
export const listCargas = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Carga[]> => {
    await assertAdmin(context as any);
    const rows = await readRange("CARGAS_USUARIOS!A2:I2000");
    return rows.map((r, i) => ({
      rowIndex: i + 2,
      id: r[0] ?? "", fecha: r[1] ?? "", usuario: r[2] ?? "",
      url_imagen: r[3] ?? "", marca: r[4] ?? "", categoria: r[5] ?? "",
      comentario: r[6] ?? "", estado: (r[7] ?? "PENDIENTE").toUpperCase(),
      url_drive: r[8] ?? "",
    }));
  });

const ESTADOS_CARGA = ["PENDIENTE","EN_REVISION","ANALIZADO","APROBADO","PUBLICADO","DESCARTADO"] as const;

export const updateCargaEstado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    rowIndex: z.number().int().min(2).max(2000),
    estado: z.enum(ESTADOS_CARGA),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    await updateCell("CARGAS_USUARIOS", `H${data.rowIndex}`, data.estado);
    return { ok: true };
  });

/* ============ Productos Admin ============ */
const ProductoInput = z.object({
  url_imagen: z.string().max(500),
  marca: z.string().min(1).max(80),
  modelo: z.string().max(120).default(""),
  categoria: z.string().max(80).default(""),
  subcategoria: z.string().max(80).default(""),
  descripcion: z.string().max(2000).default(""),
  caracteristicas: z.string().max(2000).default(""),
  uso: z.string().max(500).default(""),
  hashtags: z.string().max(500).default(""),
  texto_ig: z.string().max(2200).default(""),
  texto_wsp: z.string().max(2000).default(""),
  estado: z.enum(["APROBADO","PUBLICADO","DESCARTADO"]).default("APROBADO"),
  carga_id: z.string().max(80).default(""),
  carga_rowIndex: z.number().int().min(2).max(2000).optional(),
  imagenes_extra: z.string().max(3000).default(""),
});

export const aprobarYCrearProducto = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => ProductoInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const id = `P-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    const fecha = new Intl.DateTimeFormat("es-AR", {
      timeZone: "America/Argentina/Buenos_Aires",
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit", hour12: false,
    }).format(new Date());

    await appendRow("PRODUCTOS_ADMIN", "A:P", [
      id, fecha, data.url_imagen, data.marca, data.modelo,
      data.categoria, data.subcategoria, data.descripcion,
      data.caracteristicas, data.uso, data.hashtags,
      data.texto_ig, data.texto_wsp, data.estado, data.carga_id,
      data.imagenes_extra,
    ]);

    if (data.carga_rowIndex) {
      await updateCell("CARGAS_USUARIOS", `H${data.carga_rowIndex}`, data.estado);
    }
    return { ok: true, id };
  });

export const listProductosAdmin = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Producto[]> => {
    await assertAdmin(context as any);
    const rows = await readRange("PRODUCTOS_ADMIN!A2:P2000");
    return rows.map((r, i) => ({
      rowIndex: i + 2,
      id: r[0] ?? "", fecha_revision: r[1] ?? "", url_imagen: r[2] ?? "",
      marca: r[3] ?? "", modelo: r[4] ?? "", categoria: r[5] ?? "",
      subcategoria: r[6] ?? "", descripcion: r[7] ?? "",
      caracteristicas: r[8] ?? "", uso: r[9] ?? "", hashtags: r[10] ?? "",
      texto_ig: r[11] ?? "", texto_wsp: r[12] ?? "",
      estado: (r[13] ?? "APROBADO").toUpperCase(), carga_id: r[14] ?? "",
      imagenes_extra: r[15] ?? "",
    }));
  });

export const updateProductoEstado = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => z.object({
    rowIndex: z.number().int().min(2).max(2000),
    estado: z.enum(["APROBADO","PUBLICADO","DESCARTADO"]),
  }).parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    await updateCell("PRODUCTOS_ADMIN", `N${data.rowIndex}`, data.estado);
    return { ok: true };
  });

/* ============ Calendario ============ */
const AgendaInput = z.object({
  producto_id: z.string().min(1).max(80),
  fecha: z.string().min(1).max(40),
  canal: z.enum(["Instagram","WhatsApp","Facebook","Otro"]),
  tipo: z.string().max(80).default("Post"),
});

export const agendarPublicacion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => AgendaInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const id = `A-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    await appendRow("CALENDARIO_PUBLICACIONES", "A:F", [
      id, data.producto_id, data.fecha, data.canal, data.tipo, "PROGRAMADO",
    ]);
    return { ok: true, id };
  });

export const listAgenda = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<Agenda[]> => {
    await assertAdmin(context as any);
    const rows = await readRange("CALENDARIO_PUBLICACIONES!A2:F500");
    return rows.map((r, i) => ({
      rowIndex: i + 2,
      id: r[0] ?? "", producto_id: r[1] ?? "", fecha: r[2] ?? "",
      canal: r[3] ?? "", tipo: r[4] ?? "", estado: (r[5] ?? "PROGRAMADO").toUpperCase(),
    }));
  });

/* ============ Publicar en landing (pestaña Productos) ============ */
const PublicarInput = z.object({
  producto_rowIndex: z.number().int().min(2).max(2000),
  nombre: z.string().min(1).max(200),
  categoria: z.string().min(1).max(100),
  precio: z.string().min(1).max(50),
  descripcion: z.string().max(2000).default(""),
  imagen_url: z.string().min(1).max(500),
  destacado: z.boolean().default(false),
  imagenes_extra: z.string().max(3000).default(""),
});

export const publicarEnLanding = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d: unknown) => PublicarInput.parse(d))
  .handler(async ({ data, context }) => {
    await assertAdmin(context as any);
    const id = `L-${Date.now()}-${Math.random().toString(36).slice(2,6)}`;
    await appendRow("Productos", "A:I", [
      id, data.nombre, data.categoria, data.precio, data.descripcion,
      data.imagen_url, "TRUE", data.destacado ? "TRUE" : "FALSE",
      data.imagenes_extra,
    ]);
    await updateCell("PRODUCTOS_ADMIN", `N${data.producto_rowIndex}`, "PUBLICADO");
    return { ok: true, id };
  });

/* ============ Reset (vaciar hojas, conservando encabezados) ============ */
async function clearRows(sheetName: string, endCol: string) {
  const { lovableKey, sheetsKey, sheetId } = env();
  const range = `${sheetName}!A2:${endCol}10000`;
  const res = await fetch(
    `${GATEWAY}/spreadsheets/${sheetId}/values/${range}:clear`,
    { method: "POST", headers: headers(lovableKey, sheetsKey), body: "{}" },
  );
  if (!res.ok && res.status !== 400 && res.status !== 404) {
    throw new Error(`Sheets clear ${sheetName} [${res.status}]: ${await res.text()}`);
  }
}

export const resetAllSheets = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context as any);
    await clearRows("CARGAS_USUARIOS", "I");
    await clearRows("PRODUCTOS_ADMIN", "P");
    await clearRows("Productos", "I");
    return { ok: true };
  });
