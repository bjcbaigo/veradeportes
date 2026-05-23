import { MessageCircle } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { waLink } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="px-4 pt-4">
      <div className="relative overflow-hidden rounded-3xl bg-ink text-ink-foreground">
        <img
          src={hero}
          alt="Zapatilla deportiva en acción"
          width={1280}
          height={1600}
          className="absolute right-0 top-0 h-full w-[65%] object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/85 to-ink/10" />

        <div className="relative p-6 md:p-12 max-w-xl">
          <div className="h-1 w-10 bg-primary rounded-full mb-5" />
          <h1 className="font-display font-extrabold text-[2.4rem] sm:text-5xl md:text-6xl leading-[0.95]">
            Zapatillas e<br />
            indumentaria<br />
            deportiva<br />
            <span className="text-primary">en Vera</span>
          </h1>
          <p className="mt-5 italic text-white/85 max-w-xs text-sm md:text-base leading-relaxed">
            Zapatillas, shorts, remeras, buzos y accesorios para tu día a día y
            tu mejor rendimiento.
          </p>

          <div className="mt-7 flex flex-col sm:flex-row gap-3">
            <a
              href={waLink("Hola! Quiero hacer una consulta sobre productos.")}
              target="_blank"
              rel="noopener"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-[15px] font-semibold text-primary-foreground shadow-lg shadow-primary/30 active:scale-[0.98] transition"
            >
              <MessageCircle className="h-5 w-5" />
              Consultar por WhatsApp
            </a>
            <a
              href="#productos"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-transparent px-5 text-[15px] font-semibold text-white hover:bg-white/10 transition"
            >
              Ver productos
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
