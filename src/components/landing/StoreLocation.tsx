import { ExternalLink, MapPin } from "lucide-react";
import { SITE } from "@/lib/site";

const MAP_EMBED_URL =
  "https://www.google.com/maps?q=Corrientes+1635,+Vera,+Santa+Fe&output=embed";

export function StoreLocation() {
  return (
    <section className="bg-secondary/70 py-6 lg:py-8" aria-labelledby="store-location-title">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-4 flex items-start gap-3">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <MapPin className="h-5 w-5" />
          </span>
          <div>
            <h2 id="store-location-title" className="text-lg font-black uppercase text-foreground lg:text-xl">
              Nos encontramos en
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-muted-foreground">
              {SITE.address} · Vera - Santa Fe
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-[14px] border border-border bg-card shadow-[0_3px_12px_rgba(7,27,59,0.08)]">
          <iframe
            src={MAP_EMBED_URL}
            title="Ubicación de Vera Deportes en Corrientes 1635, Vera, Santa Fe"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="block h-[280px] w-full border-0 sm:h-[340px]"
          />
          <div className="flex flex-col gap-3 border-t border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-bold text-foreground">Corrientes 1635 · Vera - Santa Fe</p>
            <a
              href={SITE.maps}
              target="_blank"
              rel="noopener"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink px-4 text-sm font-bold text-ink-foreground transition hover:bg-ink/90"
            >
              Abrir en Google Maps
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}