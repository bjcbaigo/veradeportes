import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import heroIndumentaria from "@/assets/home/hero-indumentaria.png.asset.json";
import heroZapatilla from "@/assets/home/hero-zapatilla.png.asset.json";
import interiorLocal from "@/assets/home/interior-vera-deportes.png.asset.json";

const SLIDES = [
  {
    image: heroIndumentaria.url,
    eyebrow: "Movimiento y estilo",
    title: "Entrená cómoda. Vestite como vos.",
    subtitle: "Indumentaria deportiva para moverte con libertad todos los días.",
    cta: "Ver indumentaria",
    href: "/tienda#productos",
    position: "object-[58%_center] sm:object-center",
  },
  {
    image: heroZapatilla.url,
    eyebrow: "Tu próximo par",
    title: "Pisá fuerte. Llegá más lejos.",
    subtitle: "Zapatillas urbanas y running seleccionadas para cada ritmo.",
    cta: "Ver zapatillas",
    href: "/tienda#productos",
    position: "object-[61%_center] sm:object-center",
  },
  {
    image: interiorLocal.url,
    eyebrow: "Vera Deportes",
    title: "Tu pasión se vive acá.",
    subtitle: "Productos destacados y atención cercana en nuestro local.",
    cta: "Ver novedades",
    href: "/tienda#productos",
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
      <div className="relative mx-auto h-[430px] max-w-[1600px] sm:h-[520px] lg:h-[610px]">
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
            <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/70 to-transparent sm:via-ink/50" />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-ink/65 to-transparent sm:hidden" />
            <div className="absolute inset-0 flex items-end sm:items-center">
              <div className="mx-auto w-full max-w-7xl px-5 pb-20 sm:px-8 sm:pb-0 xl:px-12">
                <div className="max-w-[620px] text-ink-foreground">
                  <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary sm:text-sm">
                    {slide.eyebrow}
                  </p>
                  <h1 className="mt-2 max-w-[580px] font-display text-[38px] font-black uppercase leading-[0.98] sm:text-6xl lg:text-7xl">
                    {slide.title}
                  </h1>
                  <p className="mt-4 max-w-md text-sm font-medium leading-relaxed text-ink-foreground/90 sm:text-lg">
                    {slide.subtitle}
                  </p>
                  <a
                    href={slide.href}
                    className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-extrabold text-primary-foreground shadow-lg transition hover:brightness-105 active:scale-[0.98]"
                  >
                    {slide.cta}
                    <ArrowRight className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        ))}

        <div className="absolute inset-x-0 bottom-5 z-20 mx-auto grid max-w-7xl grid-cols-[44px_1fr_44px] items-center gap-3 px-4 sm:bottom-8 sm:px-8 xl:px-12">
          <button
            type="button"
            onClick={() => move(-1)}
            aria-label="Imagen anterior"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-foreground/40 bg-ink/45 text-ink-foreground backdrop-blur transition hover:bg-ink/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex justify-center gap-2" role="tablist" aria-label="Elegir imagen">
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
          <button
            type="button"
            onClick={() => move(1)}
            aria-label="Imagen siguiente"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-foreground/40 bg-ink/45 text-ink-foreground backdrop-blur transition hover:bg-ink/70"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
}