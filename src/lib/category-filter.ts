export const CATEGORY_EVENT = "vera:select-category";

export type CategoryKey =
  | "Todos"
  | "Zapatillas"
  | "Indumentaria"
  | "Accesorios"
  | "Niños"
  | "Ofertas";

export function emitCategory(cat: CategoryKey) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<CategoryKey>(CATEGORY_EVENT, { detail: cat }));
  // Wait for state update before scrolling
  setTimeout(() => {
    document.getElementById("productos")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 50);
}

const INDUMENTARIA = ["remera", "remeras", "buzo", "buzos", "campera", "camperas", "short", "shorts", "pantalon", "pantalón", "calza", "calzas", "indumentaria"];
const ACCESORIOS = ["accesorio", "accesorios", "mochila", "mochilas", "gorra", "gorras", "media", "medias", "guante", "guantes"];
const NINOS = ["niño", "niños", "nino", "ninos", "infantil", "kids"];

export function matchesCategory(productCategory: string, productName: string, badge: string | undefined, cat: CategoryKey): boolean {
  if (cat === "Todos") return true;
  const c = (productCategory || "").toLowerCase();
  const n = (productName || "").toLowerCase();
  const haystack = `${c} ${n}`;
  if (cat === "Ofertas") return (badge || "").toLowerCase().includes("oferta") || c.includes("oferta") || n.includes("oferta");
  if (cat === "Zapatillas") return c.includes("zapatilla") || c.includes("calzado");
  if (cat === "Indumentaria") return INDUMENTARIA.some((w) => haystack.includes(w));
  if (cat === "Accesorios") return ACCESORIOS.some((w) => haystack.includes(w));
  if (cat === "Niños") return NINOS.some((w) => haystack.includes(w));
  return true;
}
