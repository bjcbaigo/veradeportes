// Generación asistida de imágenes comerciales (Fase 2 — Contenido IA).
// Server-only. Nunca reemplaza la foto original: produce BORRADORES en un bucket
// PRIVADO ("ai-drafts") y devuelve una signed URL temporal solo para previsualizar.
// Los borradores aprobados se COPIAN a un bucket público estable ("ai-aprobados")
// para poder guardarlos como imagen secundaria con una URL que no expira.
//
// IMPORTANTE: el modelo INTENTA preservar la identidad del producto, pero no hay
// garantía de fidelidad. La aprobación humana es obligatoria.

export type ContentVariant = "catalogo" | "editorial" | "modelo" | "detalle";

export interface DraftProductData {
  marca?: string;
  modelo?: string;
  categoria?: string;
  color?: string;
  descripcion?: string;
  imagen_url: string;
}

const IMAGE_MODEL = "google/gemini-3.1-flash-image";
const GATEWAY = "https://ai.gateway.lovable.dev/v1/chat/completions";

export const DRAFT_BUCKET = "ai-drafts";
export const APPROVED_BUCKET = "ai-aprobados";
const SIGNED_URL_TTL = 60 * 60; // 1 hora, solo para preview
const MAX_REFERENCE_BYTES = 10 * 1024 * 1024; // 10 MB
const FETCH_TIMEOUT_MS = 15_000;

const REGLAS_DURAS = [
  "Intentá preservar con la mayor fidelidad posible la identidad del producto de la imagen de referencia: forma, silueta, costuras, logos, tipografías, color y proporciones.",
  "No inventes características, materiales, colores ni detalles que no estén en la imagen.",
  "No agregues texto, precios, sellos, marcas de agua ni claims publicitarios.",
  "No agregues ni quites elementos del producto.",
].join(" ");

const VARIANTES: Record<ContentVariant, { label: string; prompt: string }> = {
  catalogo: {
    label: "Catálogo limpio",
    prompt:
      "Foto de catálogo e-commerce: el producto centrado sobre fondo neutro liso y claro, iluminación suave y pareja, sin sombras duras, sin props ni escenografía.",
  },
  editorial: {
    label: "Editorial",
    prompt:
      "Escena deportiva cálida de estilo editorial: luz natural cálida, ambiente deportivo real (cancha, pista o gimnasio) desenfocado, el producto como protagonista nítido en primer plano.",
  },
  modelo: {
    label: "Modelo en uso",
    prompt:
      "Producto en uso por una persona con estilo deportivo profesional, actitud atlética y ropa deportiva sobria. Encuadre centrado en el producto, rostro fuera de cuadro cuando sea posible, sin ningún énfasis sexual ni poses sugestivas.",
  },
  detalle: {
    label: "Detalle / Textura",
    prompt:
      "Primer plano macro del producto: foco en textura del material, costuras y terminaciones, profundidad de campo corta, iluminación lateral suave.",
  },
};

export function variantLabel(v: ContentVariant) {
  return VARIANTES[v].label;
}

function buildPrompt(v: ContentVariant, p: DraftProductData) {
  const ficha = [
    p.marca && `Marca: ${p.marca}`,
    p.modelo && `Modelo: ${p.modelo}`,
    p.categoria && `Categoría: ${p.categoria}`,
    p.color && `Color: ${p.color}`,
    p.descripcion && `Descripción: ${p.descripcion}`,
  ]
    .filter(Boolean)
    .join(" | ");

  return [
    `Generá una imagen comercial a partir de la imagen de referencia adjunta. Variante: ${VARIANTES[v].label}.`,
    VARIANTES[v].prompt,
    ficha ? `Datos de la ficha (solo contexto, no los escribas en la imagen): ${ficha}.` : "",
    REGLAS_DURAS,
    "Formato cuadrado 1:1, calidad fotográfica realista.",
  ]
    .filter(Boolean)
    .join("\n");
}

// ── Endurecimiento de la descarga de la imagen de referencia ──────────────────

function isBlockedHost(host: string): boolean {
  const h = host.toLowerCase().replace(/^\[|\]$/g, "");
  if (h === "localhost" || h.endsWith(".localhost") || h.endsWith(".local") || h === "0.0.0.0") return true;
  if (h === "metadata.google.internal") return true;

  // IPv4
  const m4 = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/.exec(h);
  if (m4) {
    const [a, b] = [Number(m4[1]), Number(m4[2])];
    if (a === 10 || a === 127 || a === 0) return true;
    if (a === 172 && b >= 16 && b <= 31) return true;
    if (a === 192 && b === 168) return true;
    if (a === 169 && b === 254) return true; // link-local
    if (a === 100 && b >= 64 && b <= 127) return true; // CGNAT
    if (a >= 224) return true; // multicast / reservado
    return false;
  }

  // IPv6
  if (h.includes(":")) {
    if (h === "::1" || h === "::") return true;
    if (/^f[cd]/.test(h)) return true; // ULA fc00::/7
    if (/^fe[89ab]/.test(h)) return true; // link-local
    if (/^::ffff:/.test(h)) return isBlockedHost(h.replace(/^::ffff:/, ""));
    return false;
  }
  return false;
}

const BLOCK_MSG = "La URL de la imagen original apunta a una dirección no permitida";

/** ¿El hostname ya es una IP literal (IPv4 o IPv6)? */
function isLiteralIp(host: string): boolean {
  const h = host.replace(/^\[|\]$/g, "");
  if (/^\d{1,3}(\.\d{1,3}){3}$/.test(h)) return true;
  if (h.includes(":")) return true;
  return false;
}

/**
 * Resuelve DNS y valida TODAS las direcciones (IPv4 e IPv6) del hostname.
 * Rechaza si cualquiera cae en loopback, link-local, privada/ULA, CGNAT,
 * unspecified, multicast/reservado o IPv4-mapped IPv6 equivalente.
 * Protege contra DNS rebinding: un hostname público que resuelva a red interna
 * no pasa el control, y se repite en cada destino de redirect.
 */
async function assertSafeHostname(host: string): Promise<void> {
  if (isBlockedHost(host)) throw new Error(BLOCK_MSG);
  if (isLiteralIp(host)) return; // literal ya validado por isBlockedHost
  const { lookup } = await import("node:dns/promises");
  let addrs: Array<{ address: string; family: number }>;
  try {
    addrs = await lookup(host, { all: true, verbatim: true });
  } catch {
    throw new Error("No se pudo resolver el dominio de la imagen original");
  }
  if (!addrs.length) throw new Error("No se pudo resolver el dominio de la imagen original");
  for (const a of addrs) {
    if (isBlockedHost(a.address)) throw new Error(BLOCK_MSG);
  }
}

async function assertSafeUrl(raw: string): Promise<URL> {
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    throw new Error("La URL de la imagen original no es válida");
  }
  if (u.protocol !== "http:" && u.protocol !== "https:") {
    throw new Error("Solo se admiten imágenes por http o https");
  }
  await assertSafeHostname(u.hostname);
  return u;
}

async function fetchReferenceAsDataUrl(url: string): Promise<string> {
  let current = await assertSafeUrl(url);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    let res: Response | undefined;
    // Seguimos redirects manualmente para validar cada destino.
    for (let hop = 0; hop < 5; hop++) {
      res = await fetch(current.toString(), {
        redirect: "manual",
        signal: controller.signal,
        headers: { "User-Agent": "VeraDeportes/1.0" },
      });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get("location");
        if (!loc) throw new Error("La imagen original respondió una redirección inválida");
        current = await assertSafeUrl(new URL(loc, current).toString());
        continue;
      }
      break;
    }
    if (!res) throw new Error("No se pudo leer la imagen original");
    if (res.status >= 300) {
      throw new Error(`No se pudo leer la imagen original [${res.status}]`);
    }

    const type = (res.headers.get("content-type") || "").split(";")[0]?.trim() || "";
    if (!/^image\/(png|jpe?g|webp)$/i.test(type)) {
      throw new Error(`La imagen original no es un formato soportado (${type || "desconocido"})`);
    }

    const declared = Number(res.headers.get("content-length") || "0");
    if (declared > MAX_REFERENCE_BYTES) {
      throw new Error("La imagen original supera el máximo permitido (10 MB)");
    }

    const chunks: Uint8Array[] = [];
    let total = 0;
    const reader = res.body?.getReader();
    if (!reader) throw new Error("La imagen original no devolvió contenido");
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) {
        total += value.byteLength;
        if (total > MAX_REFERENCE_BYTES) {
          await reader.cancel().catch(() => {});
          throw new Error("La imagen original supera el máximo permitido (10 MB)");
        }
        chunks.push(value);
      }
    }
    const buf = Buffer.concat(chunks.map((c) => Buffer.from(c)));
    if (buf.byteLength < 500) throw new Error("La imagen original está vacía o no es accesible");
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch (e) {
    if (e instanceof Error && e.name === "AbortError") {
      throw new Error("La lectura de la imagen original tardó demasiado (timeout)");
    }
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

function gatewayError(status: number, body: string): Error {
  if (status === 402) return new Error("Sin créditos de IA disponibles en el espacio de trabajo.");
  if (status === 403) return new Error("La IA está bloqueada por una política del espacio de trabajo.");
  if (status === 429) return new Error("Demasiadas solicitudes de IA. Esperá unos segundos y reintentá.");
  return new Error(`Falló la generación de imagen [${status}]: ${body.slice(0, 300)}`);
}

export interface DraftResult {
  /** Ruta dentro del bucket privado; sirve para borrar o promover el borrador. */
  path: string;
  /** Signed URL temporal, SOLO para preview. Nunca guardar en imagenes_extra. */
  previewUrl: string;
  variant: ContentVariant;
  createdAt: string;
}

export async function generateDraftImage(
  variant: ContentVariant,
  producto: DraftProductData,
): Promise<DraftResult> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) throw new Error("Falta LOVABLE_API_KEY en el servidor");

  const reference = await fetchReferenceAsDataUrl(producto.imagen_url);

  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
      "X-Lovable-AIG-SDK": "fetch",
    },
    body: JSON.stringify({
      model: IMAGE_MODEL,
      modalities: ["image", "text"],
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: buildPrompt(variant, producto) },
            { type: "image_url", image_url: { url: reference } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) throw gatewayError(res.status, await res.text());

  const json = (await res.json()) as {
    choices?: Array<{ message?: { images?: Array<{ image_url?: { url?: string } }> } }>;
  };
  const dataUrl = json.choices?.[0]?.message?.images?.[0]?.image_url?.url;
  if (!dataUrl?.startsWith("data:image/")) {
    throw new Error("El modelo no devolvió una imagen. Reintentá la generación.");
  }

  const [meta, b64] = dataUrl.split(",", 2);
  const mime = meta?.slice(5).split(";")[0] || "image/png";
  const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : "png";
  const bytes = Buffer.from(b64 ?? "", "base64");

  // Almacenamiento temporal de borradores: bucket PRIVADO "ai-drafts".
  // No escribe en PRODUCTOS_ADMIN ni en la pestaña Productos.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const path = `${variant}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabaseAdmin.storage
    .from(DRAFT_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (up.error) throw new Error(`No se pudo guardar el borrador: ${up.error.message}`);

  const signed = await supabaseAdmin.storage.from(DRAFT_BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (signed.error || !signed.data?.signedUrl) {
    throw new Error(`No se pudo generar el enlace de previsualización: ${signed.error?.message ?? "desconocido"}`);
  }

  return { path, previewUrl: signed.data.signedUrl, variant, createdAt: new Date().toISOString() };
}

/** Elimina físicamente un borrador del bucket privado. */
export async function deleteDraftImage(path: string): Promise<void> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { error } = await supabaseAdmin.storage.from(DRAFT_BUCKET).remove([path]);
  if (error) throw new Error(`No se pudo eliminar el borrador: ${error.message}`);
}

/**
 * Copia el borrador aprobado al bucket público estable y elimina el temporal.
 * Devuelve una URL pública que NO expira, apta para guardar como imagen secundaria.
 */
export async function promoteDraftImage(path: string): Promise<{ url: string }> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const dl = await supabaseAdmin.storage.from(DRAFT_BUCKET).download(path);
  if (dl.error || !dl.data) {
    throw new Error(`No se pudo leer el borrador para aprobarlo: ${dl.error?.message ?? "no existe"}`);
  }
  const mime = dl.data.type || "image/png";
  const bytes = Buffer.from(await dl.data.arrayBuffer());
  const up = await supabaseAdmin.storage
    .from(APPROVED_BUCKET)
    .upload(path, bytes, { contentType: mime, upsert: true });
  if (up.error) throw new Error(`No se pudo aprobar el borrador: ${up.error.message}`);

  // El temporal ya no hace falta: evita huérfanos.
  await supabaseAdmin.storage.from(DRAFT_BUCKET).remove([path]).catch(() => {});

  const { data } = supabaseAdmin.storage.from(APPROVED_BUCKET).getPublicUrl(path);
  return { url: data.publicUrl };
}
