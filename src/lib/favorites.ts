export const FAVORITES_KEY = "vera-favorites";
export const FAVORITES_EVENT = "vera:favorites-change";

function readFavoriteIds() {
  if (typeof window === "undefined") return [] as string[];
  try {
    const raw = window.localStorage.getItem(FAVORITES_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : [];
  } catch {
    return [];
  }
}

function writeFavoriteIds(ids: string[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...new Set(ids)]));
  window.dispatchEvent(new CustomEvent(FAVORITES_EVENT));
}

export function isFavorite(productId: string) {
  return readFavoriteIds().includes(productId);
}

export function toggleFavorite(productId: string) {
  const current = readFavoriteIds();
  const exists = current.includes(productId);
  const next = exists ? current.filter((id) => id !== productId) : [...current, productId];
  writeFavoriteIds(next);
  return !exists;
}
