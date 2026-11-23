import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { isNewProduct, isOfferProduct, useProductsData } from "@/lib/product-data";
import { productPath } from "@/lib/product-url";
import type { Product } from "@/lib/products";

type Item = { product: Product; label: string };

function pickItems(products: Product[]): Item[] {
  const seen = new Set<string>();
  const out: Item[] = [];
  const add = (list: Product[], label: string, max: number) => {
    let n = 0;
    for (const p of list) {
      if (out.length >= 5 || n >= max) break;
      if (!p.image || seen.has(p.id)) continue;
      seen.add(p.id);
      out.push({ product: p, label });
      n++;
    }
  };
  add(products.filter(isNewProduct), "Nuevo ingreso", 2);
  add(products.filter(isOfferProduct), "Oferta", 2);
  add(products.filter((p) => p.badge === "Destacado"), "Destacado", 5);
  add(products, "Novedad", 5);
  return out;
}

/** Carrusel de 5 novedades (nuevos, ofertas, destacados) que flota sobre la portada. */
export function NewsCarousel() {
  const { products } = useProductsData();
  const items = useMemo(() => pickItems(products), [products]);
  const [paused, setPaused] = useState(false);
  if (items.length === 0) return null;
  const loops = items.length >= 4;
  const track = loops ? [...items, ...items] : items;

  return (
    <div
      role="region"
      aria-label="Novedades de Vera Deportes"
      aria-roledescription="carrusel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="w-full overflow-hidden rounded-2xl border border-ink-foreground/15 bg-ink/45 p-2 backdrop-blur-md"
    >
      <p className="mb-1.5 px-1 text-[10px] font-black uppercase tracking-wider text-primary sm:text-xs">
        Novedades · Ingresos · Ofertas
      </p>
      <div className="overflow-hidden rounded-xl">
        <div
          className={`flex w-max ${loops ? "motion-safe:animate-[news-marquee_30s_linear_infinite]" : ""}`}
          style={{ animationPlayState: paused ? "paused" : "running" }}
        >
          {track.map(({ product, label }, i) => (
            <Link
              key={`${product.id}-${i}`}
              to={productPath(product) as "/"}
              aria-hidden={i >= items.length ? true : undefined}
              tabIndex={i >= items.length ? -1 : undefined}
              className="relative mr-2 block aspect-[4/5] w-28 shrink-0 overflow-hidden rounded-xl bg-[#e5e7eb] sm:w-32 lg:w-36"
            >
              <img src={product.image} alt={product.name} loading="lazy" className="h-full w-full object-contain p-2" />
              <span className="absolute left-1.5 top-1.5 rounded-full bg-primary px-2 py-0.5 text-[9px] font-black uppercase text-primary-foreground">
                {label}
              </span>
              <span className="absolute inset-x-0 bottom-0 bg-ink/85 px-2 py-1 text-[10px] font-bold leading-tight text-ink-foreground">
                <span className="line-clamp-1">{product.name}</span>
                <span className="text-primary">{product.price}</span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
