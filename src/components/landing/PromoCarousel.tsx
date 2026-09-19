import { ArrowRight } from "lucide-react";
import { useMemo, useState } from "react";
import { ProductDetailDialog } from "@/components/landing/ProductDetailDialog";
import { isNewProduct, isOfferProduct, useProductsData } from "@/lib/product-data";
import { emitCategory } from "@/lib/category-filter";
import { getActivePromotions } from "@/lib/promotions";
import type { Product } from "@/lib/products";
import nike from "@/assets/brands/nike.png.asset.json";
import adidas from "@/assets/brands/adidas.svg.asset.json";
import puma from "@/assets/brands/puma.png.asset.json";
import topper from "@/assets/brands/topper.svg.asset.json";
import asics from "@/assets/brands/asics-black.png.asset.json";
import nbLogo from "@/assets/brands/nb-logo.png.asset.json";
import onRunning from "@/assets/brands/on-running.png.asset.json";
import fila from "@/assets/brands/fila.png.asset.json";
import skechers from "@/assets/brands/skechers-full.png.asset.json";
import asicsGelExcite10 from "@/assets/asics-gel-excite10-oferta.png.asset.json";

const BRAND_LOGOS: [string, string][] = [
  ["nike", nike.url],
  ["adidas", adidas.url],
  ["puma", puma.url],
  ["topper", topper.url],
  ["asics", asics.url],
  ["new balance", nbLogo.url],
  ["on running", onRunning.url],
  ["on", onRunning.url],
  ["fila", fila.url],
  ["skechers", skechers.url],
];

function brandLogo(brand: string) {
  const b = (brand || "").toLowerCase();
  return BRAND_LOGOS.find(([key]) => b.includes(key))?.[1];
}

function priceNumber(raw?: string) {
  return Number((raw || "").replace(/[^\d]/g, "")) || 0;
}

function discountPct(p: Product) {
  const now = priceNumber(p.price);
  const before = priceNumber(p.priceOld);
  if (!now || !before || before <= now) return 0;
  return Math.round(((before - now) / before) * 100);
}

export function PromoCarousel() {
  const promotions = getActivePromotions();
  const { products } = useProductsData();
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);

  const editorial = promotions.find((p) => p.id === "nueva-coleccion") ?? promotions[0];
  const fallback = promotions.find((p) => p.id !== editorial?.id);

  const newProducts = useMemo(
    () => products.filter((p) => isNewProduct(p) && p.image),
    [products],
  );
  const newHero = newProducts[0] ?? null;

  const offerProduct = useMemo(() => {
    const offers = products.filter((p) => isOfferProduct(p) && p.image);
    return offers.sort((a, b) => discountPct(b) - discountPct(a))[0] ?? null;
  }, [products]);
  const offerImage = offerProduct?.name.toLowerCase().includes("gel-excite 10")
    ? asicsGelExcite10.url
    : offerProduct?.image;

  return (
    <section id="promos" className="bg-background py-2 sm:py-8">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 xl:max-w-7xl xl:px-6">
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          {/* Tarjeta editorial: nuevos ingresos reales del panel */}
          {editorial && (
            <button
              type="button"
              onClick={() => emitCategory(newProducts.length > 0 ? "Nuevos" : "Todos")}
              className="group relative aspect-[8/7] min-w-0 overflow-hidden rounded-lg bg-ink text-left shadow-md sm:aspect-[16/8]"
            >
              <img
                src={newHero?.image || editorial.image}
                alt=""
                width={800}
                height={700}
                loading="eager"
                className={
                  newHero?.image
                    ? "absolute inset-0 h-full w-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                    : "absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                }
              />
              <span className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
              <span className="absolute right-2 top-2 rounded-full bg-background px-2 py-1 text-[8px] font-black uppercase tracking-wide text-foreground sm:right-3 sm:top-3 sm:px-3 sm:py-1.5 sm:text-[11px]">
                Nuevos ingresos
              </span>
              <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 p-2.5 sm:gap-1.5 sm:p-5">
                <span className="font-display text-sm font-black uppercase leading-none text-ink-foreground sm:text-3xl">
                  {newHero ? newHero.brand : editorial.title}
                </span>
                <span className="line-clamp-1 text-[9px] font-semibold text-ink-foreground/85 sm:text-sm">
                  {newHero ? newHero.name : editorial.subtitle}
                </span>
                <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-1 text-[9px] font-black text-foreground transition group-hover:bg-primary group-hover:text-primary-foreground sm:mt-2 sm:px-4 sm:py-1.5 sm:text-xs">
                  {newHero ? "Ver lo nuevo" : editorial.ctaText} <ArrowRight className="h-3 w-3" />
                </span>
              </span>
            </button>
          )}

          {/* Tarjeta producto en oferta con precio real */}
          {offerProduct ? (
            <button
              type="button"
              onClick={() => {
                setSelected(offerProduct);
                setOpen(true);
              }}
              className="group relative aspect-[8/7] min-w-0 overflow-hidden rounded-lg bg-secondary text-left shadow-md ring-1 ring-border sm:aspect-[16/8]"
            >
              <span className="absolute left-2 top-2 z-20 flex h-4 items-center sm:left-3 sm:top-3 sm:h-7">
                {brandLogo(offerProduct.brand) ? (
                  <img
                    src={brandLogo(offerProduct.brand)}
                    alt={offerProduct.brand}
                    className="max-h-4 max-w-[52px] object-contain sm:max-h-7 sm:max-w-[110px]"
                  />
                ) : (
                  <span className="text-[9px] font-black uppercase text-foreground sm:text-sm">
                    {offerProduct.brand}
                  </span>
                )}
              </span>
              {discountPct(offerProduct) > 0 && (
                <span className="absolute right-2 top-2 z-10 rounded-full bg-primary px-1.5 py-0.5 text-[9px] font-black text-primary-foreground sm:right-3 sm:top-3 sm:px-2.5 sm:py-1 sm:text-xs">
                  -{discountPct(offerProduct)}%
                </span>
              )}
              <span className="absolute inset-x-0 top-5 bottom-[44%] overflow-hidden sm:inset-y-0 sm:left-auto sm:right-0 sm:top-0 sm:w-[51%]">
                <img
                  src={offerImage}
                  alt={offerProduct.name}
                  width={600}
                  height={600}
                  loading="lazy"
                  className="absolute left-1/2 top-1/2 h-auto w-full max-w-none -translate-x-1/2 -translate-y-1/2 scale-110 object-contain transition-transform duration-500 group-hover:scale-[1.16] sm:scale-105 sm:group-hover:scale-110"
                />
              </span>
              <span className="absolute inset-x-0 bottom-0 z-10 flex h-[44%] flex-col items-start justify-end gap-0 bg-secondary p-2.5 sm:inset-y-0 sm:left-0 sm:right-auto sm:h-auto sm:w-[52%] sm:justify-center sm:gap-1 sm:p-5">
                <span className="line-clamp-2 text-[10px] font-black uppercase leading-tight text-foreground sm:text-xl">
                  {offerProduct.name.toLowerCase().startsWith(offerProduct.brand.toLowerCase())
                    ? offerProduct.name.slice(offerProduct.brand.length).trim()
                    : offerProduct.name}
                </span>
                {offerProduct.priceOld && (
                  <span className="text-[8px] font-semibold text-muted-foreground sm:text-xs">
                    Antes <span className="line-through">{offerProduct.priceOld}</span>
                  </span>
                )}
                <span className="text-[10px] font-black text-foreground sm:text-lg">
                  Ahora <span className="text-primary">{offerProduct.price}</span>
                </span>
                <span className="mt-0.5 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black text-primary-foreground transition group-hover:brightness-110 sm:mt-1.5 sm:px-4 sm:py-1.5 sm:text-xs">
                  Ver producto <ArrowRight className="h-3 w-3" />
                </span>
              </span>
            </button>
          ) : (
            fallback && (
              <a
                href={fallback.href}
                className="group relative aspect-[8/7] min-w-0 overflow-hidden rounded-lg bg-ink shadow-md sm:aspect-[16/8]"
              >
                <img
                  src={fallback.image}
                  alt=""
                  width={800}
                  height={700}
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink/95 via-ink/30 to-transparent" />
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-start gap-0.5 p-2.5 sm:gap-1.5 sm:p-5">
                  <span className="font-display text-sm font-black uppercase leading-none text-ink-foreground sm:text-3xl">
                    {fallback.title}
                  </span>
                  <span className="text-[9px] font-semibold text-ink-foreground/85 sm:text-sm">
                    {fallback.subtitle}
                  </span>
                  <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[9px] font-black text-primary-foreground sm:mt-2 sm:px-4 sm:py-1.5 sm:text-xs">
                    {fallback.ctaText} <ArrowRight className="h-3 w-3" />
                  </span>
                </span>
              </a>
            )
          )}
        </div>
      </div>
      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
