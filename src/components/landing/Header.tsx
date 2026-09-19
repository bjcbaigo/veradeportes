import { Facebook, Instagram, Menu, Search, ShoppingCart, UserRound, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import logoEmblem from "@/assets/logo-vera-emblema-final.png.asset.json";
import { useCart } from "@/lib/cart";
import { requireCustomerAccess } from "@/lib/customer-access";
import { openSearch } from "@/lib/search";
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
      <div className="mx-auto grid h-[68px] max-w-7xl grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-1.5 px-3 md:h-[92px] md:grid-cols-[minmax(310px,1fr)_auto_minmax(180px,1fr)] md:gap-6 md:px-4 xl:px-6">
        <button
          type="button"
          className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background text-foreground hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary md:hidden"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2.25} />
        </button>
        <a href="/tienda" className="mx-auto flex min-w-0 items-center justify-center gap-1.5 md:mx-0 md:justify-self-start md:gap-3">
          <img
            src={logoEmblem.url}
            alt=""
            className="h-9 w-[74px] shrink-0 object-contain md:h-16 md:w-[132px]"
            width={630}
            height={305}
          />
          <span className="inline origin-left scale-x-[1.12] whitespace-nowrap font-display text-[16px] font-black leading-none text-foreground md:text-[24px]">
            <span className="text-primary">VERA</span> <span className="text-foreground">DEPORTES</span>
          </span>
        </a>

        <nav className="hidden items-center justify-center gap-5 text-xs font-bold md:flex lg:gap-7">
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
        <div className="flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => openSearch()}
            aria-label="Buscar productos"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground transition hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary md:inline-flex"
          >
            <Search className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </button>
          <a
            href="/registro?intent=cuenta&returnTo=%2Ftienda"
            aria-label="Mi cuenta"
            className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-full bg-background text-foreground ring-1 ring-border transition hover:bg-secondary hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary md:inline-flex"
          >
            <UserRound className="h-[18px] w-[18px]" strokeWidth={2.2} />
          </a>
          <a
            href="/carrito"
            aria-label="Carrito"
            className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary md:h-10 md:w-10 md:bg-background md:ring-1 md:ring-border md:hover:bg-secondary"
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
                <img src={logoEmblem.url} alt="" className="h-10 w-20 shrink-0 object-contain" />
                <span className="origin-left scale-x-[1.1] truncate font-display text-sm font-black">
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
                <WhatsAppIcon className="h-4 w-4" />
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
