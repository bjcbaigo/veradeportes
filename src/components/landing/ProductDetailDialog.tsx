import { useEffect, useState } from "react";
import { MessageCircle, Truck, ShieldCheck, RefreshCcw, Target, ListChecks } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import {
  isCustomerRegistered,
  requireCustomerAccess,
  storePendingAddToCart,
} from "@/lib/customer-access";
import { waLink } from "@/lib/site";
import { matchesCategory } from "@/lib/category-filter";

const SHOE_SIZES_DEFAULT = ["38", "39", "40", "41", "42", "43", "44"];

type Props = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductDetailDialog({ product, open, onOpenChange }: Props) {
  const gallery = (
    product?.images && product.images.length > 0
      ? product.images
      : product?.image
        ? [product.image]
        : []
  ).filter(Boolean);
  const [active, setActive] = useState(0);
  const [hovering, setHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const [selectedSize, setSelectedSize] = useState("");
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    setActive(0);
    setSelectedSize("");
    setActionError("");
  }, [product?.id]);

  if (!product) return null;

  const isShoe = matchesCategory(product.category, product.name, product.badge, "Zapatillas");
  const shoeSizes = product.sizes && product.sizes.length > 0 ? product.sizes : SHOE_SIZES_DEFAULT;
  const mainImage = gallery[active] || product.image;
  const selectedVariantText = selectedSize ? `Talle ${selectedSize}` : "";
  const purchaseHref = waLink(
    `Hola! Quiero comprar: ${product.name}${selectedVariantText ? ` - ${selectedVariantText}` : ""} (${product.price}).`,
  );
  const consultHref = waLink(
    `Hola! Quiero consultar por: ${product.name}${selectedVariantText ? ` - ${selectedVariantText}` : ""}.`,
  );

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };
  function ensureRequiredSelection() {
    if (isShoe && !selectedSize) {
      setActionError("Elegí un talle para continuar.");
      return false;
    }
    setActionError("");
    return true;
  }

  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    if (!product) return;
    if (!ensureRequiredSelection()) return;
    if (!isCustomerRegistered()) {
      storePendingAddToCart(product, { size: selectedSize || undefined });
      requireCustomerAccess(event, "agregar-carrito", "/carrito");
      return;
    }
    addToCart(product, { size: selectedSize || undefined });
    onOpenChange(false);
    window.location.href = "/carrito";
  }
  function handleCustomerLink(event: React.MouseEvent<HTMLAnchorElement>, href: string) {
    if (!ensureRequiredSelection()) {
      event.preventDefault();
      return;
    }
    requireCustomerAccess(event, "whatsapp", href);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0 max-h-[90vh] overflow-y-auto rounded-[18px]">
        <div className="grid bg-white md:grid-cols-2">
          <div className="flex flex-col gap-2 p-3 md:p-4">
            <div
              className="aspect-square cursor-zoom-in overflow-hidden rounded-[14px] bg-secondary flex items-center justify-center"
              onMouseEnter={() => setHovering(true)}
              onMouseLeave={() => setHovering(false)}
              onMouseMove={handleMouseMove}
            >
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full w-full object-contain transition-transform duration-300 ease-out will-change-transform"
                  style={{
                    transform: hovering ? "scale(1.7)" : "scale(1)",
                    transformOrigin: `${origin.x}% ${origin.y}%`,
                  }}
                />
              ) : (
                <div className="text-xs text-muted-foreground">Sin imagen</div>
              )}
            </div>

            {gallery.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    className={`h-14 w-14 shrink-0 rounded-md overflow-hidden bg-[#f3f4f6] border-2 transition ${
                      i === active ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                    aria-label={`Ver foto ${i + 1}`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-3 p-5">
            <DialogHeader className="text-left space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {product.category}
              </p>
              <DialogTitle className="text-xl font-black leading-tight text-foreground">
                {product.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalle del producto {product.name}
              </DialogDescription>
            </DialogHeader>

            <p className="text-2xl font-black text-primary">{product.price}</p>

            <p className="text-sm text-muted-foreground leading-relaxed">
              {product.description ||
                (isShoe
                  ? "Zapatilla cómoda y resistente, ideal para uso diario, training y running. Consultá disponibilidad de talles por WhatsApp."
                  : "Producto deportivo de calidad. Consultá disponibilidad, talles y colores por WhatsApp.")}
            </p>

            <div className="grid gap-2">
              {product.idealFor && (
                <div className="rounded-lg border border-border/60 p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <Target className="h-3.5 w-3.5 text-primary shrink-0" />
                    Ideal para
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.idealFor.split(/,| y /).map((item, i) => {
                      const clean = item.trim().replace(/\.$/, "");
                      if (!clean) return null;
                      return (
                        <span
                          key={i}
                          className="inline-flex items-center rounded-full bg-secondary text-foreground text-[10px] px-2 py-0.5 font-medium"
                        >
                          {clean}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {product.features && (
                <div className="rounded-lg border border-border/60 p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <ListChecks className="h-3.5 w-3.5 text-primary shrink-0" />
                    Características clave
                  </p>
                  <div className="flex flex-col gap-1">
                    {product.features.split(",").map((item, i) => {
                      const clean = item
                        .trim()
                        .replace(/^( y )/, "")
                        .replace(/\.$/, "");
                      if (!clean) return null;
                      return (
                        <span
                          key={i}
                          className="text-xs text-muted-foreground flex items-start gap-1.5"
                        >
                          <span className="text-primary mt-0.5 shrink-0">•</span>
                          {clean}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
              {product.seals && product.seals.length > 0 && (
                <div className="rounded-lg border border-border/60 p-2.5 space-y-1.5">
                  <p className="text-xs font-semibold flex items-center gap-1.5 text-foreground">
                    <ListChecks className="h-3.5 w-3.5 text-primary shrink-0" />
                    Sellos
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {product.seals.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 text-primary text-[10px] px-2 py-0.5 font-semibold"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>


            {isShoe && (
              <div>
                <div className="mb-1.5 flex items-center justify-between gap-2">
                  <p className="text-xs font-semibold">Talles disponibles</p>
                  {selectedSize && (
                    <span className="text-[11px] font-bold text-primary">
                      Elegido: {selectedSize}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Elegir talle">
                  {shoeSizes.map((s) => {
                    const isSelected = selectedSize === s;
                    return (
                      <button
                        key={s}
                        type="button"
                        role="radio"
                        aria-checked={isSelected}
                        onClick={() => {
                          setSelectedSize(s);
                          setActionError("");
                        }}
                        className={`min-w-10 h-9 px-2 rounded-xl border text-sm font-semibold flex items-center justify-center transition ${
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-border bg-white text-foreground hover:border-ink hover:bg-ink hover:text-white"
                        }`}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {actionError && (
              <p className="rounded-lg bg-primary/10 px-3 py-2 text-xs font-bold text-primary">
                {actionError}
              </p>
            )}

            <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground mt-1">
              <div className="flex flex-col items-center text-center gap-1">
                <Truck className="h-4 w-4 text-primary" />
                Envíos a domicilio
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <ShieldCheck className="h-4 w-4 text-primary" />
                Producto original
              </div>
              <div className="flex flex-col items-center text-center gap-1">
                <RefreshCcw className="h-4 w-4 text-primary" />
                Cambio de talle
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-1">
              <button
                type="button"
                onClick={handleAddToCart}
                className="inline-flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-black text-primary-foreground transition hover:bg-primary/90"
              >
                Agregar al carrito
              </button>
              <a
                href={purchaseHref}
                onClick={(e) => handleCustomerLink(e, purchaseHref)}
                target="_blank"
                rel="noopener"
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink text-sm font-bold text-ink-foreground transition hover:bg-ink/90"
              >
                <MessageCircle className="h-4 w-4" />
                Comprar por WhatsApp
              </a>
              <a
                href={consultHref}
                onClick={(e) => handleCustomerLink(e, consultHref)}
                target="_blank"
                rel="noopener"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
              >
                Consultar talle / stock
              </a>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
