// Taxonomía fija para "Ideal para" y sellos de producto.
// Se usa en el panel de cargas y en la ficha de la landing.
export const IDEAL_PARA_OPTIONS = [
  "Running",
  "Urbano",
  "Caminar",
  "Pádel",
  "Todo el día",
  "Training",
] as const;

export const SELLOS_OPTIONS = [
  "Liviana",
  "Amortiguación",
  "Uso urbano",
  "Respirable",
  "Suela antideslizante",
  "Alta durabilidad",
] as const;

export const TALLES_CALZADO_OPTIONS = [
  "34","35","36","37","38","39","40","41","42","43","44","45","46",
] as const;

export function splitTags(raw?: string): string[] {
  return (raw || "")
    .split(/\||,/)
    .map((s) => s.trim())
    .filter(Boolean);
}
