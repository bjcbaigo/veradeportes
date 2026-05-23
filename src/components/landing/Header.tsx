import { Menu, X, MessageCircle } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-vera.png";
import { SITE, waLink } from "@/lib/site";

const NAV = [
  { label: "Productos", href: "#productos" },
  { label: "Categorías", href: "#categorias" },
  { label: "Ofertas", href: "#ofertas" },
  { label: "Contacto", href: "#contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="Vera Deportes" className="h-10 w-auto" width={80} height={80} />
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {NAV.map((i) => (
            <a key={i.href} href={i.href} className="text-foreground/80 hover:text-primary transition">
              {i.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <a
            href={waLink("Hola! Quiero hacer una consulta.")}
            target="_blank"
            rel="noopener"
            aria-label="WhatsApp"
            className="inline-flex items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground h-10 w-10 md:h-10 md:w-auto md:px-4 md:gap-2 text-sm font-semibold"
          >
            <MessageCircle className="h-5 w-5" />
            <span className="hidden md:inline">WhatsApp</span>
          </a>
          <button
            className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-md border border-border"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden border-t border-border bg-background">
          <nav className="flex flex-col px-4 py-3 gap-1">
            {NAV.map((i) => (
              <a
                key={i.href}
                href={i.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium border-b border-border/60 last:border-0"
              >
                {i.label}
              </a>
            ))}
            <p className="text-xs text-muted-foreground pt-2">{SITE.city}</p>
          </nav>
        </div>
      )}
    </header>
  );
}
