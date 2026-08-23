// Server-only: llamada al gateway de IA para sugerir metadatos de ficha.
// La IA ANALIZA y PROPONE. Nunca guarda ni publica: el operador decide en la UI.
import { z } from "zod";
import {
  IDEAL_PARA_OPTIONS,
  SELLOS_OPTIONS,
  GENERO_OPTIONS,
} from "./product-taxonomy";

export const CATEGORIAS_CATALOGO = [
  "Zapatillas",
  "Botines",
  "Ojotas",
  "Indumentaria",
  "Accesorios",
] as const;

const confidence = z.enum(["alta", "media", "baja"]);
const strField = z.object({ value: z.string().default(""), confidence: confidence.default("baja") });
const arrField = z.object({ value: z.array(z.string()).default([]), confidence: confidence.default("baja") });

export const aiSuggestionSchema = z.object({
  modelo: strField,
  genero: strField,
  categoria: strField,
  subcategoria: strField,
  color: strField,
  ideal_para: arrField,
  sellos: arrField,
  descripcion_comercial: strField,
  caracteristicas: strField,
  uso_recomendado: strField,
  slug: strField,
  seo_titulo: strField,
  seo_descripcion: strField,
  hashtags: strField,
  texto_instagram: strField,
  texto_whatsapp: strField,
  observacion_sugerida: strField,
  warnings: z.array(z.string()).default([]),
}).partial();

export type AiSuggestion = z.infer<typeof aiSuggestionSchema>;

export interface SuggestInput {
  marca: string;
  modelo?: string;
  categoria?: string;
  subcategoria?: string;
  descripcion?: string;
  caracteristicas?: string;
  uso?: string;
  color?: string;
  ideal_para?: string;
  sellos?: string;
  genero?: string;
}

function buildPrompt(d: SuggestInput): { system: string; user: string } {
  const system = [
    "Sos un asistente de catalogación de productos para Vera Deportes (tienda de calzado e indumentaria deportiva, Argentina).",
    "Tu tarea: ANALIZAR los datos de una ficha de producto y PROPONER metadatos. El operador humano revisará y decidirá qué aceptar.",
    "",
    "REGLAS DURAS:",
    "- Respondé ÚNICAMENTE un objeto JSON válido con el schema indicado. Sin markdown, sin texto extra.",
    "- NUNCA inventes SKU, precios, talles, ni fuentes de imagen. Esos campos ni siquiera existen en tu salida.",
    "- No inventes materiales ni características técnicas no confirmadas. Si no tenés evidencia suficiente, dejá value vacío y confidence 'baja'.",
    "- No uses claims falsos ('la mejor', 'máxima tecnología', 'calidad insuperable').",
    "- No inventes promociones, cuotas, stock, precio ni talles en los textos.",
    `- genero: solo uno de [${GENERO_OPTIONS.join(", ")}]. Si no podés determinarlo con confianza, value "". NO inferir género solo por color.`,
    `- categoria: preferí una de [${CATEGORIAS_CATALOGO.join(", ")}]. Si proponés otra, agregá un warning explicándolo.`,
    `- ideal_para: solo valores de [${IDEAL_PARA_OPTIONS.join(", ")}]. Múltiples permitidos.`,
    `- sellos: solo valores de [${SELLOS_OPTIONS.join(", ")}]. Nunca talles, género ni actividad.`,
    "- descripcion_comercial: 120-250 caracteres, comercial y factual.",
    "- caracteristicas: lista breve con '• ' por ítem, solo lo confirmado; si no hay fuente, value vacío.",
    "- uso_recomendado: distinto de ideal_para, una frase (ej: 'Ideal para caminatas, uso cotidiano y actividades urbanas de baja intensidad.').",
    "- slug: minúsculas, sin acentos ni caracteres especiales, guiones, marca+modelo (+color/género si diferencia variante).",
    "- seo_titulo: máx ~60 caracteres, formato 'MARCA Modelo Color | Vera Deportes'.",
    "- seo_descripcion: 140-160 caracteres, sin claims falsos.",
    "- hashtags: pocos y útiles (ej: '#FILA #Zapatillas #VeraDeportes #Urbano'), nunca bloques de 20+.",
    "- texto_instagram: breve, comercial, solo con datos disponibles.",
    "- texto_whatsapp: mensaje breve de consulta, sin precio si no existe.",
    "- modelo: si ya existe, podés mantenerlo, normalizar escritura o sugerir variante; el operador decide.",
    "- validacion de modelo: NO marques nada como EXACTO. Como máximo PROBABLE o PENDIENTE (en warnings).",
    "- observacion_sugerida: solo si detectás inconsistencias (modelo no confirmado, variante de color dudosa, falta SKU, etc.). Si no hay, value vacío.",
    "- warnings: lista de strings con alertas para el operador.",
    "",
    "SCHEMA DE SALIDA (todos los campos opcionales; cada campo es {value, confidence} con confidence en alta|media|baja; ideal_para y sellos tienen value como array de strings):",
    "{ modelo, genero, categoria, subcategoria, color, ideal_para[], sellos[], descripcion_comercial, caracteristicas, uso_recomendado, slug, seo_titulo, seo_descripcion, hashtags, texto_instagram, texto_whatsapp, observacion_sugerida, warnings[] }",
  ].join("\n");

  const user = [
    "FICHA ACTUAL (podés proponer mejoras pero el operador decide):",
    `Marca: ${d.marca}`,
    `Modelo: ${d.modelo || "(vacío)"}`,
    `Categoría: ${d.categoria || "(vacío)"}`,
    `Subcategoría: ${d.subcategoria || "(vacío)"}`,
    `Color: ${d.color || "(vacío)"}`,
    `Género: ${d.genero || "(vacío)"}`,
    `Ideal para: ${d.ideal_para || "(vacío)"}`,
    `Sellos: ${d.sellos || "(vacío)"}`,
    `Descripción: ${d.descripcion || "(vacío)"}`,
    `Características: ${d.caracteristicas || "(vacío)"}`,
    `Uso: ${d.uso || "(vacío)"}`,
    "",
    "Generá el JSON de sugerencias.",
  ].join("\n");

  return { system, user };
}

function extractJson(raw: string): unknown {
  const cleaned = raw.replace(/```(?:json)?/gi, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start < 0 || end <= start) throw new Error("La IA no devolvió JSON");
  return JSON.parse(cleaned.slice(start, end + 1));
}

export async function runSuggestion(input: SuggestInput): Promise<AiSuggestion> {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("IA no configurada (falta credencial del gateway)");

  const { system, user } = buildPrompt(input);
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Lovable-API-Key": apiKey,
    },
    body: JSON.stringify({
      model: "google/gemini-3.7-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    }),
  });

  if (!res.ok) {
    const detail = (await res.text()).slice(0, 200);
    if (res.status === 429) throw new Error("Límite de IA alcanzado, probá en unos segundos");
    if (res.status === 402 || res.status === 403) throw new Error("IA no disponible (créditos/política del workspace)");
    throw new Error(`IA [${res.status}]: ${detail}`);
  }

  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content ?? "";
  const parsed = aiSuggestionSchema.safeParse(extractJson(content));
  if (!parsed.success) throw new Error("La IA devolvió un formato inesperado");
  return parsed.data;
}
