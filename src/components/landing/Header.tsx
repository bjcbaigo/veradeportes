import { Facebook, Instagram, Menu, MessageCircle, Moon, ShoppingCart, Sun, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import logo from "@/assets/logo-vera.png";
import { useCart } from "@/lib/cart";
import { SITE, waLink } from "@/lib/site";

function ThemeToggle() {
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const isDark = saved === "dark" || (!saved && prefersDark);
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);
  return (
    <button
      onClick={() => setDark((v) => !v)}
      aria-label="Cambiar tema"
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border hover:bg-secondary"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

const NAV = [
  { label: "Portada", href: "/" },
  { label: "Tienda", href: "/tienda" },
  { label: "Categorias", href: "/tienda#categorias" },
  { label: "Ofertas", href: "/ofertas" },
  { label: "Novedades", href: "/tienda#productos" },
  { label: "Favoritos", href: "/tienda#productos" },
  { label: "Mi cuenta", href: "/tienda#cuenta" },
  { label: "Mis pedidos", href: "/tienda#pedidos" },
  { label: "Como llegar", href: SITE.maps, external: true },
  { label: "Contactanos", href: "/tienda#whatsapp" },
  { label: "Configuracion", href: "/tienda#configuracion" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const { count: cartCount } = useCart();

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
    <header className="sticky top-0 z-40 border-b border-border/70 bg-white/96 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-4">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary"
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          aria-expanded={open}
          aria-controls="mobile-menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2.5} />
        </button>

        <a href="/tienda" className="flex min-w-0 items-center gap-2">
          <img
            src={logo}
            alt="Vera Deportes"
            className="h-9 w-auto shrink-0 sm:h-12"
            width={160}
            height={160}
          />
          <span className="font-display text-sm font-extrabold leading-none tracking-normal sm:text-lg">
            <span className="text-primary">VERA</span> DEPORTES
          </span>
        </a>

        <div className="flex items-center gap-1.5">
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {NAV.slice(1, 5).map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="text-foreground/80 transition hover:text-primary"
              >
                {i.label}
              </a>
            ))}
          </nav>
          <a
            href="/carrito"
            aria-label="Carrito"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-full bg-secondary/80 hover:bg-secondary"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
                {cartCount}
              </span>
            )}
          </a>
        </div>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] h-[100dvh] bg-black/50 backdrop-blur-[1px]"
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
                  <span className="text-primary">VERA</span> DEPORTES
                </span>
              </a>
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Cerrar menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="border-b border-border/60 py-3 text-base font-medium text-foreground last:border-0 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  {i.label}
                </a>
              ))}
            </nav>
            <div className="mt-5 flex items-center gap-2">
              <ThemeToggle />
              <a
                href={SITE.instagram}
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href={waLink("Hola! Quiero hacer una consulta.")}
                target="_blank"
                rel="noopener"
                aria-label="WhatsApp"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border text-whatsapp"
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
