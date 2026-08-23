import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { ProductCard } from "./ProductCard";
import { PRODUCT_SEARCH_EVENT } from "./HomeSearch";
import { CATEGORY_EVENT, type CategoryKey } from "@/lib/category-filter";
import { filterProducts, useProductsData } from "@/lib/product-data";
import type { Product } from "@/lib/products";

const CHIPS: CategoryKey[] = [
  "Todos",
  "Zapatillas",
  "Indumentaria",
  "Accesorios",
  "Ninos",
  "Ofertas",
];

function matchesSearch(product: Product, query: string) {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return true;
  return [
    product.name,
    product.brand,
    product.category,
    product.sku,
    product.description,
    product.idealFor,
    product.features,
  ]
    .filter(Boolean)
    .some((value) => value!.toLowerCase().includes(normalized));
}

export function Products({ limit }: { limit?: number }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<CategoryKey>("Todos");
  const [query, setQuery] = useState("");
  const [showAll, setShowAll] = useState(!limit);
  const sectionRef = useRef<HTMLElement | null>(null);
  const searchRef = useRef<HTMLInputElement | null>(null);
  const { products: allProducts } = useProductsData();

  function focusSearch() {
    setCat("Todos");
    setShowAll(true);
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(() => searchRef.current?.focus(), 250);
    });
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CategoryKey>).detail;
      if (detail) {
        setCat(detail);
        setShowAll(true);
      }
    };
    window.addEventListener(CATEGORY_EVENT, handler);
    return () => window.removeEventListener(CATEGORY_EVENT, handler);
  }, []);

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<string>).detail ?? "";
      setQuery(detail);
      focusSearch();
    };
    window.addEventListener(PRODUCT_SEARCH_EVENT, handler);
    return () => window.removeEventListener(PRODUCT_SEARCH_EVENT, handler);
  }, []);
  useEffect(() => {
    const syncProductsHash = () => {
      if (window.location.hash === "#buscar") {
        focusSearch();
        return;
      }
      if (window.location.hash !== "#productos") return;
      setCat("Todos");
      setShowAll(true);
      window.requestAnimationFrame(() => {
        sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    };
    syncProductsHash();
    window.addEventListener("hashchange", syncProductsHash);
    return () => window.removeEventListener("hashchange", syncProductsHash);
  }, []);

  const products = useMemo(() => {
    const filtered = filterProducts(allProducts, cat).filter((product) =>
      matchesSearch(product, query),
    );
    return typeof limit === "number" && !showAll ? filtered.slice(0, limit) : filtered;
  }, [allProducts, cat, limit, query, showAll]);

  function handleShowAllProducts() {
    setCat("Todos");
    setShowAll(true);
    if (window.location.pathname === "/tienda") {
      window.history.replaceState(null, "", "/tienda#productos");
    }
    window.requestAnimationFrame(() => {
      sectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleSelect(product: Product) {
    setSelected(product);
    setOpen(true);
  }

  return (
    <section ref={sectionRef} id="productos" className="bg-white py-3 lg:py-6">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h2 className="text-[17px] font-black uppercase tracking-normal text-foreground lg:text-xl">
            Productos
          </h2>
          <button
            type="button"
            onClick={handleShowAllProducts}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary lg:text-sm"
          >
            Ver todos <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div id="buscar" className="mb-3 lg:mb-4">
          <label className="sr-only" htmlFor="product-search">
            Buscar productos
          </label>
          <div className="flex h-11 items-center gap-2 rounded-2xl border border-border bg-secondary px-3 text-foreground focus-within:border-primary focus-within:bg-white focus-within:ring-2 focus-within:ring-primary/15">
            <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
            <input
              ref={searchRef}
              id="product-search"
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setShowAll(true);
              }}
              placeholder="Buscar zapatillas, marca o categoria"
              className="h-full min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="vd-scroll-x -mx-4 mb-3 px-4 lg:mx-0 lg:mb-5 lg:overflow-visible lg:px-0">
          <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => {
                  setCat(c);
                  setShowAll(true);
                }}
                className={`rounded-full border px-3 py-1.5 text-xs font-bold transition ${
                  cat === c
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {c === "Ninos" ? "Ninos" : c}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-xl border border-border bg-secondary p-6 text-center text-sm text-muted-foreground">
            No encontramos productos para esa busqueda.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 md:grid-cols-4 lg:gap-x-4 lg:gap-y-5 xl:grid-cols-5">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>

      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
