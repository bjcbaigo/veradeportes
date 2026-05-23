import { Instagram } from "lucide-react";
import ig1 from "@/assets/ig-1.jpg";
import ig2 from "@/assets/ig-2.jpg";
import ig3 from "@/assets/ig-3.jpg";
import ig4 from "@/assets/ig-4.jpg";
import { SITE } from "@/lib/site";

const IMGS = [ig1, ig2, ig3, ig4, ig1, ig2];

export function Social() {
  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-primary">
              Novedades
            </p>
            <h2 className="font-display font-bold text-2xl md:text-3xl mt-1">
              Seguinos en Instagram
            </h2>
          </div>
          <a
            href={SITE.instagram}
            target="_blank"
            rel="noopener"
            className="hidden sm:inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary transition"
          >
            <Instagram className="h-4 w-4" />
            @veradeportes
          </a>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-6 gap-2 md:gap-3">
          {IMGS.map((src, i) => (
            <a
              key={i}
              href={SITE.instagram}
              target="_blank"
              rel="noopener"
              className="relative aspect-square overflow-hidden rounded-xl group"
            >
              <img
                src={src}
                alt={`Instagram ${i + 1}`}
                loading="lazy"
                width={512}
                height={512}
                className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/40 transition flex items-center justify-center">
                <Instagram className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition" />
              </div>
            </a>
          ))}
        </div>

        <a
          href={SITE.instagram}
          target="_blank"
          rel="noopener"
          className="mt-5 sm:hidden inline-flex w-full items-center justify-center gap-2 rounded-full border border-border px-4 py-3 text-sm font-semibold"
        >
          <Instagram className="h-4 w-4" />
          @veradeportes
        </a>
      </div>
    </section>
  );
}
