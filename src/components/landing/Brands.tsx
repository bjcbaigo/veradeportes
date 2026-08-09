import { ArrowRight } from "lucide-react";
import nike from "@/assets/brands/nike.png.asset.json";
import adidas from "@/assets/brands/adidas.svg.asset.json";
import puma from "@/assets/brands/puma.png.asset.json";
import topper from "@/assets/brands/topper.svg.asset.json";
import asics from "@/assets/brands/asics-black.png.asset.json";
import nbLogo from "@/assets/brands/nb-logo.png.asset.json";

const BRANDS = [
  { name: "Nike", src: nike.url },
  { name: "Adidas", src: adidas.url },
  { name: "Puma", src: puma.url },
  { name: "Topper", src: topper.url },
  { name: "Asics", src: asics.url },
  { name: "New Balance", src: nbLogo.url },
];

export function Brands() {
  return (
    <section id="marcas" className="py-3">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-black uppercase tracking-normal">
            Marcas destacadas
          </h2>
          <a
            href="#productos"
            className="inline-flex items-center gap-1 text-sm font-bold text-primary"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </a>
        </div>
        <div className="-mx-4 overflow-x-auto px-4">
          <div className="flex gap-3 pb-2">
            {BRANDS.map((b) => (
              <a
                key={b.name}
                href="#productos"
                className="flex h-14 w-[96px] shrink-0 items-center justify-center rounded-2xl border border-border/80 bg-white p-3 shadow-[0_6px_18px_rgba(0,0,0,0.04)] transition hover:border-primary/60"
                aria-label={`Ver productos ${b.name}`}
              >
                <img
                  src={b.src}
                  alt={b.name}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
