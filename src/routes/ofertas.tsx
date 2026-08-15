import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { BottomNav } from "@/components/landing/BottomNav";
import { Header } from "@/components/landing/Header";
import { ProductCard } from "@/components/landing/ProductCard";
import { ProductDetailDialog } from "@/components/landing/ProductDetailDialog";
import { WhatsAppFab } from "@/components/landing/WhatsAppFab";
import { filterProducts, isOfferProduct, useProductsData } from "@/lib/product-data";
import type { CategoryKey } from "@/lib/category-filter";
import type { Product } from "@/lib/products";

const FILTERS: CategoryKey[] = ["Todos", "Zapatillas", "Indumentaria", "Accesorios"];

export const Route = createFileRoute("/ofertas")({
  head: () => ({
    meta: [
      { title: "Ofertas - Vera Deportes" },
      {
        name: "description",
        content: "Productos deportivos en promocion de Vera Deportes.",
      },
    ],
  }),
  component: OffersPage,
});

function OffersPage() {
  const { products } = useProductsData();
  const [cat, setCat] = useState<CategoryKey>("Todos");
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const offers = useMemo(() => {
    const base = products.filter(isOfferProduct);
    return cat === "Todos" ? base : filterProducts(base, cat);
  }, [products, cat]);

  function handleSelect(product: Product) {
    setSelected(product);
    setOpen(true);
  }

  return (
    <div id="top" className="min-h-screen bg-page pb-20 text-foreground font-sans">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-4">
        <div className="mb-4 rounded-[18px] bg-ink p-5 text-ink-foreground shadow-[0_4px_14px_rgba(7,27,59,0.12)]">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
            Vera Deportes
          </p>
          <h1 className="mt-1 text-3xl font-black uppercase leading-none">Ofertas</h1>
          <p className="mt-2 max-w-lg text-sm text-ink-foreground/85">
            Productos promocionados con consulta directa por WhatsApp.
          </p>
        </div>

        <div className="vd-scroll-x sticky top-14 z-20 -mx-4 mb-4 border-y border-border bg-white/95 px-4 py-2 backdrop-blur">
          <div className="flex min-w-max gap-2">
            {FILTERS.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setCat(filter)}
                className={`rounded-full border px-3 py-1.5 text-xs font-extrabold transition ${
                  cat === filter
                    ? "border-ink bg-ink text-ink-foreground"
                    : "border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-xl border border-border bg-secondary p-8 text-center text-sm text-muted-foreground">
            No hay ofertas activas para este filtro.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-4 lg:gap-x-4 lg:gap-y-6">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </main>
      <BottomNav active="Ofertas" />
      <WhatsAppFab />
      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </div>
  );
}
