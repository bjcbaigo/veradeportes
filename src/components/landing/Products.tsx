import { MessageCircle, Star, ArrowRight } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { waLink } from "@/lib/site";

export function Products() {
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
                className="flex flex-col rounded-2xl bg-card border border-border overflow-hidden shadow-sm"
              >
                <div className="aspect-square bg-secondary p-3">
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
                  <a
                    href={waLink(`Hola! Quiero consultar el talle de: ${p.name}.`)}
                    target="_blank"
                    rel="noopener"
                    className="mt-2 inline-flex items-center justify-center gap-1.5 rounded-lg border-2 border-primary text-primary h-9 text-[12px] font-bold hover:bg-primary hover:text-primary-foreground transition"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                    Consultar talle
                  </a>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
