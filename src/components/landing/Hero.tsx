import { ArrowRight, MessageCircle } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { waLink } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-ink text-ink-foreground">
      <img
        src={hero}
        alt="Atleta en movimiento con indumentaria deportiva"
        width={1280}
        height={1600}
        className="absolute inset-0 h-full w-full object-cover opacity-55"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/40 via-ink/60 to-ink" />
      <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-primary/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-4 pt-14 pb-16 md:pt-24 md:pb-28">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 border border-primary/40 px-3 py-1 text-xs font-semibold tracking-wide uppercase text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Tienda local · Vera, Santa Fe
        </span>

        <h1 className="mt-5 font-display font-extrabold text-4xl sm:text-5xl md:text-6xl leading-[1.05]">
          Zapatillas e indumentaria <br className="hidden sm:block" />
          deportiva en <span className="text-primary">Vera</span>
        </h1>

        <p className="mt-5 max-w-xl text-base md:text-lg text-white/80">
          Zapatillas, shorts, remeras, buzos y accesorios. Consultá talles,
          precios y promos directo por WhatsApp.
        </p>

        <div className="mt-7 flex flex-col sm:flex-row gap-3">
          <a
            href={waLink("Hola! Quiero hacer una consulta sobre productos.")}
            target="_blank"
            rel="noopener"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/30 active:scale-[0.98] transition"
          >
            <MessageCircle className="h-5 w-5" />
            Consultar por WhatsApp
          </a>
          <a
            href="#productos"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-white/30 bg-white/5 px-6 text-base font-semibold text-white hover:bg-white/10 transition"
          >
            Ver productos
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="mt-10 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/70">
          <span>· Atención personalizada</span>
          <span>· Retiro en local</span>
          <span>· Respuesta rápida</span>
        </div>
      </div>
    </section>
  );
}
