import { ArrowLeft, ArrowRight, CreditCard, RefreshCcw, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import heroIndumentaria from "@/assets/home/hero-indumentaria.png.asset.json";
import heroZapatilla from "@/assets/home/hero-zapatilla.png.asset.json";
import interiorLocal from "@/assets/home/interior-vera-deportes.png.asset.json";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const SLIDES = [
  {
    image: heroZapatilla.url,
    eyebrow: "Movimiento",
    title: "Sin límites",
    subtitle: "Zapatillas para cada desafío de tu día.",
    cta: "Ver zapatillas",
    href: "/tienda#productos",
    filter: "Zapatillas" as CategoryKey,
    position: "object-[60%_center] sm:object-center",
  },
  {
    image: heroIndumentaria.url,
    eyebrow: "Tu estilo,",
    title: "En movimiento",
    subtitle: "Indumentaria, zapatillas y accesorios para llegar más lejos.",
    cta: "Ver colección",
    href: "/tienda#productos",
    filter: "Indumentaria" as CategoryKey,
    position: "object-[58%_center] sm:object-center",
  },
  {
    image: interiorLocal.url,
    eyebrow: "Viví la experiencia",
    title: "Vera Deportes",
    subtitle: "Productos destacados y atención cercana en nuestro local.",
    cta: "Ver novedades",
    href: "/tienda#productos",
    filter: "Todos" as CategoryKey,
    position: "object-[38%_center] sm:object-center",
  },
];

export function HomeHero() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setActive((value) => (value + 1) % SLIDES.length), 6500);
    return () => window.clearInterval(timer);
  }, []);

  function move(direction: number) {
    setActive((value) => (value + direction + SLIDES.length) % SLIDES.length);
  }

  return (
    <section aria-label="Novedades de Vera Deportes" className="relative overflow-hidden bg-ink">
      <div className="relative mx-auto h-[220px] max-w-[1600px] sm:h-[500px] lg:h-[570px]">
        {SLIDES.map((slide, index) => (
          <article
            key={slide.eyebrow}
            aria-hidden={index !== active}
            className={`absolute inset-0 transition-opacity duration-700 motion-reduce:transition-none ${
              index === active ? "z-10 opacity-100" : "z-0 opacity-0"
            }`}
          >
            <img
              src={slide.image}
              alt=""
              width={1920}
              height={1080}
              fetchPriority={index === 0 ? "high" : "auto"}
              className={`h-full w-full object-cover ${slide.position}`}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/45 to-transparent sm:via-ink/25" />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink/60 to-transparent sm:hidden" />
            <div className="absolute inset-0 flex items-start pt-7 sm:items-center sm:pt-0">
              <div className="mx-auto w-full max-w-7xl px-5 sm:px-8 sm:pb-14 xl:px-12">
                <div className="max-w-[210px] text-ink-foreground sm:max-w-[560px]">
                  <p className="text-[11px] font-black uppercase text-ink-foreground sm:text-base">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-0.5 max-w-[580px] font-display text-[25px] font-black uppercase leading-none text-primary sm:mt-1 sm:text-5xl lg:text-[58px]">
                    {slide.title}
                  </h1>
                  <p className="mt-1 max-w-[185px] text-[11px] font-bold leading-tight text-ink-foreground/95 sm:mt-3 sm:max-w-md sm:text-base sm:font-medium sm:leading-relaxed">
                    {slide.subtitle}
                  </p>
                   <div className="mt-2.5 flex flex-nowrap gap-2 sm:mt-5 sm:flex-wrap sm:gap-3">
                    <a
                      href={slide.href}
                      onClick={() => emitCategory(slide.filter)}
                        className="inline-flex h-8 items-center justify-center gap-1 rounded-full bg-primary px-3 text-[10px] font-extrabold text-primary-foreground shadow-lg transition hover:brightness-105 active:scale-[0.98] sm:h-11 sm:gap-2 sm:px-5 sm:text-sm"
                    >
                      {slide.cta}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="/ofertas"
                        className="inline-flex h-8 items-center justify-center rounded-full border border-ink-foreground/70 bg-ink/25 px-3 text-[10px] font-extrabold text-ink-foreground backdrop-blur-sm transition hover:bg-ink/55 sm:h-11 sm:px-5 sm:text-sm"
                    >
                      Ver ofertas
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}

        <button
          type="button"
          onClick={() => move(-1)}
          aria-label="Imagen anterior"
          className="absolute left-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-foreground/45 bg-ink/40 text-ink-foreground backdrop-blur transition hover:bg-ink/70 sm:inline-flex sm:left-6"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Imagen siguiente"
          className="absolute right-3 top-1/2 z-20 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-foreground/45 bg-ink/40 text-ink-foreground backdrop-blur transition hover:bg-ink/70 sm:inline-flex sm:right-6"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-2 z-20 mx-auto max-w-7xl px-5 sm:bottom-12 sm:px-8 xl:px-12">
          <div className="hidden items-center gap-8 text-ink-foreground sm:flex">
            <div className="flex items-center gap-2.5"><Truck className="h-5 w-5 shrink-0" /><span className="text-[13px] font-bold leading-[1.15]">Envíos<br /><span className="text-xs font-normal text-ink-foreground/85">a todo el país</span></span></div>
            <div className="flex items-center gap-2.5"><CreditCard className="h-5 w-5 shrink-0" /><span className="text-[13px] font-bold leading-[1.15]">Pagos<br /><span className="text-xs font-normal text-ink-foreground/85">seguros</span></span></div>
            <div className="flex items-center gap-2.5"><RefreshCcw className="h-5 w-5 shrink-0" /><span className="text-[13px] font-bold leading-[1.15]">Cambios<br /><span className="text-xs font-normal text-ink-foreground/85">sin complicaciones</span></span></div>
          </div>
          <div className="absolute bottom-1 left-1/2 flex -translate-x-1/2 justify-center gap-2" role="tablist" aria-label="Elegir imagen">
            {SLIDES.map((slide, index) => (
              <button
                key={slide.eyebrow}
                type="button"
                role="tab"
                aria-selected={index === active}
                aria-label={`Ver ${slide.eyebrow}`}
                onClick={() => setActive(index)}
                className={`h-2 rounded-full transition-all ${index === active ? "w-8 bg-primary" : "w-2 bg-ink-foreground/70"}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}