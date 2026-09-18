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
    <section id="marcas" className="bg-background py-8 sm:py-12">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
          <h2 className="font-display text-xl font-black uppercase tracking-normal sm:text-2xl">
            Nuestras marcas
          </h2>
          <a
            href="#productos"
            className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-primary sm:text-sm"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="-mx-4 overflow-x-auto px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex gap-2 pb-2 lg:grid lg:grid-cols-9 lg:gap-3">
            {BRANDS.map((b) => (
              <a
                key={b.name}
                href="#productos"
                className="flex h-16 w-[100px] shrink-0 items-center justify-center rounded-md border border-border bg-card p-3 transition hover:border-primary/60 lg:h-20 lg:w-full lg:p-4"
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
