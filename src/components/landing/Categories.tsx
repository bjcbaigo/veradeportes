import { ArrowRight } from "lucide-react";
import zapatillas from "@/assets/p-zapatillas-1.jpg";
import indumentaria from "@/assets/p-remera-1.jpg";
import ofertas from "@/assets/promo.jpg";
import accesorios from "@/assets/p-acc-1.jpg";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const CATS: {
  label: CategoryKey | "Calzado";
  filter: CategoryKey;
  image: string;
}[] = [
  { label: "Calzado", filter: "Zapatillas", image: zapatillas },
  { label: "Indumentaria", filter: "Indumentaria", image: indumentaria },
  { label: "Ofertas", filter: "Ofertas", image: ofertas },
  { label: "Accesorios", filter: "Accesorios", image: accesorios },
];

export function Categories() {
  return (
    <section id="categorias" className="bg-background py-7 sm:py-10">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-6">
          <div>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Encontrá lo tuyo</p>
            <h2 className="mt-1 text-2xl font-black uppercase text-foreground sm:text-3xl">Comprá por categoría</h2>
          </div>
        </div>
        <div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-5">
            {CATS.map((c) => {
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => emitCategory(c.filter)}
                  className="group relative aspect-[4/5] min-w-0 overflow-hidden rounded-lg bg-ink text-left shadow-md focus:outline-none focus:ring-2 focus:ring-primary/60 sm:aspect-[4/3]"
                >
                  <img
                    src={c.image}
                    alt=""
                    width={500}
                    height={500}
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/15 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-2 p-4 text-ink-foreground">
                    <span className="text-base font-black uppercase sm:text-lg">{c.label}</span>
                    <ArrowRight className="h-5 w-5 shrink-0 text-primary" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
