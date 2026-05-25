import { Menu, X, Sun, Moon, MessageCircle } from "lucide-react";
import { useState, useEffect } from "react";
import logo from "@/assets/logo-vera.png";
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
      className="inline-flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg hover:bg-secondary transition"
    >
      {dark ? <Sun className="h-[18px] w-[18px] sm:h-5 sm:w-5" /> : <Moon className="h-[18px] w-[18px] sm:h-5 sm:w-5" />}
    </button>
  );
}

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
        <a href="#top" className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          <img src={logo} alt="Vera Deportes" className="h-8 sm:h-10 w-auto shrink-0" width={120} height={120} />
          <span className="font-display font-extrabold text-sm sm:text-lg tracking-tight leading-none whitespace-nowrap">
            <span className="text-primary">VERA</span> DEPORTES
          </span>
        </a>
        <div className="flex items-center gap-1">
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium mr-3">
            {NAV.map((i) => (
              <a key={i.href} href={i.href} className="text-foreground/80 hover:text-primary transition">
                {i.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
          <button
            className="inline-flex items-center justify-center h-11 w-11 rounded-lg hover:bg-secondary"
            onClick={() => setOpen((v) => !v)}
            aria-label="Menú"
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" strokeWidth={2.5} />}
          </button>
        </div>
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
