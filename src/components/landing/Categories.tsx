import { ArrowRight, Dumbbell, Percent } from "lucide-react";
import zap from "@/assets/cat-zapatillas.png";
import rem from "@/assets/cat-remeras.png";
import acc from "@/assets/cat-accesorios.png";
import buz from "@/assets/cat-buzos.png";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const CATS: {
  label: CategoryKey | "Futbol";
  filter: CategoryKey;
  subtitle?: string;
  image?: string;
  icon?: "offer" | "sport";
}[] = [
  { label: "Zapatillas", filter: "Zapatillas", subtitle: "Running y urbano", image: zap },
  { label: "Indumentaria", filter: "Indumentaria", subtitle: "Remeras y buzos", image: rem },
  { label: "Futbol", filter: "Indumentaria", subtitle: "Entrenamiento", icon: "sport" },
  { label: "Accesorios", filter: "Accesorios", subtitle: "Medias y gorras", image: acc },
  { label: "Ninos", filter: "Ninos", subtitle: "Calzado infantil", image: buz },
  { label: "Ofertas", filter: "Ofertas", subtitle: "Promos activas", icon: "offer" },
];

export function Categories() {
  return (
    <section id="categorias" className="py-4">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-xl font-black uppercase tracking-normal">Categorias</h2>
          <a
            href="#productos"
            onClick={() => emitCategory("Todos")}
            className="inline-flex items-center gap-1 text-sm font-bold text-primary"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex gap-3 pb-2 md:grid md:grid-cols-6">
            {CATS.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => emitCategory(c.filter)}
                className="flex w-[104px] shrink-0 flex-col items-center rounded-2xl border border-border bg-card p-2.5 transition hover:border-primary/60 md:w-auto"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white ring-1 ring-black/5">
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
                <span className="mt-2 text-center text-[12px] font-extrabold leading-tight text-foreground">
                  {c.label}
                </span>
                <span className="mt-0.5 text-center text-[10px] leading-tight text-muted-foreground">
                  {c.subtitle}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
