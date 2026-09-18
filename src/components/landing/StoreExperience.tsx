import { ArrowRight, MapPin } from "lucide-react";
import interiorLocal from "@/assets/home/local-final.png.asset.json";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { requireCustomerAccess } from "@/lib/customer-access";
import { SITE, waLink } from "@/lib/site";

export function StoreExperience() {
  const whatsappHref = waLink("Hola! Quiero consultar por productos y stock disponible.");

  return (
    <section className="relative overflow-hidden bg-ink text-ink-foreground">
      <img
        src={interiorLocal.url}
        alt="Interior de Vera Deportes"
        width={1365}
        height={768}
        loading="lazy"
        className="absolute inset-0 h-full w-full object-cover object-[48%_center] opacity-80 sm:object-center"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-ink/95 via-ink/70 to-ink/5" />
      <div className="relative mx-auto flex min-h-[410px] max-w-7xl items-end px-5 py-10 sm:min-h-[500px] sm:items-center sm:px-8 xl:px-6">
        <div className="max-w-xl">
          <p className="text-xs font-extrabold uppercase tracking-[0.18em] text-primary">Viví la experiencia</p>
          <h2 className="mt-2 font-display text-4xl font-black uppercase leading-none sm:text-6xl">
            Más que deporte, es parte de vos.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-ink-foreground/85 sm:text-base">
            Te esperamos con atención cercana para encontrar el calzado y la indumentaria que mejor van con vos.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={SITE.maps}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-extrabold text-primary-foreground transition hover:brightness-105"
            >
              <MapPin className="h-4 w-4" /> Cómo llegar <ArrowRight className="h-4 w-4" />
            </a>
            <a
              href={whatsappHref}
              onClick={(event) => requireCustomerAccess(event, "whatsapp", whatsappHref)}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center gap-2 rounded-full border border-ink-foreground/45 bg-ink/45 px-5 text-sm font-extrabold text-ink-foreground backdrop-blur"
            >
              <WhatsAppIcon className="h-4 w-4" /> Consultar
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}