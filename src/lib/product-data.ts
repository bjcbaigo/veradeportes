import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import type { Product } from "@/lib/products";
import { listSheetProducts, type SheetProduct } from "@/lib/sheet-products.functions";
import { matchesCategory, type CategoryKey } from "@/lib/category-filter";
import { splitTags } from "@/lib/product-taxonomy";

const fmt = (raw: string) => {
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return raw || "";
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
};

export function sheetToProduct(s: SheetProduct): Product {
  const parts = s.nombre.split(" ");
  const brand = (s.marca || "").trim() || parts[0] || s.categoria;
  const extras = (s.imagenes_extra || "")
    .split("|")
    .map((u) => u.trim())
    .filter(Boolean);
  const images = [s.imagen_url, ...extras].filter(Boolean);
  const ideal = splitTags(s.ideal_para);
  return {
    id: s.id || String(s.rowIndex),
    sku: s.sku || `SHEET-${s.id || s.rowIndex}`,
    name: s.nombre,
    brand,
    category: s.categoria,
    color: s.color || undefined,
    price: fmt(s.precio),
    priceOld: s.precio_anterior ? fmt(s.precio_anterior) : undefined,
    image: s.imagen_url || "",
    images,
    badge: s.destacado ? "Destacado" : undefined,
    description: s.descripcion,
    idealFor: ideal.length ? ideal.join(", ") : undefined,
    seals: splitTags(s.sellos),
    sizes: splitTags(s.talles),
  };
}

function priceNumber(raw?: string) {
  return Number((raw || "").replace(/[^\d]/g, "")) || 0;
}

export function isOfferProduct(product: Product) {
  const hasOfferSeal = (product.seals ?? []).some((s) => s.toLowerCase() === "oferta");
  const hasRealDiscount =
    priceNumber(product.priceOld) > priceNumber(product.price) && priceNumber(product.price) > 0;
  return (
    hasOfferSeal ||
    hasRealDiscount ||
    matchesCategory(product.category, product.name, product.badge, "Ofertas")
  );
}

export function useProductsData() {
  const fetchSheet = useServerFn(listSheetProducts);
  const {
    data: sheetRows,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["sheet-products"],
    queryFn: () => fetchSheet(),
    staleTime: 5 * 60_000,
    retry: 2,
    retryDelay: (attempt) => Math.min(1000 * 2 ** attempt, 4000),
  });

  const products = useMemo<Product[]>(() => {
    if (!sheetRows || sheetRows.length === 0) return [];
    const active = sheetRows.filter((r) => r.activo && r.nombre);
    if (active.length === 0) return [];
    return active
      .map(sheetToProduct)
      .sort((a, b) => Number(b.badge === "Destacado") - Number(a.badge === "Destacado"));
  }, [sheetRows]);

  return { products, isLoading, isError, error, refetch, isFetching };
}

export function filterProducts(products: Product[], cat: CategoryKey) {
  return products.filter((p) => matchesCategory(p.category, p.name, p.badge, cat));
}
