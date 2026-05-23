import { MapPin, Clock, MessageCircle, Navigation } from "lucide-react";
import { SITE, waLink } from "@/lib/site";

export function Contact() {
  return (
    <section id="contacto" className="py-12 md:py-16 bg-ink text-ink-foreground">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Visitanos
            </p>
            <h2 className="mt-1 font-display font-extrabold text-3xl md:text-4xl leading-tight">
              Te esperamos en <span className="text-primary">Vera</span>
            </h2>
            <p className="mt-3 text-white/70 max-w-md">
              Pasá por el local o escribinos para reservar tu producto antes de venir.
            </p>

            <div className="mt-6 flex flex-col gap-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary flex-none mt-0.5" />
                <span>{SITE.address}</span>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary flex-none mt-0.5" />
                <span>{SITE.hours}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={waLink("Hola! Quiero hacer una consulta.")}
                target="_blank"
                rel="noopener"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
              >
                <MessageCircle className="h-5 w-5" />
                Escribir por WhatsApp
              </a>
              <a
                href={SITE.maps}
                target="_blank"
                rel="noopener"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 font-semibold text-white"
              >
                <Navigation className="h-5 w-5" />
                Cómo llegar
              </a>
            </div>
          </div>

          <div className="rounded-2xl overflow-hidden border border-white/10 aspect-[4/3] md:aspect-square">
            <iframe
              title="Mapa Vera Santa Fe"
              src="https://www.google.com/maps?q=Vera+Santa+Fe&output=embed"
              className="h-full w-full grayscale contrast-110"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
