import { MessageCircle, Zap } from "lucide-react";
import promo from "@/assets/promo.jpg";
import { waLink } from "@/lib/site";

export function Promo() {
  return (
    <section id="ofertas" className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-3xl bg-ink text-ink-foreground">
          <img
            src={promo}
            alt="Promo deportiva"
            loading="lazy"
            width={1280}
            height={800}
            className="absolute inset-0 h-full w-full object-cover opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/80 to-ink/30" />
          <div className="absolute -right-10 -bottom-10 h-56 w-56 rounded-full bg-primary/30 blur-3xl" />

          <div className="relative p-6 md:p-12">
            <span className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-1 text-xs font-bold uppercase tracking-wider text-primary-foreground">
              <Zap className="h-3.5 w-3.5" />
              Promo de la semana
            </span>
            <h2 className="mt-4 font-display font-extrabold text-3xl md:text-5xl leading-[1.05] max-w-2xl">
              Hasta <span className="text-primary">25% OFF</span> en zapatillas
              seleccionadas
            </h2>
            <p className="mt-3 text-white/80 max-w-md">
              Promo válida esta semana. Consultá modelos y talles disponibles
              antes de venir al local.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={waLink("Hola! Quiero ver la promo de la semana en zapatillas.")}
                target="_blank"
                rel="noopener"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 font-semibold text-primary-foreground"
              >
                <MessageCircle className="h-5 w-5" />
                Quiero la promo
              </a>
              <a
                href="#productos"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 font-semibold text-white"
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
