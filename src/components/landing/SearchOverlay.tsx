import { useEffect, useMemo, useRef, useState } from "react";
import { Search, X, Clock, TrendingUp, ArrowLeft } from "lucide-react";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { useProductsData } from "@/lib/product-data";
import type { Product } from "@/lib/products";
import {
  SEARCH_EVENT,
  clearRecentSearches,
  getRecentSearches,
  pushRecentSearch,
  searchProducts,
} from "@/lib/search";

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recent, setRecent] = useState<string[]>([]);
  const [selected, setSelected] = useState<Product | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { products, isLoading } = useProductsData();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<string>).detail ?? "";
      setQuery(detail);
      setRecent(getRecentSearches());
      setOpen(true);
      setTimeout(() => inputRef.current?.focus(), 60);
    };
    window.addEventListener(SEARCH_EVENT, handler);
    return () => window.removeEventListener(SEARCH_EVENT, handler);
  }, []);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const suggestions = useMemo(() => {
    const brands = new Map<string, number>();
    for (const p of products) {
      if (!p.brand) continue;
      brands.set(p.brand, (brands.get(p.brand) ?? 0) + 1);
    }
    return [...brands.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([brand]) => brand);
  }, [products]);

  const trimmed = query.trim();
  const results = useMemo(
    () => (trimmed.length >= 2 ? searchProducts(products, trimmed) : []),
    [products, trimmed],
  );

  function commit(value: string) {
    setQuery(value);
    pushRecentSearch(value);
    setRecent(getRecentSearches());
    setTimeout(() => inputRef.current?.focus(), 40);
  }

  function pick(product: Product) {
    pushRecentSearch(trimmed);
    setRecent(getRecentSearches());
    setSelected(product);
    setDetailOpen(true);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-background">
      <div className="border-b border-border px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
        <div className="mx-auto flex max-w-3xl items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Cerrar busqueda"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[12px] text-foreground hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <form
            className="relative flex-1"
            onSubmit={(e) => {
              e.preventDefault();
              if (trimmed.length >= 2) commit(trimmed);
              inputRef.current?.blur();
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              type="text"
              enterKeyHint="search"
              autoComplete="off"
              placeholder="Buscar zapatillas, marcas, remeras..."
              aria-label="Buscar productos"
              className="h-11 w-full rounded-[12px] border border-border bg-card pl-10 pr-10 text-[15px] text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
                aria-label="Limpiar busqueda"
                className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </form>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-4">
        <div className="mx-auto max-w-3xl">
          {trimmed.length < 2 ? (
            <div className="space-y-6">
              {recent.length > 0 && (
                <section>
                  <div className="mb-2 flex items-center justify-between">
                    <h2 className="flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                      <Clock className="h-4 w-4" /> Busquedas recientes
                    </h2>
                    <button
                      type="button"
                      onClick={() => {
                        clearRecentSearches();
                        setRecent([]);
                      }}
                      className="text-[12px] font-semibold text-primary"
                    >
                      Borrar
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recent.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => commit(r)}
                        className="rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] text-foreground"
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="mb-2 flex items-center gap-1.5 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                  <TrendingUp className="h-4 w-4" /> Sugerencias
                </h2>
                <div className="flex flex-wrap gap-2">
                  {["Zapatillas", "Remeras", "Ofertas", "Accesorios", ...suggestions].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => commit(s)}
                      className="rounded-[10px] border border-border bg-card px-3 py-2 text-[13px] font-medium text-foreground hover:border-primary/40"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </section>

              <p className="text-[12px] text-muted-foreground">
                Escribi al menos 2 letras para ver resultados.
              </p>
            </div>
          ) : isLoading && products.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Buscando productos...</p>
          ) : results.length === 0 ? (
            <div className="rounded-[14px] border border-border bg-card p-6 text-center">
              <p className="text-sm font-semibold text-foreground">
                Sin resultados para "{trimmed}"
              </p>
              <p className="mt-1 text-[13px] text-muted-foreground">
                Proba con la marca (Nike, Asics) o el tipo de producto (zapatillas, remera).
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="mt-4 inline-flex h-10 items-center justify-center rounded-[10px] bg-primary px-4 text-[13px] font-bold text-primary-foreground"
              >
                Ver sugerencias
              </button>
            </div>
          ) : (
            <>
              <p className="mb-3 text-[12px] font-medium text-muted-foreground">
                {results.length} {results.length === 1 ? "resultado" : "resultados"}
              </p>
              <ul className="space-y-2">
                {results.map((product) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => pick(product)}
                      className="flex w-full items-center gap-3 rounded-[12px] border border-border bg-card p-2 text-left transition hover:border-primary/40"
                    >
                      <span className="h-16 w-16 shrink-0 overflow-hidden rounded-[10px] bg-secondary">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            loading="lazy"
                            className="h-full w-full object-contain"
                          />
                        ) : null}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[11px] uppercase tracking-wide text-muted-foreground">
                          {product.brand} - {product.category}
                        </span>
                        <span className="line-clamp-2 block text-[14px] font-medium leading-tight text-foreground">
                          {product.name}
                        </span>
                        <span className="mt-0.5 flex items-baseline gap-2">
                          <span className="font-display text-[15px] font-bold text-primary">
                            {product.price}
                          </span>
                          {product.priceOld && (
                            <span className="text-[11px] text-muted-foreground line-through">
                              {product.priceOld}
                            </span>
                          )}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <ProductDetailDialog product={selected} open={detailOpen} onOpenChange={setDetailOpen} />
    </div>
  );
}
