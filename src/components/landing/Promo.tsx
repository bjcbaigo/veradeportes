import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";

export function Promo() {
  return (
    <section id="ofertas" className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-ink p-6 md:p-10 ring-1 ring-black/20 shadow-2xl">
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
              <h2 className="font-display font-extrabold text-3xl md:text-5xl text-ink-foreground leading-tight">
                Hasta <span className="text-primary">25% OFF</span>
              </h2>
              <p className="mt-2 text-ink-foreground/90 text-sm md:text-base">
                Zapatillas, remeras, shorts y buzos con descuento esta semana.
                Consultá stock y talles por WhatsApp.
              </p>
            </div>

            <a
              href={waLink(
                "¡Hola! Vi las promociones de la semana y quiero aprovechar. ¿Qué productos tienen con descuento?"
              )}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 h-12 text-sm font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xl whitespace-nowrap"
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
