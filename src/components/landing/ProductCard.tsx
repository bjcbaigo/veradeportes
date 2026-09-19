import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  isCustomerRegistered,
  requireCustomerAccess,
  storePendingToggleFavorite,
} from "@/lib/customer-access";
import { FAVORITES_EVENT, isFavorite, toggleFavorite } from "@/lib/favorites";
import type { Product } from "@/lib/products";
import { ProductBadge } from "./ProductBadge";

type Props = {
  product: Product;
  onSelect: (product: Product) => void;
  compact?: boolean;
};

function discountLabel(product: Product) {
  // Los precios vienen formateados ("$89.000"): solo dígitos para comparar
  const current = Number(product.price.replace(/[^\d]/g, ""));
  const old = Number(product.priceOld?.replace(/[^\d]/g, "") ?? 0);
  if (!old || !current || current >= old) return product.badge;
  return `-${Math.round((1 - current / old) * 100)}%`;
}

export function ProductCard({ product, onSelect, compact = false }: Props) {
  const discount = discountLabel(product);
  const imageCount = product.images?.length ?? 0;
  const extraCount = imageCount > 1 ? imageCount - 1 : 0;
  const [favorite, setFavorite] = useState(false);

  useEffect(() => {
    const sync = () => setFavorite(isFavorite(product.id));
    sync();
    window.addEventListener(FAVORITES_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(FAVORITES_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, [product.id]);

  return (
    <article
      className={`group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg focus-within:ring-2 focus-within:ring-primary/40 ${
        compact ? "w-full sm:w-[184px] sm:shrink-0 lg:w-full" : "w-full"
      }`}
      onClick={() => onSelect(product)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(product);
        }
      }}
    >
      <div className="relative bg-secondary p-2">
        <div className="relative aspect-square w-full overflow-hidden rounded-md bg-secondary">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={360}
              height={300}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.035]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Sin imagen
            </div>
          )}
          {extraCount > 0 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-ink-foreground">
              +{extraCount}
            </span>
          )}
        </div>
        {discount && (
          <div className="pointer-events-none absolute left-2 top-2 z-10 flex">
            <ProductBadge label={discount} />
          </div>
        )}
        <button
          type="button"
          aria-label={`${favorite ? "Quitar" : "Guardar"} ${product.name} en favoritos`}
          aria-pressed={favorite}
          title={favorite ? "Quitar de favoritos" : "Guardar en favoritos"}
          onClick={(e) => {
            e.stopPropagation();
            if (!isCustomerRegistered()) {
              storePendingToggleFavorite(product.id);
              requireCustomerAccess(e, "favorito");
              return;
            }
            setFavorite(toggleFavorite(product.id));
          }}
          className={`absolute right-1.5 top-1.5 inline-flex h-10 w-10 items-center justify-center rounded-full bg-background/95 transition ${
            favorite ? "text-primary" : "text-foreground/70 hover:text-primary"
          }`}
        >
          <Heart
            className="h-[18px] w-[18px]"
            strokeWidth={1.8}
            fill={favorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-3 py-3">
        <p className="truncate text-[10px] font-black uppercase tracking-[0.03em] text-foreground">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 min-h-[34px] text-[13px] font-medium leading-tight text-foreground lg:text-sm">
          {product.name}
        </h3>
        <div className="mt-auto flex min-w-0 flex-col items-start gap-0.5 pt-1 sm:flex-row sm:flex-wrap sm:items-baseline sm:gap-x-2">
          <p className="max-w-full whitespace-nowrap text-[14px] font-black tracking-tight text-primary lg:text-base">{product.price}</p>
          {product.priceOld && (
            <p className="max-w-full whitespace-nowrap text-[11px] text-muted-foreground line-through">{product.priceOld}</p>
          )}
        </div>
        {compact && (
          <span className="mt-2 inline-flex h-8 items-center justify-center rounded-md border border-ink/25 text-[11px] font-bold text-foreground sm:hidden">
            Ver producto
          </span>
        )}
      </div>
    </article>
  );
}
