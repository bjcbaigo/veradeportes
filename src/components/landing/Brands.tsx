import nike from "@/assets/brands/nike.png.asset.json";
import adidas from "@/assets/brands/adidas.svg.asset.json";
import puma from "@/assets/brands/puma.png.asset.json";
import topper from "@/assets/brands/topper.svg.asset.json";
import asics from "@/assets/brands/asics.png.asset.json";
import skechers from "@/assets/brands/skechers.png.asset.json";

const BRANDS = [
  { name: "Nike", src: nike.url },
  { name: "Adidas", src: adidas.url },
  { name: "Puma", src: puma.url },
  { name: "Topper", src: topper.url },
  { name: "Asics", src: asics.url },
  { name: "Skechers", src: skechers.url },
];

export function Brands() {
  return (
    <section className="py-6 border-y border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground text-center mb-4">
          Trabajamos con las mejores marcas
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          {BRANDS.map((b) => (
            <div
              key={b.name}
              className="flex items-center justify-center h-14 w-20 sm:h-16 sm:w-24 rounded-xl bg-white border border-border p-2"
            >
              <img
                src={b.src}
                alt={b.name}
                loading="lazy"
                className="max-h-full max-w-full object-contain"
              />
            </div>
          ))}
          <div className="flex items-center justify-center h-14 w-20 sm:h-16 sm:w-24 rounded-xl bg-white border border-border px-2">
            <span className="font-display font-extrabold text-[11px] sm:text-xs tracking-tight text-black text-center leading-tight">
              New<br />Balance
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
