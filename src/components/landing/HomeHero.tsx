import { ArrowLeft, ArrowRight, CreditCard, RefreshCcw, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import heroIndumentaria from "@/assets/home/hero-indumentaria.png.asset.json";
import heroZapatilla from "@/assets/home/hero-zapatilla.png.asset.json";
import interiorLocal from "@/assets/home/interior-vera-deportes.png.asset.json";
import { emitCategory, type CategoryKey } from "@/lib/category-filter";

const SLIDES = [
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
    image: heroZapatilla.url,
    eyebrow: "Elegí",
    title: "Tu próximo par",
    subtitle: "Zapatillas urbanas y running seleccionadas para cada ritmo.",
    cta: "Ver zapatillas",
    href: "/tienda#productos",
    filter: "Zapatillas" as CategoryKey,
    position: "object-[61%_center] sm:object-center",
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
      <div className="relative mx-auto h-[430px] max-w-[1600px] sm:h-[500px] lg:h-[570px]">
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
            <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/45 to-transparent sm:via-ink/25" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/65 to-transparent sm:hidden" />
            <div className="absolute inset-0 flex items-end sm:items-center">
              <div className="mx-auto w-full max-w-7xl px-5 pb-24 sm:px-8 sm:pb-14 xl:px-12">
                <div className="max-w-[560px] text-ink-foreground">
                  <p className="text-xs font-extrabold uppercase tracking-[0.28em] text-ink-foreground sm:text-base">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-1 max-w-[580px] font-display text-[34px] font-black uppercase leading-none text-primary sm:text-5xl lg:text-[58px]">
                    {slide.title}
                  </h1>
                  <p className="mt-3 max-w-md text-sm font-medium leading-relaxed text-ink-foreground/95 sm:text-base">
                    {slide.subtitle}
                  </p>
                  <div className="mt-5 flex flex-wrap gap-3">
                    <a
                      href={slide.href}
                      onClick={() => emitCategory(slide.filter)}
                      className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground shadow-lg transition hover:brightness-105 active:scale-[0.98]"
                    >
                      {slide.cta}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                    <a
                      href="/ofertas"
                      className="inline-flex h-11 items-center justify-center rounded-full border border-ink-foreground/70 bg-ink/25 px-5 text-sm font-extrabold text-ink-foreground backdrop-blur-sm transition hover:bg-ink/55"
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
          className="absolute left-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-foreground/45 bg-ink/40 text-ink-foreground backdrop-blur transition hover:bg-ink/70 sm:left-6"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={() => move(1)}
          aria-label="Imagen siguiente"
          className="absolute right-3 top-1/2 z-20 inline-flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-ink-foreground/45 bg-ink/40 text-ink-foreground backdrop-blur transition hover:bg-ink/70 sm:right-6"
        >
          <ArrowRight className="h-5 w-5" />
        </button>

        <div className="absolute inset-x-0 bottom-10 z-20 mx-auto max-w-7xl px-5 sm:bottom-12 sm:px-8 xl:px-12">
          <div className="hidden items-center gap-8 text-ink-foreground sm:flex">
            <div className="flex items-center gap-2"><Truck className="h-5 w-5" /><span className="text-xs font-semibold leading-tight">Envíos<br /><span className="font-normal text-ink-foreground/75">a todo el país</span></span></div>
            <div className="flex items-center gap-2"><CreditCard className="h-5 w-5" /><span className="text-xs font-semibold leading-tight">Pagos<br /><span className="font-normal text-ink-foreground/75">seguros</span></span></div>
            <div className="flex items-center gap-2"><RefreshCcw className="h-5 w-5" /><span className="text-xs font-semibold leading-tight">Cambios<br /><span className="font-normal text-ink-foreground/75">sin complicaciones</span></span></div>
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