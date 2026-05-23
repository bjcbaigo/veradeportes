import zap from "@/assets/p-zapatillas-2.jpg";
import rem from "@/assets/p-remera-1.jpg";
import sho from "@/assets/p-short-1.jpg";
import { waLink } from "@/lib/site";

const PROMOS = [
  { img: zap, off: "-20%" },
  { img: rem, off: "-15%" },
  { img: sho, off: "-20%" },
];

export function Promo() {
  return (
    <section id="ofertas" className="py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-primary text-primary-foreground p-4 md:p-6">
          {/* diagonal pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, transparent 0 14px, rgba(255,255,255,.4) 14px 16px)",
            }}
          />
          <div className="relative flex flex-col md:flex-row md:items-center gap-4">
            <div className="md:w-1/3">
              <h2 className="font-display font-extrabold text-2xl md:text-3xl leading-tight">
                PROMOS<br />DE LA SEMANA
              </h2>
              <p className="mt-1 text-sm text-white/90">
                Descuentos imperdibles en seleccionados
              </p>
            </div>

            <div className="flex items-center gap-3 md:flex-1 justify-center">
              {PROMOS.map((p, i) => (
                <div key={i} className="relative">
                  <div className="h-16 w-16 md:h-20 md:w-20 rounded-full bg-white p-1.5 shadow-md">
                    <img
                      src={p.img}
                      alt="Promo"
                      loading="lazy"
                      width={160}
                      height={160}
                      className="h-full w-full object-contain rounded-full"
                    />
                  </div>
                  <span className="absolute -top-1 -right-1 rounded-full bg-ink text-ink-foreground text-[10px] font-bold px-2 py-0.5">
                    {p.off}
                  </span>
                </div>
              ))}
            </div>

            <a
              href={waLink("Hola! Quiero ver las promos de la semana.")}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center justify-center rounded-xl bg-ink px-5 text-sm font-bold text-ink-foreground hover:bg-black transition self-stretch md:self-auto"
            >
              Ver ofertas
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
