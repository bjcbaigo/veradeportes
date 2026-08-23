import { ArrowRight } from "lucide-react";
import { getActivePromotions } from "@/lib/promotions";

export function PromoCarousel() {
  const promotions = getActivePromotions();

  return (
    <section id="promos" className="bg-white py-1.5 sm:py-2">
      <div className="mx-auto max-w-6xl xl:max-w-7xl">
        <div className="vd-scroll-x px-4 [scroll-snap-type:x_mandatory] xl:px-6">
          <div className="flex gap-3 pb-2 lg:gap-4">
            {promotions.map((promo) => (
              <a
                key={promo.id}
                href={promo.href}
                className="relative h-[120px] w-[calc(100vw-32px)] max-w-[430px] shrink-0 overflow-hidden rounded-[14px] bg-ink text-white shadow-[0_4px_14px_rgba(7,27,59,0.12)] [scroll-snap-align:start] sm:h-[132px] sm:w-[390px] lg:h-[140px] lg:w-[31.8%] lg:max-w-none xl:h-[150px]"
              >
                <img
                  src={promo.image}
                  alt=""
                  width={520}
                  height={300}
                  loading={promo.order === 1 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover opacity-82"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#071b3b] via-[#071b3b]/92 to-[#071b3b]/36" />
                <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-primary/18 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-3 sm:p-4 lg:p-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/80">
                    Vera Deportes
                  </p>
                  <h2 className="mt-1 max-w-[210px] text-balance font-display text-[19px] font-black uppercase leading-[0.98] text-white sm:text-[22px] lg:max-w-[230px] lg:text-[22px] xl:text-[24px]">
                    {promo.title}
                  </h2>
                  <p className="mt-1 max-w-[220px] text-[11px] font-semibold leading-snug text-white/88 lg:text-xs">
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
        <div className="flex justify-center gap-1.5 pt-0.5">
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
