import { MessageCircle, MapPin } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { SITE, waLink } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="w-full">
      <div className="relative overflow-hidden w-full">
        <img
          src={hero}
          alt="Portada Vera Deportes"
          width={1916}
          height={821}
          className="w-full h-[420px] sm:h-auto object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="relative p-4 sm:p-6 md:p-12 max-w-xl">
            <div className="h-1 w-8 sm:w-10 bg-primary rounded-full mb-3 sm:mb-5" />
            <h1 className="font-display font-extrabold text-3xl sm:text-5xl md:text-6xl leading-[1.1] sm:leading-[0.95] text-white drop-shadow-lg">
              {SITE.heroTitle.split(" ")[0]} <span className="text-primary">{SITE.heroTitle.split(" ").slice(1).join(" ")}</span>
            </h1>
            <p className="mt-3 sm:mt-5 text-white/90 text-sm sm:text-base md:text-lg leading-relaxed drop-shadow">
              {SITE.heroSubtitle}. <span className="text-primary font-semibold">{SITE.shipping}.</span>
            </p>

            <div className="mt-5 sm:mt-7 flex flex-col sm:flex-row gap-2 sm:gap-3">
              <a
                href={waLink("Hola! Quiero hacer una consulta sobre productos.")}
                target="_blank"
                rel="noopener"
                className="inline-flex w-full sm:w-auto h-11 sm:h-12 items-center justify-center gap-2 rounded-xl bg-primary px-3 sm:px-5 text-[13px] sm:text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/30 active:scale-[0.98] transition whitespace-nowrap"
              >
                <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span>Consultar por WhatsApp</span>
              </a>
              <a
                href={SITE.maps}
                target="_blank"
                rel="noopener"
                className="inline-flex w-full sm:w-auto h-11 sm:h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-sm px-3 sm:px-5 text-[13px] sm:text-[15px] font-semibold text-white hover:bg-white/20 active:scale-[0.98] transition whitespace-nowrap"
              >
                <MapPin className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" />
                <span>Cómo llegar</span>
              </a>
              <a
                href="#productos"
                className="hidden sm:inline-flex h-10 sm:h-12 items-center justify-center gap-1.5 sm:gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-sm px-3 sm:px-5 text-[13px] sm:text-[15px] font-semibold text-white hover:bg-white/20 transition whitespace-nowrap"
              >
                Ver productos
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

