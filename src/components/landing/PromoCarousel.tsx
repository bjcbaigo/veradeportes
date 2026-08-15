import { ArrowRight, Sparkles } from "lucide-react";
import { getActivePromotions } from "@/lib/promotions";

export function PromoCarousel() {
  const promotions = getActivePromotions();

  return (
    <section id="promos" className="pt-3 sm:pt-4">
      <div className="mx-auto max-w-6xl xl:max-w-7xl">
        <div className="overflow-x-auto px-4 [scroll-snap-type:x_mandatory] xl:px-6">
          <div className="flex gap-3 pb-3 lg:gap-4">
            {promotions.map((promo) => (
              <a
                key={promo.id}
                href={promo.href}
                className="relative h-[210px] w-[86vw] max-w-[390px] shrink-0 overflow-hidden rounded-[28px] bg-ink text-white shadow-[0_18px_42px_rgba(0,0,0,0.18)] ring-1 ring-black/5 [scroll-snap-align:start] sm:h-[236px] sm:w-[390px] lg:h-[248px] lg:w-[31.8%] lg:max-w-none xl:h-[268px]"
              >
                <img
                  src={promo.image}
                  alt=""
                  width={520}
                  height={300}
                  loading={promo.order === 1 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black via-black/72 to-primary/72" />
                <div className="absolute -right-8 -top-10 h-32 w-32 rounded-full bg-primary/45 blur-2xl" />
                <div className="absolute -bottom-16 right-8 h-36 w-36 rounded-full bg-white/10 blur-2xl" />
                <div className="relative flex h-full flex-col justify-between p-5 lg:p-6">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/12 px-3 py-1 text-[10px] font-extrabold uppercase tracking-[0.14em] text-white ring-1 ring-white/15">
                      <Sparkles className="h-3.5 w-3.5 text-primary" />
                      Promo
                    </span>
                    <span className="rounded-full bg-primary px-3 py-1 text-[10px] font-black uppercase text-primary-foreground">
                      Vera
                    </span>
                  </div>
                  <div>
                    <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
                      Vera Deportes
                    </p>
                    <h2 className="mt-1 max-w-[270px] font-display text-[30px] font-black uppercase leading-[0.88] tracking-normal sm:text-[34px] lg:text-[36px]">
                      {promo.title}
                    </h2>
                    <p className="mt-2 max-w-[260px] text-sm font-semibold leading-snug text-white/90">
                      {promo.subtitle}
                    </p>
                    <span className="mt-4 inline-flex h-10 w-fit items-center gap-2 rounded-full bg-primary px-4 text-xs font-extrabold uppercase text-primary-foreground shadow-[0_8px_18px_rgba(243,112,33,0.32)]">
                      {promo.ctaText}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-1.5 pt-0.5">
          {promotions.map((promo, index) => (
            <span
              key={promo.id}
              className={`h-1.5 rounded-full ${index === 0 ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
