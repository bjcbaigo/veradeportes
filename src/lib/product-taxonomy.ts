// Taxonomía fija para "Ideal para" y sellos de producto.
// Se usa en el panel de cargas y en la ficha de la landing.
export const IDEAL_PARA_OPTIONS = [
  "Running",
  "Urbano",
  "Caminar",
  "Pádel",
  "Tenis",
  "Fútbol",
  "Basket",
  "Todo el día",
  "Training",
] as const;

export const SELLOS_OPTIONS = [
  "Oferta",
  "Liviana",
  "Amortiguación",
  "Uso urbano",
  "Respirable",
  "Suela antideslizante",
  "Alta durabilidad",
] as const;

// --- Talles de calzado ---
// Incluyen valores intermedios (medios talles): 34, 34.5, 35, 35.5...
function rangeTalles(from: number, to: number): string[] {
  const out: string[] = [];
  for (let n = from * 2; n <= to * 2; n++) {
    const v = n / 2;
    out.push(Number.isInteger(v) ? String(v) : v.toFixed(1));
  }
  return out;
}

export type TalleRango = "ninos" | "adultos";

export const TALLES_NINOS_OPTIONS = rangeTalles(25, 35);
export const TALLES_ADULTOS_OPTIONS = rangeTalles(34, 46);

export const TALLE_RANGOS: { id: TalleRango; label: string; hint: string; options: string[] }[] = [
  { id: "ninos", label: "Niños", hint: "25 a 35", options: TALLES_NINOS_OPTIONS },
  { id: "adultos", label: "Adultos", hint: "34 a 46", options: TALLES_ADULTOS_OPTIONS },
];

// Compatibilidad: unión de ambos rangos.
export const TALLES_CALZADO_OPTIONS = Array.from(
  new Set([...TALLES_NINOS_OPTIONS, ...TALLES_ADULTOS_OPTIONS]),
).sort((a, b) => Number(a) - Number(b));

// Detecta el rango más probable a partir de los talles ya elegidos.
export function detectTalleRango(raw?: string): TalleRango {
  const nums = splitTags(raw).map(Number).filter((n) => !Number.isNaN(n));
  if (nums.length === 0) return "adultos";
  const max = Math.max(...nums);
  return max <= 35 ? "ninos" : "adultos";
}

export function splitTags(raw?: string): string[] {
  return (raw || "")
    .split(/\||,/)
    .map((s) => s.trim())
    .filter(Boolean);
}

// --- Product Studio ---
export const GENERO_OPTIONS = ["Hombre", "Mujer", "Unisex", "Kids"] as const;

// Catálogo normalizado de categorías (asistente IA y fichas).
export const CATEGORIAS_CATALOGO = [
  "Zapatillas",
  "Botines",
  "Ojotas",
  "Indumentaria",
  "Accesorios",
] as const;

export const ESTADO_IMAGENES_OPTIONS = [
  "PENDIENTE",
  "PROCESANDO",
  "REVISAR",
  "APROBADAS",
  "ERROR",
] as const;

export const VALIDACION_MODELO_OPTIONS = [
  "EXACTO",
  "PROBABLE",
  "PENDIENTE",
  "RECHAZADO",
] as const;

// Palabras clave en Observaciones_Studio que marcan "Requiere atención".
export const OBS_CRITICAS = ["DUPLICADO", "REVISAR MODELO", "IMAGEN NO EXACTA", "FALTA SKU"] as const;

export function observacionEsCritica(obs?: string): boolean {
  const up = (obs || "").toUpperCase();
  return OBS_CRITICAS.some((k) => up.includes(k));
}
