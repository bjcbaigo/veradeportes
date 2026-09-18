import { ArrowRight } from "lucide-react";
import zapatillas from "@/assets/p-zapatillas-1.jpg";
import indumentaria from "@/assets/home/hero-indumentaria.png.asset.json";
import ofertas from "@/assets/promo.jpg";
import accesorios from "@/assets/p-acc-1.jpg";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const CATS: {
  label: CategoryKey | "Calzado";
  filter: CategoryKey;
  image: string;
  position?: string;
}[] = [
  { label: "Calzado", filter: "Zapatillas", image: zapatillas, position: "object-center" },
  { label: "Indumentaria", filter: "Indumentaria", image: indumentaria.url, position: "object-[58%_center]" },
  { label: "Ofertas", filter: "Ofertas", image: ofertas },
  { label: "Accesorios", filter: "Accesorios", image: accesorios, position: "object-center" },
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
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 lg:gap-4">
            {CATS.map((c) => {
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => emitCategory(c.filter)}
                  className="group relative aspect-[5/4] min-w-0 overflow-hidden rounded-md bg-ink text-left shadow-md ring-1 ring-ink/10 transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-primary/60 sm:aspect-[4/3] lg:aspect-[7/5]"
                >
                  <img
                    src={c.image}
                    alt=""
                    width={500}
                    height={500}
                    loading="lazy"
                    className={`absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105 ${c.position ?? "object-center"}`}
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-ink via-ink/5 to-transparent" />
                  <span className="absolute inset-x-0 bottom-0 grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 p-3 text-ink-foreground sm:p-4">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black sm:text-base">{c.label}</span>
                      <span className="mt-0.5 block text-[10px] font-extrabold text-primary sm:text-xs">Ver todo</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-primary sm:h-5 sm:w-5" />
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
