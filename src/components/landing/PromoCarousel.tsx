import { ArrowRight } from "lucide-react";
import { getActivePromotions } from "@/lib/promotions";

export function PromoCarousel() {
  const promotions = getActivePromotions();

  return (
    <section id="promos" className="bg-background py-5 sm:py-8">
      <div className="mx-auto max-w-6xl xl:max-w-7xl">
        <div className="mb-4 px-4 xl:px-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Elegidos para vos</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-foreground sm:text-3xl">Historias en movimiento</h2>
        </div>
        <div className="vd-scroll-x px-4 [scroll-snap-type:x_mandatory] xl:px-6">
          <div className="flex gap-3 pb-2 lg:grid lg:grid-cols-4 lg:gap-4">
            {promotions.map((promo) => (
              <a
                key={promo.id}
                href={promo.href}
                className="relative h-[180px] w-[calc(100vw-48px)] max-w-[430px] shrink-0 overflow-hidden rounded-lg bg-ink text-ink-foreground shadow-md [scroll-snap-align:start] sm:h-[200px] sm:w-[390px] lg:h-[230px] lg:w-full lg:max-w-none"
              >
                <img
                  src={promo.image}
                  alt=""
                  width={520}
                  height={300}
                  loading={promo.order === 1 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover opacity-82"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-ink/30" />
                <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/18 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-3 sm:p-4 lg:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-foreground/80">
                    Vera Deportes
                  </p>
                  <h3 className="mt-1 max-w-[210px] text-balance font-display text-[21px] font-black uppercase leading-[0.98] text-ink-foreground sm:text-[24px] lg:max-w-[230px]">
                    {promo.title}
                  </h3>
                  <p className="mt-1 max-w-[220px] text-[11px] font-semibold leading-snug text-ink-foreground/90 lg:text-xs">
                    {promo.subtitle}
                  </p>
                  <span className="mt-2 inline-flex h-7 w-fit max-w-full items-center gap-1.5 rounded-full bg-primary px-3 text-[10px] font-black uppercase text-primary-foreground shadow-[0_8px_18px_rgba(255,98,0,0.24)] sm:px-3.5 sm:text-[11px]">
                    {promo.ctaText}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-1.5 pt-0.5 lg:hidden">
          {promotions.map((promo, index) => (
            <span
              key={promo.id}
              className={`h-1.5 rounded-full ${index === 0 ? "w-2 bg-ink" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
