import { useEffect, useMemo, useState } from "react";
import { ArrowRight } from "lucide-react";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { ProductCard } from "./ProductCard";
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

export function Products({ limit }: { limit?: number }) {
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<CategoryKey>("Todos");
  const { products: allProducts } = useProductsData();

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CategoryKey>).detail;
      if (detail) setCat(detail);
    };
    window.addEventListener(CATEGORY_EVENT, handler);
    return () => window.removeEventListener(CATEGORY_EVENT, handler);
  }, []);

  const products = useMemo(() => {
    const filtered = filterProducts(allProducts, cat);
    return typeof limit === "number" ? filtered.slice(0, limit) : filtered;
  }, [allProducts, cat, limit]);

  function handleSelect(product: Product) {
    setSelected(product);
    setOpen(true);
  }

  return (
    <section id="productos" className="py-4 lg:py-8">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h2 className="font-display text-xl font-black uppercase tracking-normal lg:text-2xl">
            Productos
          </h2>
          <button
            type="button"
            onClick={() => setCat("Todos")}
            className="inline-flex items-center gap-1 text-sm font-bold text-primary"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mb-3 -mx-4 overflow-x-auto px-4 lg:mx-0 lg:mb-5 lg:overflow-visible lg:px-0">
          <div className="flex min-w-max gap-2 lg:min-w-0 lg:flex-wrap">
            {CHIPS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCat(c)}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
                  cat === c
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:border-primary/50"
                }`}
              >
                {c === "Ninos" ? "Ninos" : c}
              </button>
            ))}
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-6 text-center text-sm text-muted-foreground">
            No hay productos en esta categoria por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4 xl:grid-cols-5">
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
