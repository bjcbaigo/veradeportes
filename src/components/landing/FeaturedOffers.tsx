import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProductDetailDialog } from "@/components/landing/ProductDetailDialog";
import { ProductCard } from "@/components/landing/ProductCard";
import { filterProducts, useProductsData } from "@/lib/product-data";
import type { Product } from "@/lib/products";

export function FeaturedOffers() {
  const { products } = useProductsData();
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  // Solo los marcados como "Destacado" en el panel (columna H de la planilla).
  const [tab, setTab] = useState<"vendidos" | "nuevos">("vendidos");
  const offers = (tab === "vendidos"
    ? products.filter((p) => p.badge === "Destacado")
    : filterProducts(products, "Nuevos")
  ).slice(0, 5);

  function handleSelect(product: Product) {
    setSelected(product);
    setOpen(true);
  }

  return (
    <section id="ofertas" className="bg-background py-4 sm:bg-secondary sm:py-12">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-end justify-between gap-4 sm:mb-5">
          <div>
            <h2 className="sr-only">Más vendidos y nuevos ingresos</h2>
            <div role="tablist" className="inline-flex rounded-full bg-secondary p-1 ring-1 ring-border sm:bg-background">
              {([["vendidos", "Más vendidos"], ["nuevos", "Nuevos ingresos"]] as const).map(([k, l]) => (
                <button
                  key={k}
                  type="button"
                  role="tab"
                  aria-selected={tab === k}
                  onClick={() => setTab(k)}
                  className={`rounded-full px-3 py-1.5 text-xs font-black uppercase transition sm:px-5 sm:text-sm ${tab === k ? "bg-primary text-primary-foreground" : "text-foreground hover:text-primary"}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <a
            href="/ofertas"
            className="-mr-1 inline-flex min-h-[40px] items-center gap-1 px-1 text-xs font-bold text-primary lg:text-sm"
          >
            Ver mas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-lg border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground">
            {tab === "nuevos" ? "Pronto vas a ver los nuevos ingresos acá." : "No hay productos destacados por el momento."}
          </div>
        ) : (
          <div className="-mx-0 overflow-hidden lg:mx-0 lg:overflow-visible lg:px-0">
            <div className="grid grid-cols-2 gap-2.5 sm:flex sm:gap-3 sm:pb-2 lg:grid lg:grid-cols-5 lg:gap-4">
              {offers.map((product) => (
                <div key={product.id} className="nth-[n+3]:hidden sm:nth-[n+3]:block">
                  <ProductCard product={product} onSelect={handleSelect} compact />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
