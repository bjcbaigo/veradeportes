import { ArrowRight } from "lucide-react";
import nike from "@/assets/brands/nike.png.asset.json";
import adidas from "@/assets/brands/adidas.svg.asset.json";
import puma from "@/assets/brands/puma.png.asset.json";
import topper from "@/assets/brands/topper.svg.asset.json";
import asics from "@/assets/brands/asics-black.png.asset.json";
import nbLogo from "@/assets/brands/nb-logo.png.asset.json";
import onRunning from "@/assets/brands/on-running.png.asset.json";
import fila from "@/assets/brands/fila.png.asset.json";
import skechers from "@/assets/brands/skechers-full.png.asset.json";

const BRANDS = [
  { name: "Nike", src: nike.url },
  { name: "Adidas", src: adidas.url },
  { name: "Puma", src: puma.url },
  { name: "Topper", src: topper.url },
  { name: "Asics", src: asics.url },
  { name: "New Balance", src: nbLogo.url },
  { name: "On Running", src: onRunning.url },
  { name: "Fila", src: fila.url },
  { name: "Skechers", src: skechers.url },
];

export function Brands() {
  return (
    <section id="marcas" className="py-3">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h2 className="font-display text-sm font-black uppercase tracking-normal lg:text-lg">
            Marcas destacadas
          </h2>
          <a
            href="#productos"
            className="inline-flex items-center gap-1 text-xs font-bold text-primary"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex gap-2 pb-2 lg:grid lg:grid-cols-6 lg:gap-4">
            {BRANDS.map((b) => (
              <a
                key={b.name}
                href="#productos"
                className="flex h-12 w-[76px] shrink-0 lg:h-20 lg:w-full items-center justify-center rounded-xl border border-border/80 bg-card p-2 lg:rounded-2xl lg:p-4 shadow-[0_6px_18px_rgba(0,0,0,0.04)] transition hover:border-primary/60"
                aria-label={`Ver productos ${b.name}`}
              >
                <img
                  src={b.src}
                  alt={b.name}
                  loading="lazy"
                  className="max-h-7 max-w-full object-contain lg:max-h-10"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
