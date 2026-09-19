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
    <section id="marcas" className="bg-background py-4 sm:py-12">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 xl:max-w-7xl xl:px-6">
        <div className="mb-3 flex items-center justify-between lg:mb-4">
           <h2 className="font-display text-base font-black tracking-normal sm:text-2xl sm:uppercase">
            Nuestras marcas
          </h2>
          <a
            href="#productos"
            className="inline-flex min-h-10 items-center gap-1 text-xs font-bold text-primary sm:text-sm"
          >
            Ver todas <ArrowRight className="h-3.5 w-3.5" />
          </a>
        </div>
        <div className="-mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4 lg:mx-0 lg:overflow-visible lg:px-0">
          <div className="flex gap-1.5 pb-1 sm:gap-2 sm:pb-2 lg:grid lg:grid-cols-9 lg:gap-3">
            {BRANDS.map((b) => (
              <a
                key={b.name}
                href="#productos"
                className="flex h-12 w-[70px] shrink-0 items-center justify-center rounded-md border border-border bg-card p-2 transition hover:border-primary/60 sm:h-16 sm:w-[100px] sm:p-3 lg:h-20 lg:w-full lg:p-4"
                aria-label={`Ver productos ${b.name}`}
              >
                <img
                  src={b.src}
                  alt={b.name}
                  loading="lazy"
                  className="max-h-5 max-w-full object-contain sm:max-h-7 lg:max-h-10"
                />
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
