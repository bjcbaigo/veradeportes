import { useEffect, useState } from "react";
import { Heart } from "lucide-react";
import {
  isCustomerRegistered,
  requireCustomerAccess,
  storePendingToggleFavorite,
} from "@/lib/customer-access";
import { FAVORITES_EVENT, isFavorite, toggleFavorite } from "@/lib/favorites";
import type { Product } from "@/lib/products";

type Props = {
  product: Product;
  onSelect: (product: Product) => void;
  compact?: boolean;
};

function discountLabel(product: Product) {
  const current = Number(product.price.replace(/[^\d.-]/g, ""));
  const old = Number(product.priceOld?.replace(/[^\d.-]/g, "") ?? 0);
  if (!old || !current || current >= old) return product.badge;
  return `-${Math.round((1 - current / old) * 100)}%`;
}

export function ProductCard({ product, onSelect, compact = false }: Props) {
  const discount = discountLabel(product);
  const extraCount = (product.images?.length ?? 0) > 1 ? product.images!.length - 1 : 0;
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
      className={`group relative flex shrink-0 flex-col overflow-hidden rounded-[12px] bg-card text-left shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition hover:shadow-[0_4px_16px_rgba(7,27,59,0.10)] ${
        compact ? "w-[150px] sm:w-[180px] lg:w-full" : ""
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
      <div className="relative bg-card p-1.5">
        <div className="relative aspect-square w-full overflow-hidden rounded-[10px] bg-secondary">
          {product.image ? (
            <img
              src={product.image}
              alt={product.name}
              loading="lazy"
              width={360}
              height={360}
              className="h-full w-full object-contain transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
              Sin imagen
            </div>
          )}
          {extraCount > 0 && (
            <span className="absolute bottom-2 right-2 rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-bold text-ink-foreground">
              +{extraCount}
            </span>
          )}
        </div>
        {discount && (
          <span className="absolute left-2.5 top-2.5 rounded-[8px] bg-primary px-2 py-0.5 text-[10px] font-bold uppercase text-primary-foreground">
            {discount}
          </span>
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
          className={`absolute right-2.5 top-2.5 inline-flex h-8 w-8 items-center justify-center rounded-full bg-background/90 transition ${
            favorite ? "text-primary" : "text-foreground/60 hover:text-primary"
          }`}
        >
          <Heart className="h-[18px] w-[18px]" fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-3 pb-3 pt-1">
        <h3 className="line-clamp-2 min-h-[34px] font-sans text-[13px] font-medium leading-tight text-foreground lg:text-sm">
          {product.name}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2">
          <p className="font-display text-[16px] font-bold text-primary lg:text-[18px]">
            {product.price}
          </p>
          {product.priceOld && (
            <p className="text-[11px] text-muted-foreground line-through">{product.priceOld}</p>
          )}
        </div>
      </div>

    </article>
  );
}
