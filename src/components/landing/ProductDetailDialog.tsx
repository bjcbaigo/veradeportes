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

const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];

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

  useEffect(() => {
    setActive(0);
  }, [product?.id]);

  if (!product) return null;

  const isShoe = product.category === "Zapatillas";
  const mainImage = gallery[active] || product.image;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };
  function handleAddToCart(event: React.MouseEvent<HTMLButtonElement>) {
    if (!isCustomerRegistered()) {
      storePendingAddToCart(product);
      requireCustomerAccess(event, "agregar-carrito", "/carrito");
      return;
    }
    addToCart(product);
    onOpenChange(false);
    window.location.href = "/carrito";
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 bg-card">
          <div className="flex flex-col gap-2 p-3 md:p-4">
            <div
              className="aspect-square bg-[#f3f4f6] rounded-lg flex items-center justify-center overflow-hidden cursor-zoom-in"
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
          <div className="p-5 flex flex-col gap-3">
            <DialogHeader className="text-left space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {product.category}
              </p>
              <DialogTitle className="font-display text-xl leading-tight">
                {product.name}
              </DialogTitle>
              <DialogDescription className="sr-only">
                Detalle del producto {product.name}
              </DialogDescription>
            </DialogHeader>

            <p className="font-display font-extrabold text-2xl text-primary">{product.price}</p>

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
                          className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] px-2 py-0.5 font-medium"
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
            </div>

            {isShoe && (
              <div>
                <p className="text-xs font-semibold mb-1.5">Talles disponibles</p>
                <div className="flex flex-wrap gap-1.5">
                  {SHOE_SIZES.map((s) => {
                    const sizeHref = waLink(
                      `Hola! Quiero consultar disponibilidad del talle ${s} de ${product.name}.`,
                    );

                    return (
                      <a
                        key={s}
                        href={sizeHref}
                        onClick={(e) => requireCustomerAccess(e, "whatsapp", sizeHref)}
                        target="_blank"
                        rel="noopener"
                        className="min-w-10 h-9 px-2 rounded-md border border-border text-sm font-semibold flex items-center justify-center hover:border-primary hover:text-primary transition"
                      >
                        {s}
                      </a>
                    );
                  })}
                </div>
              </div>
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
                className="inline-flex h-11 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground transition hover:bg-primary/90"
              >
                Agregar al carrito
              </button>
              <a
                href={waLink(`Hola! Quiero comprar: ${product.name} (${product.price}).`)}
                onClick={(e) =>
                  requireCustomerAccess(
                    e,
                    "whatsapp",
                    waLink(`Hola! Quiero comprar: ${product.name} (${product.price}).`),
                  )
                }
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground h-11 text-sm font-bold hover:bg-primary/90 transition"
              >
                <MessageCircle className="h-4 w-4" />
                Comprar por WhatsApp
              </a>
              <a
                href={waLink(`Hola! Quiero consultar por: ${product.name}.`)}
                onClick={(e) =>
                  requireCustomerAccess(
                    e,
                    "whatsapp",
                    waLink(`Hola! Quiero consultar por: ${product.name}.`),
                  )
                }
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-primary text-primary h-10 text-sm font-bold hover:bg-primary hover:text-primary-foreground transition"
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
