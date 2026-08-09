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
  const offers = products.filter(isOfferProduct).slice(0, 5);

  function handleSelect(product: Product) {
    setSelected(product);
    setOpen(true);
  }

  return (
    <section id="ofertas" className="py-3">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-black uppercase tracking-normal">
            Ofertas destacadas
          </h2>
          <a
            href="/ofertas"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        {offers.length === 0 ? (
          <div className="rounded-2xl border border-border bg-card p-5 text-sm text-muted-foreground">
            No hay ofertas activas por el momento.
          </div>
        ) : (
          <div className="-mx-4 overflow-x-auto px-4">
            <div className="flex gap-2.5 pb-2">
              {offers.map((product) => (
                <ProductCard key={product.id} product={product} onSelect={handleSelect} compact />
              ))}
            </div>
          </div>
        )}
      </div>
      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
