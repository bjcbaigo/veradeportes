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
      className={`group relative flex shrink-0 flex-col overflow-hidden rounded-[13px] bg-white text-left transition hover:-translate-y-0.5 hover:shadow-[0_8px_18px_rgba(7,27,59,0.08)] focus-within:ring-2 focus-within:ring-primary/40 ${
        compact ? "w-[154px] sm:w-[184px] lg:w-full" : ""
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
      <div className="relative rounded-[13px] bg-secondary p-2.5">
        <div className="relative aspect-[1/0.82] w-full overflow-hidden rounded-[12px] bg-secondary">
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
            <span className="absolute bottom-2 right-2 rounded-full bg-ink/80 px-2 py-0.5 text-[10px] font-bold text-white">
              +{extraCount}
            </span>
          )}
        </div>
        {discount && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-black uppercase text-primary-foreground">
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
          className={`absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 transition ${
            favorite ? "text-primary" : "text-foreground/70 hover:text-primary"
          }`}
        >
          <Heart className="h-4 w-4" strokeWidth={1.8} fill={favorite ? "currentColor" : "none"} />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-0.5 px-1.5 py-2.5">
        <p className="truncate text-[10px] font-black uppercase tracking-[0.03em] text-foreground">
          {product.brand}
        </p>
        <h3 className="line-clamp-2 min-h-[34px] text-[12px] font-medium leading-snug text-foreground sm:text-[13px] lg:text-sm">
          {product.name}
        </h3>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5 pt-1">
          <p className="text-[14px] font-black text-primary lg:text-base">{product.price}</p>
          {product.priceOld && (
            <p className="text-[10px] text-muted-foreground line-through">{product.priceOld}</p>
          )}
        </div>
      </div>
    </article>
  );
}
