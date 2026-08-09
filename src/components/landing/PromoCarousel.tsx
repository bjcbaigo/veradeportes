import { ArrowRight } from "lucide-react";
import { getActivePromotions } from "@/lib/promotions";

export function PromoCarousel() {
  const promotions = getActivePromotions();

  return (
    <section id="promos" className="pt-3">
      <div className="mx-auto max-w-6xl">
        <div className="overflow-x-auto px-4 [scroll-snap-type:x_mandatory]">
          <div className="flex gap-3 pb-3">
            {promotions.map((promo) => (
              <a
                key={promo.id}
                href={promo.href}
                className="relative h-[176px] w-[82vw] max-w-[390px] shrink-0 overflow-hidden rounded-2xl bg-ink text-white shadow-[0_10px_30px_rgba(0,0,0,0.12)] [scroll-snap-align:start] sm:h-[220px] sm:w-[390px]"
              >
                <img
                  src={promo.image}
                  alt=""
                  width={520}
                  height={300}
                  loading={promo.order === 1 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/78 via-black/35 to-black/5" />
                <div className="relative flex h-full flex-col justify-end p-4">
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-primary">
                    Vera Deportes
                  </p>
                  <h2 className="mt-1 max-w-[260px] font-display text-2xl font-black uppercase leading-[0.95]">
                    {promo.title}
                  </h2>
                  <p className="mt-1 max-w-[260px] text-sm font-semibold text-white/92">
                    {promo.subtitle}
                  </p>
                  <span className="mt-3 inline-flex h-9 w-fit items-center gap-1.5 rounded-lg bg-primary px-3 text-xs font-extrabold uppercase text-primary-foreground">
                    {promo.ctaText}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-1.5">
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
