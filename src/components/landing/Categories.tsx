import { ArrowRight, Baby, Dumbbell, Footprints, Shirt, Tag, Watch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const CATS: {
  label: string;
  filter: CategoryKey;
  icon: LucideIcon;
}[] = [
  { label: "Calzado", filter: "Zapatillas", icon: Footprints },
  { label: "Indumentaria", filter: "Indumentaria", icon: Shirt },
  { label: "Futbol", filter: "Indumentaria", icon: Dumbbell },
  { label: "Accesorios", filter: "Accesorios", icon: Watch },
  { label: "Ninos", filter: "Ninos", icon: Baby },
  { label: "Ofertas", filter: "Ofertas", icon: Tag },
];

export function Categories() {
  return (
    <section id="categorias" className="py-4">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h2 className="font-display text-sm font-black uppercase tracking-tight text-foreground lg:text-lg">
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
          <div className="flex gap-3 pb-2 md:grid md:grid-cols-6 lg:gap-4">
            {CATS.map(({ label, filter, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => emitCategory(filter)}
                className="group flex w-[80px] shrink-0 flex-col items-center focus:outline-none md:w-auto lg:w-full"
              >
                <div className="flex h-[72px] w-[72px] items-center justify-center rounded-[22px] bg-ink text-ink-foreground shadow-[0_10px_22px_rgba(15,27,61,0.18)] transition group-hover:bg-primary group-focus-visible:ring-2 group-focus-visible:ring-primary lg:h-[86px] lg:w-[86px]">
                  <Icon className="h-8 w-8 lg:h-9 lg:w-9" strokeWidth={1.8} />
                </div>
                <span className="mt-2 text-center text-[11px] font-semibold leading-tight text-muted-foreground lg:text-sm">
                  {label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
