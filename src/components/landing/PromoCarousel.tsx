import { ArrowRight } from "lucide-react";
import { getActivePromotions } from "@/lib/promotions";

export function PromoCarousel() {
  const promotions = getActivePromotions();

  return (
    <section id="promos" className="bg-background py-2 sm:py-8">
      <div className="mx-auto max-w-6xl xl:max-w-7xl">
        <div className="mb-4 hidden px-4 sm:block xl:px-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Elegidos para vos</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-foreground sm:text-3xl">Historias en movimiento</h2>
        </div>
        <div className="px-3 sm:vd-scroll-x sm:px-4 sm:[scroll-snap-type:x_mandatory] xl:px-6">
          <div className="grid grid-cols-2 gap-2 sm:flex sm:gap-3 sm:pb-2 lg:grid lg:grid-cols-4 lg:gap-4">
            {promotions.map((promo) => (
              <a
                key={promo.id}
                href={promo.href}
                className={`relative h-[124px] min-w-0 overflow-hidden rounded-md bg-ink text-ink-foreground shadow-md sm:h-[200px] sm:w-[390px] sm:max-w-[430px] sm:shrink-0 sm:[scroll-snap-align:start] lg:h-[230px] lg:w-full lg:max-w-none ${promo.order > 2 ? "hidden sm:block" : "block"}`}
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
                 <div className="relative flex h-full flex-col justify-end p-2.5 sm:p-4 lg:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-ink-foreground/80">
                    Vera Deportes
                  </p>
                   <h3 className="mt-1 max-w-[140px] text-balance font-display text-[15px] font-black uppercase leading-[0.98] text-ink-foreground sm:max-w-[210px] sm:text-[24px] lg:max-w-[230px]">
                    {promo.title}
                  </h3>
                   <p className="mt-1 max-w-[140px] text-[9px] font-semibold leading-snug text-ink-foreground/90 sm:max-w-[220px] sm:text-[11px] lg:text-xs">
                    {promo.subtitle}
                  </p>
                   <span className="mt-1.5 inline-flex h-6 w-fit max-w-full items-center gap-1 rounded-full bg-primary px-2.5 text-[9px] font-black uppercase text-primary-foreground sm:mt-2 sm:h-7 sm:gap-1.5 sm:px-3.5 sm:text-[11px]">
                    {promo.ctaText}
                    <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="hidden justify-center gap-1.5 pt-0.5 sm:flex lg:hidden">
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
