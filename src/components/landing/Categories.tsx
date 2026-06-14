import { ArrowRight, Percent } from "lucide-react";
import zap from "@/assets/cat-zapatillas.png";
import rem from "@/assets/cat-remeras.png";
import acc from "@/assets/cat-accesorios.png";
import buz from "@/assets/cat-buzos.png";

const CATS = [
  { label: "Zapatillas", subtitle: "Running · Urbano · Training", image: zap },
  { label: "Indumentaria", subtitle: "Remeras · Buzos · Camperas", image: rem },
  { label: "Accesorios", subtitle: "Mochilas · Gorras · Medias", image: acc },
  { label: "Niños", subtitle: "Calzado infantil", image: buz },
  { label: "Ofertas", subtitle: "Hasta 25% OFF", icon: true },
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
          <div className="flex gap-3 min-w-max md:min-w-0 md:grid md:grid-cols-5">
            {CATS.map((c) => (
              <a
                key={c.label}
                href="#productos"
                className="flex flex-col items-center justify-between rounded-3xl bg-[#e5e7eb] border border-border/70 p-3 w-[110px] md:w-auto hover:border-primary/50 transition"
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
                <span className="mt-2 text-[13px] font-bold text-neutral-900 text-center">{c.label}</span>
                {c.subtitle && (
                  <span className="mt-0.5 text-[10px] text-neutral-500 text-center leading-tight hidden md:block">{c.subtitle}</span>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
