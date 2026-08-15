import { Shirt, ShoppingBag, Tag, Watch } from "lucide-react";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const CATS: {
  label: CategoryKey | "Calzado";
  filter: CategoryKey;
  icon: typeof ShoppingBag;
}[] = [
  { label: "Calzado", filter: "Zapatillas", icon: ShoppingBag },
  { label: "Indumentaria", filter: "Indumentaria", icon: Shirt },
  { label: "Ofertas", filter: "Ofertas", icon: Tag },
  { label: "Accesorios", filter: "Accesorios", icon: Watch },
];

export function Categories() {
  return (
    <section id="categorias" className="bg-white pb-2 pt-3 lg:py-5">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <h2 className="sr-only">Categorias</h2>
        <div className="px-1 sm:px-0">
          <div className="grid grid-cols-4 gap-2.5 pb-2 sm:gap-3 md:grid-cols-4 lg:gap-4">
            {CATS.map((c) => {
              const Icon = c.icon;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => emitCategory(c.filter)}
                  className="flex min-w-0 flex-col items-center text-center transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary/60"
                >
                  <span className="flex h-[50px] w-[50px] items-center justify-center rounded-[13px] bg-ink text-ink-foreground shadow-[0_2px_8px_rgba(7,27,59,0.10)] sm:h-[54px] sm:w-[54px] lg:h-[64px] lg:w-[64px]">
                    <Icon className="h-7 w-7" strokeWidth={2.25} />
                  </span>
                  <span className="mt-1.5 w-full max-w-[78px] truncate text-center text-[10.5px] font-medium leading-tight text-foreground sm:text-[11px] lg:text-sm">
                    {c.label}
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
