import { MessageCircle, MapPin } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { requireCustomerAccess } from "@/lib/customer-access";
import { SITE, waLink } from "@/lib/site";

export function Hero() {
  const consultHref = waLink("Hola! Quiero hacer una consulta sobre productos.");

  return (
    <section id="top" className="w-full pt-6 pb-4 sm:pt-10">
      <div className="mx-auto grid max-w-6xl items-center gap-6 px-4 lg:grid-cols-2 lg:gap-10 xl:max-w-7xl xl:px-6">
        <div>
          <h1 className="font-display text-[40px] font-black uppercase leading-[0.92] tracking-[-0.04em] text-foreground sm:text-6xl">
            Explora.
            <br />
            Elegi.
            <br />
            Encontra.
          </h1>
          <p className="mt-4 max-w-sm text-base font-semibold leading-snug text-muted-foreground sm:text-lg">
            Todo lo que necesitas,
            <br />
            en un <span className="text-primary">solo lugar</span>.
          </p>
          <p className="mt-3 max-w-md text-sm text-muted-foreground">
            {SITE.heroSubtitle}. <span className="font-semibold">{SITE.shipping}.</span>
          </p>

          <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:gap-3">
            <a
              href={consultHref}
              onClick={(e) => requireCustomerAccess(e, "whatsapp", consultHref)}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-bold uppercase tracking-wide text-primary-foreground shadow-[0_10px_24px_rgba(255,106,0,0.3)] transition active:scale-[0.98] sm:w-auto"
            >
              <MessageCircle className="h-5 w-5 shrink-0" />
              Consultar
            </a>
            <a
              href={SITE.maps}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-full bg-ink px-6 text-sm font-bold uppercase tracking-wide text-ink-foreground transition hover:opacity-90 active:scale-[0.98] sm:w-auto"
            >
              <MapPin className="h-5 w-5 shrink-0" />
              Como llegar
            </a>
            <a
              href="#productos"
              className="inline-flex h-12 items-center justify-center rounded-full border border-border px-6 text-sm font-bold uppercase tracking-wide text-foreground transition hover:border-primary hover:text-primary"
            >
              Ver productos
            </a>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[28px] bg-ink shadow-[0_18px_40px_rgba(15,27,61,0.2)]">
          <img
            src={hero}
            alt="Portada Vera Deportes - indumentaria y calzado deportivo en Vera, Santa Fe"
            width={1916}
            height={821}
            fetchPriority="high"
            decoding="async"
            className="h-[240px] w-full object-cover opacity-95 sm:h-[320px] lg:h-[380px]"
          />
        </div>
      </div>
    </section>
  );
}
