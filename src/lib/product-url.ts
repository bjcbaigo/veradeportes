// URL pública estable por producto.
// Patrón: https://veradeportes.com/producto/<marca-modelo>--<id-estable>
// El "--<id-estable>" final (SKU slugificado o ID) garantiza estabilidad y
// resolución aunque cambie el nombre visible del producto.
// Centralizado aquí para reutilizar en landing, panel, Instagram y Meta Ads.

export const SITE_URL = "https://veradeportes.com";

export function slugify(text: string): string {
  return (text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // diacríticos (U+0300–U+036F)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export type ProductIdent = {
  brand?: string;
  name?: string;
  sku?: string;
  id?: string;
};

/** Identificador estable: SKU si existe; si no, ID interno. */
export function stableProductId(p: ProductIdent): string {
  return slugify(p.sku ?? "") || slugify(p.id ?? "") || "item";
}

/** Slug completo: parte legible + separador "--" + id estable. */
export function productSlug(p: ProductIdent): string {
  const base = slugify([p.brand, p.name].filter(Boolean).join(" ")) || "producto";
  return `${base}--${stableProductId(p)}`;
}

export function productPath(p: ProductIdent): string {
  return `/producto/${productSlug(p)}`;
}

/** URL canónica absoluta (usar en Instagram, WhatsApp, QR, Meta Ads). */
export function productUrl(p: ProductIdent): string {
  return `${SITE_URL}${productPath(p)}`;
}

/**
 * Resuelve un slug contra el catálogo.
 * 1) Coincidencia exacta del slug completo.
 * 2) Coincidencia por id estable (parte después de "--") — sobrevive a renombres.
 * 3) Coincidencia directa por SKU o ID crudos.
 * 4) Coincidencia por base legible (slug sin id) si es única.
 */
export function findProductBySlug<T extends ProductIdent>(
  products: T[],
  slug: string,
): T | undefined {
  const target = (slug || "").trim().toLowerCase();
  if (!target) return undefined;

  const exact = products.find((p) => productSlug(p) === target);
  if (exact) return exact;

  const idPart = target.includes("--") ? target.split("--").pop()! : target;
  if (idPart) {
    const byStable = products.filter((p) => stableProductId(p) === idPart);
    if (byStable.length >= 1) return byStable[0];
    const byRaw = products.find(
      (p) =>
        (p.sku ?? "").toLowerCase() === idPart ||
        (p.id ?? "").toLowerCase() === idPart,
    );
    if (byRaw) return byRaw;
  }

  const baseMatches = products.filter((p) => productSlug(p).split("--")[0] === target);
  if (baseMatches.length === 1) return baseMatches[0];
  return undefined;
}
