// Generación asistida de imágenes comerciales (Fase 2 — Contenido IA).
// Server-only. Nunca reemplaza la foto original: produce BORRADORES en un bucket
// temporal ("ai-drafts") y devuelve la URL pública para revisión humana.

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

const REGLAS_DURAS = [
  "Conservá la identidad exacta del producto de la imagen de referencia: forma, silueta, costuras, logos, tipografías, color y proporciones.",
  "No inventes características, materiales, colores ni detalles que no estén en la imagen.",
  "No agregues texto, precios, sellos, marcas de agua ni claims publicitarios.",
  "No agregues ni quites elementos del producto.",
].join(" ");

const VARIANTES: Record<ContentVariant, { label: string; prompt: string }> = {
  catalogo: {
    label: "Catálogo limpio",
    prompt:
      "Foto de catálogo e-commerce: el producto centrado sobre fondo neutro liso y claro, iluminación suave y parcja, sin sombras duras, sin props ni escenografía.",
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

async function fetchReferenceAsDataUrl(url: string): Promise<string> {
  const res = await fetch(url, { headers: { "User-Agent": "VeraDeportes/1.0" } });
  if (!res.ok) {
    throw new Error(`No se pudo leer la imagen original [${res.status}]`);
  }
  const type = (res.headers.get("content-type") || "").split(";")[0]?.trim() || "";
  if (!/^image\/(png|jpe?g|webp)$/i.test(type)) {
    throw new Error(`La imagen original no es un formato soportado (${type || "desconocido"})`);
  }
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.byteLength < 500) throw new Error("La imagen original está vacía o no es accesible");
  return `data:${type};base64,${buf.toString("base64")}`;
}

function gatewayError(status: number, body: string): Error {
  if (status === 402) return new Error("Sin créditos de IA disponibles en el espacio de trabajo.");
  if (status === 403) return new Error("La IA está bloqueada por una política del espacio de trabajo.");
  if (status === 429) return new Error("Demasiadas solicitudes de IA. Esperá unos segundos y reintentá.");
  return new Error(`Falló la generación de imagen [${status}]: ${body.slice(0, 300)}`);
}

export async function generateDraftImage(
  variant: ContentVariant,
  producto: DraftProductData,
): Promise<{ url: string; variant: ContentVariant; createdAt: string }> {
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

  // Almacenamiento temporal de borradores: bucket público "ai-drafts".
  // No escribe en PRODUCTOS_ADMIN ni en la pestaña Productos.
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const path = `${variant}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const up = await supabaseAdmin.storage
    .from("ai-drafts")
    .upload(path, bytes, { contentType: mime, upsert: false });
  if (up.error) throw new Error(`No se pudo guardar el borrador: ${up.error.message}`);

  const { data } = supabaseAdmin.storage.from("ai-drafts").getPublicUrl(path);
  return { url: data.publicUrl, variant, createdAt: new Date().toISOString() };
}
