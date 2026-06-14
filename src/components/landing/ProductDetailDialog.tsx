import { MessageCircle, Star, Truck, ShieldCheck, RefreshCcw } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import type { Product } from "@/lib/products";
import { waLink } from "@/lib/site";

const SHOE_SIZES = ["38", "39", "40", "41", "42", "43", "44"];

type Props = {
  product: Product | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ProductDetailDialog({ product, open, onOpenChange }: Props) {
  if (!product) return null;

  const isShoe = product.category === "Zapatillas";
  const rating = (4 + ((parseInt(product.id) * 7) % 9) / 10).toFixed(1);
  const reviews = 12 + parseInt(product.id) * 4;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="grid md:grid-cols-2 bg-card">
          <div className="aspect-square bg-[#f3f4f6] p-6 flex items-center justify-center">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-contain"
            />
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

            <div className="flex items-center gap-1 text-primary text-sm font-semibold">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="h-4 w-4 fill-primary" />
              ))}
              <span className="text-muted-foreground ml-1 text-xs">
                {rating} ({reviews} reseñas)
              </span>
            </div>

            <p className="font-display font-extrabold text-2xl text-primary">
              {product.price}
            </p>

            <p className="text-sm text-muted-foreground">
              {product.description || (isShoe
                ? "Zapatilla cómoda y resistente, ideal para uso diario, training y running. Consultá disponibilidad de talles por WhatsApp."
                : "Producto deportivo de calidad. Consultá disponibilidad, talles y colores por WhatsApp.")}
            </p>

            {isShoe && (
              <div>
                <p className="text-xs font-semibold mb-1.5">Talles disponibles</p>
                <div className="flex flex-wrap gap-1.5">
                  {SHOE_SIZES.map((s) => (
                    <a
                      key={s}
                      href={waLink(
                        `Hola! Quiero consultar disponibilidad del talle ${s} de ${product.name}.`,
                      )}
                      target="_blank"
                      rel="noopener"
                      className="min-w-10 h-9 px-2 rounded-md border border-border text-sm font-semibold flex items-center justify-center hover:border-primary hover:text-primary transition"
                    >
                      {s}
                    </a>
                  ))}
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
              <a
                href={waLink(`Hola! Quiero comprar: ${product.name} (${product.price}).`)}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary text-primary-foreground h-11 text-sm font-bold hover:bg-primary/90 transition"
              >
                <MessageCircle className="h-4 w-4" />
                Comprar por WhatsApp
              </a>
              <a
                href={waLink(`Hola! Quiero consultar por: ${product.name}.`)}
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
