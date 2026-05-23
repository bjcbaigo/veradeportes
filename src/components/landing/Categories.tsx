import { ArrowRight, Percent } from "lucide-react";
import zap from "@/assets/p-zapatillas-1.jpg";
import rem from "@/assets/p-remera-1.jpg";
import sho from "@/assets/p-short-1.jpg";
import buz from "@/assets/p-buzo-2.jpg";
import acc from "@/assets/p-acc-1.jpg";

const CATS = [
  { label: "Zapatillas", image: zap },
  { label: "Remeras", image: rem },
  { label: "Shorts", image: sho },
  { label: "Buzos", image: buz },
  { label: "Accesorios", image: acc },
  { label: "Ofertas", icon: true },
];

export function Categories() {
  return (
    <section id="categorias" className="pt-10 pb-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl">
            Categorías rápidas
          </h2>
          <a href="#productos" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
            Ver todas <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="-mx-4 px-4 overflow-x-auto">
          <div className="flex gap-3 min-w-max md:min-w-0 md:grid md:grid-cols-6">
            {CATS.map((c) => (
              <a
                key={c.label}
                href="#productos"
                className="flex flex-col items-center justify-between rounded-2xl bg-card border border-ink/20 shadow-sm p-3 w-[110px] md:w-auto hover:border-primary/50 transition"
              >
                <div className="h-16 w-16 md:h-20 md:w-20 flex items-center justify-center">
                  {c.icon ? (
                    <div className="h-14 w-14 rounded-xl bg-primary flex items-center justify-center text-primary-foreground">
                      <Percent className="h-7 w-7" strokeWidth={3} />
                    </div>
                  ) : (
                    <img
                      src={c.image}
                      alt={c.label}
                      loading="lazy"
                      width={160}
                      height={160}
                      className="h-full w-full object-contain"
                    />
                  )}
                </div>
                <span className="mt-2 text-[13px] font-bold">{c.label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
