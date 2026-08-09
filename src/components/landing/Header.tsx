import { Facebook, Instagram, Menu, MessageCircle, Moon, ShoppingCart, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
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
  { label: "Inicio", href: "/" },
  { label: "Categorias", href: "#categorias" },
  { label: "Ofertas", href: "/ofertas" },
  { label: "Novedades", href: "#productos" },
  { label: "Favoritos", href: "#productos" },
  { label: "Mi cuenta", href: "#cuenta" },
  { label: "Mis pedidos", href: "#pedidos" },
  { label: "Como llegar", href: SITE.maps, external: true },
  { label: "Contactanos", href: "#whatsapp" },
  { label: "Configuracion", href: "#configuracion" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const { count: cartCount } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-3 sm:h-16 sm:px-4">
        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary"
          onClick={() => setOpen(true)}
          aria-label="Menu"
        >
          <Menu className="h-5 w-5" strokeWidth={2.5} />
        </button>

        <a href="/" className="flex min-w-0 items-center gap-2">
          <img
            src={logo}
            alt="Vera Deportes"
            className="h-10 w-auto shrink-0 sm:h-12"
            width={160}
            height={160}
          />
          <span className="font-display text-sm font-extrabold leading-none tracking-normal sm:text-lg">
            <span className="text-primary">VERA</span> DEPORTES
          </span>
        </a>

        <div className="flex items-center gap-1.5">
          <nav className="hidden items-center gap-7 text-sm font-medium md:flex">
            {NAV.slice(1, 4).map((i) => (
              <a
                key={i.href}
                href={i.href}
                className="text-foreground/80 transition hover:text-primary"
              >
                {i.label}
              </a>
            ))}
          </nav>
          <button
            type="button"
            aria-label="Carrito"
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-lg hover:bg-secondary"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <aside
            className="h-full w-[82vw] max-w-[320px] overflow-y-auto border-r border-border bg-background p-4 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <a href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <img src={logo} alt="Vera Deportes" className="h-10 w-auto" />
                <span className="font-display text-sm font-black">
                  <span className="text-primary">VERA</span> DEPORTES
                </span>
              </a>
              <button
                type="button"
                aria-label="Cerrar menu"
                onClick={() => setOpen(false)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg hover:bg-secondary"
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
                  className="border-b border-border/60 py-3 text-base font-medium last:border-0"
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
              {SITE.address} � {SITE.city}
            </p>
          </aside>
        </div>
      )}
    </header>
  );
}
