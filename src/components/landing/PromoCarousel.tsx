import { useEffect, useRef, useState } from "react";
import { getActivePromotions } from "@/lib/promotions";

export function PromoCarousel() {
  const promotions = getActivePromotions();
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    const onScroll = () => {
      const child = track.firstElementChild as HTMLElement | null;
      if (!child) return;
      const step = child.offsetWidth + 12;
      setIndex(Math.round(track.scrollLeft / step));
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (promotions.length < 2) return;
    const timer = window.setInterval(() => {
      const track = trackRef.current;
      const child = track?.firstElementChild as HTMLElement | null;
      if (!track || !child) return;
      const step = child.offsetWidth + 12;
      const next = (Math.round(track.scrollLeft / step) + 1) % promotions.length;
      track.scrollTo({ left: next * step, behavior: "smooth" });
    }, 5000);
    return () => window.clearInterval(timer);
  }, [promotions.length]);

  function goTo(i: number) {
    const track = trackRef.current;
    const child = track?.firstElementChild as HTMLElement | null;
    if (!track || !child) return;
    track.scrollTo({ left: i * (child.offsetWidth + 12), behavior: "smooth" });
  }

  return (
    <section id="promos" className="pt-3">
      <div className="mx-auto max-w-6xl xl:max-w-7xl">
        <div
          ref={trackRef}
          className="overflow-x-auto px-4 [scroll-snap-type:x_mandatory] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden xl:px-6"
        >
          <div className="flex gap-3">
            {promotions.map((promo) => (
              <a
                key={promo.id}
                href={promo.href}
                className="relative h-[168px] w-[calc(100vw-32px)] max-w-[560px] shrink-0 overflow-hidden rounded-[16px] bg-ink text-ink-foreground shadow-[0_2px_10px_rgba(0,0,0,0.06)] [scroll-snap-align:center] sm:h-[190px] lg:h-[220px] lg:w-[calc(33.33%-8px)] lg:max-w-none"
              >
                <img
                  src={promo.image}
                  alt=""
                  width={560}
                  height={280}
                  loading={promo.order === 1 ? "eager" : "lazy"}
                  className="absolute inset-y-0 right-0 h-full w-[62%] object-cover"
                />
                <div className="absolute inset-0 bg-linear-to-r from-ink via-ink/95 to-transparent" />
                <div className="relative flex h-full max-w-[62%] flex-col justify-center gap-1 pl-5 lg:pl-6">
                  <h2 className="font-display text-[26px] font-extrabold uppercase leading-[0.95] sm:text-[30px]">
                    {promo.subtitle}
                  </h2>
                  <p className="font-display text-[15px] font-semibold uppercase leading-tight text-ink-foreground/85 sm:text-[17px]">
                    {promo.title}
                  </p>
                  <span className="mt-3 inline-flex h-[42px] w-fit items-center rounded-[12px] bg-primary px-4 text-[12px] font-bold uppercase tracking-wide text-primary-foreground">
                    {promo.ctaText}
                  </span>
                </div>
              </a>
            ))}
          </div>
        </div>
        <div className="flex justify-center gap-1.5 pt-3">
          {promotions.map((promo, i) => (
            <button
              key={promo.id}
              type="button"
              aria-label={`Ir a promocion ${i + 1}`}
              onClick={() => goTo(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-4 bg-ink" : "w-1.5 bg-border"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
