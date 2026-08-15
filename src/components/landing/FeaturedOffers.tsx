import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProductDetailDialog } from "@/components/landing/ProductDetailDialog";
import { ProductCard } from "@/components/landing/ProductCard";
import { isOfferProduct, useProductsData } from "@/lib/product-data";
import type { Product } from "@/lib/products";

export function FeaturedOffers() {
  const { products } = useProductsData();
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const offers = products.filter(isOfferProduct).slice(0, 4);

  function handleSelect(product: Product) {
    setSelected(product);
    setOpen(true);
  }

  return (
    <section id="ofertas" className="py-3">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h2 className="font-display text-[17px] font-extrabold uppercase tracking-tight text-foreground lg:text-xl">
            Destacados
          </h2>
          <a
            href="/ofertas"
            className="inline-flex items-center gap-1 text-[13px] font-semibold text-primary"
          >
            Ver mas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            No hay ofertas activas por el momento.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-x-2.5 gap-y-4 md:grid-cols-4 lg:gap-4">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={handleSelect} />
            ))}
          </div>
        )}
      </div>
      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
