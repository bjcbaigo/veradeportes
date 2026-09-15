import { ExternalLink, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";

const MAP_EMBED_URL =
  "https://www.google.com/maps?q=Corrientes+1635,+Vera,+Santa+Fe&output=embed";

export function StoreLocation() {
  return (
    <section className="bg-secondary/70 py-4" aria-labelledby="store-location-title">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="flex items-start gap-2.5 sm:w-64 sm:shrink-0">
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <MapPin className="h-4 w-4" />
            </span>
            <div>
              <h2 id="store-location-title" className="text-sm font-black uppercase text-foreground">
                Nos encontramos en
              </h2>
              <p className="mt-0.5 text-xs font-semibold text-muted-foreground">
                Corrientes 1635 · Vera - Santa Fe
              </p>
              <a
                href={SITE.maps}
                target="_blank"
                rel="noopener"
                className="mt-1.5 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg bg-ink px-3 text-xs font-bold text-ink-foreground transition hover:bg-ink/90"
              >
                Abrir en Google Maps
                <ExternalLink className="h-3 w-3" />
              </a>
            </div>
          </div>
          <div className="flex-1 overflow-hidden rounded-lg border border-border bg-card shadow-[0_2px_8px_rgba(7,27,59,0.08)]">
            <iframe
              src={MAP_EMBED_URL}
              title="Ubicación de Vera Deportes en Corrientes 1635, Vera, Santa Fe"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="block h-[140px] w-full border-0 sm:h-[160px]"
            />
          </div>
        </div>
      </div>
    </section>
  );
}