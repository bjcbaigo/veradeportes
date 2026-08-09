import { ArrowRight, Dumbbell, Percent } from "lucide-react";
import zap from "@/assets/cat-zapatillas.png";
import rem from "@/assets/cat-remeras.png";
import acc from "@/assets/cat-accesorios.png";
import buz from "@/assets/cat-buzos.png";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const CATS: {
  label: CategoryKey | "Calzado" | "Futbol";
  filter: CategoryKey;
  image?: string;
  icon?: "offer" | "sport";
}[] = [
  { label: "Calzado", filter: "Zapatillas", image: zap },
  { label: "Indumentaria", filter: "Indumentaria", image: rem },
  { label: "Futbol", filter: "Indumentaria", icon: "sport" },
  { label: "Accesorios", filter: "Accesorios", image: acc },
  { label: "Ninos", filter: "Ninos", image: buz },
  { label: "Ofertas", filter: "Ofertas", icon: "offer" },
];

export function Categories() {
  return (
    <section id="categorias" className="py-3">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h2 className="font-display text-sm font-black uppercase tracking-normal lg:text-lg">
            Categorias
          </h2>
          <a
            href="#productos"
            onClick={() => emitCategory("Todos")}
            className="inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>

        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex gap-2 pb-2 md:grid md:grid-cols-6 lg:gap-4">
            {CATS.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => emitCategory(c.filter)}
                className="flex w-[82px] shrink-0 flex-col items-center transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/60 md:w-auto lg:w-full"
              >
                <div className="flex h-[74px] w-[74px] lg:h-[92px] lg:w-[92px] items-center justify-center rounded-full bg-white p-2 shadow-[0_8px_20px_rgba(0,0,0,0.07)] ring-1 ring-black/5">
                  {c.icon === "offer" ? (
                    <Percent className="h-7 w-7 text-primary" strokeWidth={3} />
                  ) : c.icon === "sport" ? (
                    <Dumbbell className="h-7 w-7 text-primary" strokeWidth={2.5} />
                  ) : (
                    <img
                      src={c.image}
                      alt={c.label}
                      loading="lazy"
                      width={128}
                      height={128}
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
                <span className="mt-2 text-center text-[11px] font-extrabold leading-tight text-foreground lg:text-sm">
                  {c.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
