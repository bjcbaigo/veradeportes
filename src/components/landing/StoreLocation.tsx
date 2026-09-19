import { ExternalLink, MapPin, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { SITE } from "@/lib/site";

const BASE_QUERY = "Corrientes+1635,+Vera,+Santa+Fe";
const MIN_Z = 13;
const MAX_Z = 19;

export function StoreLocation() {
  const [z, setZ] = useState(15);
  const src = `https://www.google.com/maps?q=${BASE_QUERY}&z=${z}&output=embed`;

  return (
    <section className="bg-secondary/70 py-3 sm:py-6" aria-labelledby="store-location-title">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 xl:max-w-7xl xl:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-start gap-2 sm:w-72 sm:shrink-0 sm:gap-3">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
               <h2 id="store-location-title" className="text-[10px] font-black uppercase text-foreground sm:text-sm">
                Nos encontramos en
              </h2>
               <p className="mt-0.5 text-[10px] font-semibold text-muted-foreground sm:text-xs">
                Corrientes 1635 · Vera - Santa Fe
              </p>
              <a
                href={SITE.maps}
                target="_blank"
                rel="noopener"
                 className="mt-1 inline-flex h-7 items-center justify-center gap-1.5 text-[10px] font-bold text-foreground transition hover:text-primary sm:mt-1.5 sm:h-8 sm:rounded-lg sm:bg-ink sm:px-3 sm:text-xs sm:text-ink-foreground sm:hover:bg-ink/90"
              >
                Abrir en Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="relative hidden flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-[0_2px_8px_rgba(7,27,59,0.08)] sm:block">
            <iframe
              key={z}
              src={src}
              title="Ubicación de Vera Deportes en Corrientes 1635, Vera, Santa Fe"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
                className="block h-[150px] w-full border-0 sm:h-[170px]"
            />
            <div className="absolute right-2 top-2 flex flex-col gap-1 rounded-lg border border-border bg-card/95 shadow-sm backdrop-blur">
              <button
                type="button"
                onClick={() => setZ((v) => Math.min(MAX_Z, v + 1))}
                disabled={z >= MAX_Z}
                aria-label="Ampliar mapa"
                className="flex h-7 w-7 items-center justify-center text-foreground transition hover:bg-secondary disabled:opacity-40"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
              <span className="border-t border-border" />
              <button
                type="button"
                onClick={() => setZ((v) => Math.max(MIN_Z, v - 1))}
                disabled={z <= MIN_Z}
                aria-label="Reducir mapa"
                className="flex h-7 w-7 items-center justify-center text-foreground transition hover:bg-secondary disabled:opacity-40"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
