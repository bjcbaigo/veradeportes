import { MessageCircle } from "lucide-react";
import { PRODUCTS } from "@/lib/products";
import { waLink } from "@/lib/site";

export function Products() {
  return (
    <section id="productos" className="py-12 md:py-16 bg-secondary/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Destacados
            </p>
            <h2 className="font-display font-bold text-2xl md:text-3xl mt-1">
              Productos <span className="text-primary">destacados</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-5">
          {PRODUCTS.map((p) => (
            <article
              key={p.id}
              className="group flex flex-col rounded-2xl bg-card border border-border overflow-hidden shadow-sm"
            >
              <div className="relative aspect-square bg-secondary overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  loading="lazy"
                  width={768}
                  height={768}
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
                {p.badge && (
                  <span className="absolute top-2 left-2 rounded-full bg-primary text-primary-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-1">
                    {p.badge}
                  </span>
                )}
              </div>
              <div className="flex flex-col gap-2 p-3 md:p-4 flex-1">
                <p className="text-[11px] uppercase tracking-wider text-muted-foreground">
                  {p.category}
                </p>
                <h3 className="font-display font-semibold text-sm md:text-base leading-tight">
                  {p.name}
                </h3>
                <p className="font-bold text-base md:text-lg mt-auto">{p.price}</p>
                <a
                  href={waLink(`Hola! Me interesa: ${p.name} (${p.category}). ¿Tenés disponible y qué talles hay?`)}
                  target="_blank"
                  rel="noopener"
                  className="mt-1 inline-flex items-center justify-center gap-2 rounded-full bg-ink text-ink-foreground h-10 text-xs md:text-sm font-semibold hover:bg-primary transition"
                >
                  <MessageCircle className="h-4 w-4" />
                  Consultar
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
