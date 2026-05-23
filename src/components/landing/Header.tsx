import { Menu, X } from "lucide-react";
import { useState } from "react";
import logo from "@/assets/logo-vera.png";
import { SITE } from "@/lib/site";

const NAV = [
  { label: "Productos", href: "#productos" },
  { label: "Categorías", href: "#categorias" },
  { label: "Ofertas", href: "#ofertas" },
  { label: "Contacto", href: "#contacto" },
];

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-4 h-16">
        <a href="#top" className="flex items-center gap-2">
          <img src={logo} alt="Vera Deportes" className="h-12 w-auto" width={120} height={120} />
        </a>
        <nav className="hidden md:flex items-center gap-7 text-sm font-medium">
          {NAV.map((i) => (
            <a key={i.href} href={i.href} className="text-foreground/80 hover:text-primary transition">
              {i.label}
            </a>
          ))}
        </nav>
        <button
          className="inline-flex items-center justify-center h-11 w-11 rounded-lg hover:bg-secondary"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menú"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" strokeWidth={2.5} />}
        </button>
      </div>
      {open && (
        <div className="border-t border-border bg-background">
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
