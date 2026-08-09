import { createFileRoute } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { BottomNav } from "@/components/landing/BottomNav";
import { Header } from "@/components/landing/Header";
import { clearCart, formatPrice, removeFromCart, updateCartQty, useCart } from "@/lib/cart";
import { requireCustomerAccess } from "@/lib/customer-access";
import { waLink } from "@/lib/site";

export const Route = createFileRoute("/carrito")({
  head: () => ({
    meta: [
      { title: "Carrito - Vera Deportes" },
      { name: "description", content: "Resumen de compra Vera Deportes." },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, subtotal } = useCart();
  const shipping = items.length > 0 ? "A coordinar" : "$0";
  const message = [
    "Hola! Quiero finalizar esta compra:",
    ...items.map((item) => `- ${item.qty} x ${item.name} (${item.price})`),
    `Subtotal: ${formatPrice(subtotal)}`,
    "Envio/retiro: a coordinar",
  ].join("\n");
  const checkoutHref = waLink(message);

  return (
    <div id="top" className="min-h-screen bg-page pb-20 text-foreground font-sans">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-4">
        <h1 className="font-display text-2xl font-black uppercase">Carrito</h1>

        {items.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-border bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">Tu carrito esta vacio.</p>
            <a
              href="/tienda#productos"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-bold text-primary-foreground"
            >
              Ver productos
            </a>
          </div>
        ) : (
          <div className="mt-4 grid gap-4">
            <div className="grid gap-3">
              {items.map((item) => (
                <article
                  key={item.id}
                  className="flex gap-3 rounded-2xl border border-border bg-background p-3"
                >
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-secondary">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-contain"
                      />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h2 className="line-clamp-2 font-display text-sm font-extrabold leading-tight">
                      {item.name}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">{item.category}</p>
                    <p className="mt-1 font-display text-sm font-black text-primary">
                      {item.price}
                    </p>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, item.qty - 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-7 text-center text-sm font-bold">{item.qty}</span>
                      <button
                        type="button"
                        onClick={() => updateCartQty(item.id, item.qty + 1)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => removeFromCart(item.id)}
                        className="ml-auto inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <section className="rounded-2xl border border-border bg-card p-4">
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="mt-2 flex justify-between text-sm">
                <span>Envio</span>
                <strong>{shipping}</strong>
              </div>
              <div className="mt-3 flex justify-between border-t border-border pt-3 font-display text-lg font-black">
                <span>Total</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <a
                href={checkoutHref}
                onClick={(e) => requireCustomerAccess(e, "checkout", checkoutHref)}
                target="_blank"
                rel="noopener"
                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary text-sm font-extrabold uppercase text-primary-foreground"
              >
                Finalizar compra
              </a>
              <button
                type="button"
                onClick={clearCart}
                className="mt-2 inline-flex h-10 w-full items-center justify-center rounded-lg border border-border text-sm font-bold"
              >
                Vaciar carrito
              </button>
            </section>
          </div>
        )}
      </main>
      <BottomNav active="Carrito" />
    </div>
  );
}
