import { Heart } from "lucide-react";
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

  return (
    <article
      className={`group relative flex shrink-0 flex-col overflow-hidden rounded-2xl border border-border bg-background text-left shadow-[0_1px_8px_rgba(0,0,0,0.05)] transition hover:border-primary/50 hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] ${
        compact ? "w-[154px] sm:w-[180px]" : ""
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
      <div className="relative aspect-square bg-secondary p-2">
        <div className="relative h-full w-full overflow-hidden rounded-xl bg-white ring-1 ring-black/5">
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
            <span className="absolute bottom-2 right-2 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold text-white">
              +{extraCount}
            </span>
          )}
        </div>
        {discount && (
          <span className="absolute left-2 top-2 rounded-full bg-primary px-2 py-0.5 text-[10px] font-extrabold uppercase text-primary-foreground">
            {discount}
          </span>
        )}
        <button
          type="button"
          aria-label={`Guardar ${product.name} en favoritos`}
          onClick={(e) => e.stopPropagation()}
          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm ring-1 ring-black/5 hover:text-primary"
        >
          <Heart className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-1 flex-col gap-1 px-3 py-3">
        <h3 className="line-clamp-2 min-h-[36px] font-display text-[13px] font-extrabold leading-tight sm:text-sm">
          {product.name}
        </h3>
        <p className="truncate text-[11px] text-muted-foreground">
          {product.brand} · {product.category}
        </p>
        <div className="mt-auto flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <p className="font-display text-[15px] font-extrabold text-primary">{product.price}</p>
          {product.priceOld && (
            <p className="text-[11px] text-muted-foreground line-through">{product.priceOld}</p>
          )}
        </div>
      </div>
    </article>
  );
}
