import { useState } from "react";
import { Star, ArrowRight } from "lucide-react";
import { PRODUCTS, type Product } from "@/lib/products";
import { ProductDetailDialog } from "./ProductDetailDialog";

export function Products() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const handleSelect = (p: Product) => {
    setSelected(p);
    setOpen(true);
  };

  return (
    <section id="productos" className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl">
            Productos destacados
          </h2>
          <a href="#productos" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
            Ver todas <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {PRODUCTS.map((p) => {
            const rating = (4 + ((parseInt(p.id) * 7) % 9) / 10).toFixed(1);
            const reviews = 12 + parseInt(p.id) * 4;
            return (
              <article
                key={p.id}
                className="flex flex-col rounded-3xl bg-card border border-border overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-left cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary/40 transition-all duration-300"
                onClick={() => handleSelect(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(p);
                  }
                }}
              >
                <div className="aspect-square bg-[#f3f4f6] p-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    loading="lazy"
                    width={400}
                    height={400}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-col gap-1.5 px-3 pb-3">
                  <h3 className="font-display font-bold text-[15px] leading-tight">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {p.category} · Unisex
                  </p>
                  <div className="flex items-center gap-1 text-primary text-[12px] font-semibold">
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <span className="text-muted-foreground ml-1">({reviews})</span>
                  </div>
                  <p className="mt-1 font-display font-extrabold text-primary text-[15px]">
                    {p.price}
                  </p>
                  <span className="mt-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground h-9 text-[12px] font-bold">
                    Ver detalles
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
