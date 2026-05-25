import { MessageCircle } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { waLink } from "@/lib/site";

export function Hero() {
  return (
    <section id="top" className="px-4 pt-4">
      <div className="relative overflow-hidden rounded-3xl">
        <img
          src={hero}
          alt="Portada Vera Deportes"
          width={1916}
          height={821}
          className="w-full h-auto object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />

        <div className="absolute inset-0 flex items-center">
          <div className="relative p-6 md:p-12 max-w-xl">
            <div className="h-1 w-10 bg-primary rounded-full mb-5" />
            <h1 className="font-display font-extrabold text-[2.4rem] sm:text-5xl md:text-6xl leading-[0.95] text-white drop-shadow-lg">
              Tu indumentaria<br />
              deportiva<br />
              <span className="text-primary">en Vera</span>
            </h1>
            <p className="mt-5 italic text-white/90 max-w-xs text-sm md:text-base leading-relaxed drop-shadow">
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
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-white/40 bg-white/10 backdrop-blur-sm px-5 text-[15px] font-semibold text-white hover:bg-white/20 transition"
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

