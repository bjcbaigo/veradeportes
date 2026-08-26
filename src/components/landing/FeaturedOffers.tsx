import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { ProductDetailDialog } from "@/components/landing/ProductDetailDialog";
import { ProductCard } from "@/components/landing/ProductCard";
import { useProductsData } from "@/lib/product-data";
import type { Product } from "@/lib/products";

export function FeaturedOffers() {
  const { products, isLoading, isError } = useProductsData();
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const offers = products.filter((p) => p.badge === "Destacado").slice(0, 5);

  function handleSelect(product: Product) {
    setSelected(product);
    setOpen(true);
  }

  if (isLoading || isError || offers.length === 0) return null;

  return (
    <section id="ofertas" className="bg-white py-2 lg:py-4">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h2 className="text-[17px] font-black uppercase tracking-normal text-foreground lg:text-xl">
            Destacados
          </h2>
          <a
            href="/ofertas"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary lg:text-sm"
          >
            Ver mas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="vd-scroll-x -mx-4 px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex gap-3 pb-2 lg:grid lg:grid-cols-5 lg:gap-4">
            {offers.map((product) => (
              <ProductCard key={product.id} product={product} onSelect={handleSelect} compact />
            ))}
          </div>
        </div>
      </div>
      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
