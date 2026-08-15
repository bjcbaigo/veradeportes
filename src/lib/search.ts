import type { Product } from "@/lib/products";

export const SEARCH_EVENT = "vera:open-search";
const RECENT_KEY = "vera:recent-searches";

export function openSearch(initialQuery = "") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent<string>(SEARCH_EVENT, { detail: initialQuery }));
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export function searchProducts(products: Product[], query: string) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  return products
    .map((product) => {
      const name = normalize(product.name);
      const brand = normalize(product.brand);
      const category = normalize(product.category);
      const description = normalize(product.description ?? "");
      let score = 0;

      for (const term of terms) {
        if (name.startsWith(term)) score += 6;
        else if (name.includes(term)) score += 4;
        else if (brand.includes(term)) score += 3;
        else if (category.includes(term)) score += 2;
        else if (description.includes(term)) score += 1;
        else return { product, score: -1 };
      }

      return { product, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.product);
}

export function getRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(query: string) {
  const clean = query.trim();
  if (typeof window === "undefined" || clean.length < 2) return;
  const next = [clean, ...getRecentSearches().filter((q) => normalize(q) !== normalize(clean))].slice(
    0,
    6,
  );
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {
    /* ignore */
  }
}

export function clearRecentSearches() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(RECENT_KEY);
  } catch {
    /* ignore */
  }
}
