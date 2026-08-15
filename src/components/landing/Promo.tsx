import { MessageCircle } from "lucide-react";
import { requireCustomerAccess } from "@/lib/customer-access";
import { waLink } from "@/lib/site";

export function Promo() {
  const promoHref = waLink(
    "Hola! Vi las promociones de la semana y quiero aprovechar. Que productos tienen con descuento?",
  );

  return (
    <section id="ofertas" className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-[26px] bg-ink p-6 md:p-10 shadow-[0_18px_40px_rgba(15,27,61,0.22)]">
          <div
            className="absolute inset-0 opacity-10 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 22px, rgba(0,0,0,.3) 22px 24px)",
            }}
          />
          <div className="relative flex flex-col md:flex-row items-center gap-6 md:gap-10">
            <div className="flex-1 text-center md:text-left">
              <span className="inline-block bg-primary text-primary-foreground text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                Ofertas limitadas
              </span>
              <h2 className="font-display text-4xl font-semibold uppercase leading-[0.95] tracking-tight text-ink-foreground md:text-6xl">
                Hasta <span className="text-primary">25% OFF</span>
                <span className="mt-1 block text-base font-bold not-italic tracking-normal text-ink-foreground/80 md:text-xl">
                  En calzado seleccionado
                </span>
              </h2>
              <p className="mt-2 text-ink-foreground/90 text-sm md:text-base">
                Zapatillas, remeras, shorts y buzos con descuento esta semana. Consulta stock y
                talles por WhatsApp.
              </p>
            </div>

            <a
              href={promoHref}
              onClick={(e) => requireCustomerAccess(e, "whatsapp", promoHref)}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-7 h-12 text-sm font-bold uppercase tracking-wide text-primary-foreground hover:bg-primary/90 transition shadow-[0_10px_24px_rgba(255,106,0,0.35)] whitespace-nowrap"
            >
              <MessageCircle className="h-5 w-5" />
              Pedir por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
