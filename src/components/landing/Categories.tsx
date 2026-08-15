import { Baby, Dumbbell, Footprints, Shirt, Tag, Watch } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const CATS: {
  label: string;
  filter: CategoryKey;
  icon: LucideIcon;
}[] = [
  { label: "Calzado", filter: "Zapatillas", icon: Footprints },
  { label: "Indumentaria", filter: "Indumentaria", icon: Shirt },
  { label: "Ofertas", filter: "Ofertas", icon: Tag },
  { label: "Accesorios", filter: "Accesorios", icon: Watch },
  { label: "Ninos", filter: "Ninos", icon: Baby },
  { label: "Futbol", filter: "Indumentaria", icon: Dumbbell },
];

export function Categories() {
  return (
    <section id="categorias" className="pt-3 pb-1">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex gap-3 pb-1 md:grid md:grid-cols-6 lg:gap-4">
            {CATS.map(({ label, filter, icon: Icon }) => (
              <button
                key={label}
                type="button"
                onClick={() => emitCategory(filter)}
                className="group flex w-[76px] shrink-0 flex-col items-center focus:outline-none md:w-auto lg:w-full"
              >
                <div className="flex aspect-square w-[76px] items-center justify-center rounded-[14px] bg-ink text-ink-foreground shadow-[0_2px_10px_rgba(7,27,59,0.12)] transition group-hover:bg-ink-secondary group-focus-visible:ring-2 group-focus-visible:ring-primary md:w-full lg:rounded-[16px]">
                  <Icon className="h-8 w-8 lg:h-9 lg:w-9" strokeWidth={1.7} />
                </div>
                <span className="mt-2 text-center text-[12px] font-medium leading-tight text-foreground/80 lg:text-sm">
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
