import { Facebook, Instagram, Menu, MessageCircle, ShoppingCart, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo-vera.png";
import { useCart } from "@/lib/cart";
import { requireCustomerAccess } from "@/lib/customer-access";
import { SITE, waLink } from "@/lib/site";

const NAV = [
  { label: "Portada", href: "/" },
  { label: "Tienda", href: "/tienda" },
  { label: "Categorias", href: "/tienda#categorias" },
  { label: "Ofertas", href: "/ofertas" },
  { label: "Novedades", href: "/tienda#productos" },
  { label: "Favoritos", href: "/tienda#productos" },
  { label: "Registrarme", href: "/registro?intent=cuenta&returnTo=%2Fregistro" },
  { label: "Mis pedidos", href: "/tienda#pedidos" },
  { label: "Como llegar", href: SITE.maps, external: true },
  { label: "Contactanos", href: "/tienda#whatsapp" },
  { label: "Configuracion", href: "/tienda#configuracion" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { count: cartCount } = useCart();

  // La tienda usa una sola paleta clara: evitamos texto claro sobre superficies blancas.
  useEffect(() => {
    document.documentElement.classList.remove("dark");
  }, []);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButtonRef.current?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background pt-[env(safe-area-inset-top)] text-foreground backdrop-blur">
      <div className="mx-auto grid h-[58px] max-w-6xl grid-cols-[44px_1fr_auto] items-center px-4 sm:h-16 xl:max-w-7xl xl:px-6">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2.25} />
        </button>
        <span className="hidden md:inline-flex h-10 w-10" />

        <a href="/tienda" className="mx-auto flex min-w-0 items-center justify-center gap-1.5">
          <img
            src={logo}
            alt="Vera Deportes"
            className="h-9 w-auto shrink-0 sm:h-11"
            width={160}
            height={160}
          />
          <span className="font-display text-[12px] font-black leading-none text-foreground sm:text-sm">
            <span className="text-primary">VERA</span> <span className="text-foreground">DEPORTES</span>
          </span>
        </a>

        <div className="flex items-center justify-end gap-4 xl:gap-6">
          <nav className="hidden items-center gap-5 text-sm font-semibold md:flex xl:gap-7">
            {NAV.slice(1, 5).map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="whitespace-nowrap text-foreground transition hover:text-primary"
              >
                {i.label}
              </a>
            ))}
          </nav>
          <a
            href="/carrito"
            aria-label="Carrito"
            className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <ShoppingCart className="h-5 w-5" strokeWidth={2.2} />
            {cartCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] h-[100dvh] bg-[#071b3b]/45 backdrop-blur-[2px]"
          onClick={() => setOpen(false)}
          role="presentation"
        >
          <aside
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu principal"
            className="fixed left-0 top-0 z-[101] flex h-[100dvh] w-[86vw] max-w-[340px] flex-col overflow-y-auto border-r border-border bg-background px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-[calc(1rem+env(safe-area-inset-top))] text-foreground shadow-2xl outline-none"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <a
                href="/tienda"
                className="flex min-w-0 items-center gap-2"
                onClick={() => setOpen(false)}
              >
                <img src={logo} alt="Vera Deportes" className="h-10 w-auto shrink-0" />
                <span className="truncate font-display text-sm font-black">
                  <span className="text-primary">VERA</span> <span className="text-foreground">DEPORTES</span>
                </span>
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Cerrar menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex flex-col gap-1">
              {NAV.map((i) => (
                <a
                  key={i.href}
                  href={i.href}
                  target={i.external ? "_blank" : undefined}
                  rel={i.external ? "noopener" : undefined}
                  onClick={() => setOpen(false)}
                  className="border-b border-border/70 py-3 text-base font-semibold text-foreground last:border-0 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {i.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 flex items-center gap-2">
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={waLink("Hola! Quiero hacer una consulta.")}
                onClick={(e) =>
                  requireCustomerAccess(e, "whatsapp", waLink("Hola! Quiero hacer una consulta."))
                }
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border text-whatsapp"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
            <p className="pt-4 text-xs text-muted-foreground">
              {SITE.address} - {SITE.city}
            </p>
          </aside>
        </div>
      )}
    </header>
  );
}
