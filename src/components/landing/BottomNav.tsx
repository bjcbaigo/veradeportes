import { Heart, Home, Search, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const ITEMS = [
  { label: "Inicio", icon: Home, href: "/tienda" },
  { label: "Buscar", icon: Search, href: "/tienda#productos" },
  { label: "Favoritos", icon: Heart, href: "/tienda#productos" },
  { label: "Carrito", icon: ShoppingCart, href: "/carrito" },
  { label: "Cuenta", icon: User, href: "/registro?intent=cuenta&returnTo=%2Fregistro" },
];

function activeFromLocation(fallback: string) {
  if (typeof window === "undefined") return fallback;
  const { pathname } = window.location;
  if (pathname === "/ofertas") return "Buscar";
  if (pathname === "/carrito") return "Carrito";
  if (pathname === "/registro") return "Cuenta";
  return fallback;
}


export function BottomNav({ active = "Inicio" }: { active?: string }) {
  const { count: cartCount } = useCart();
  const [current, setCurrent] = useState(active);

  useEffect(() => {
    const sync = () => setCurrent(activeFromLocation(active));
    sync();
    window.addEventListener("hashchange", sync);
    window.addEventListener("popstate", sync);
    return () => {
      window.removeEventListener("hashchange", sync);
      window.removeEventListener("popstate", sync);
    };
  }, [active]);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-background/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_26px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="grid h-[64px] grid-cols-5">
        {ITEMS.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            onClick={() => setCurrent(label)}
            className={`relative flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${
              current === label ? "text-primary" : "text-foreground/70"
            }`}
          >
            <span
              className={`inline-flex h-7 w-9 items-center justify-center rounded-full ${
                current === label ? "bg-primary/12" : ""
              }`}
            >
              <Icon className="h-5 w-5" />
            </span>
            {label === "Carrito" && cartCount > 0 && (
              <span className="absolute right-3 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] text-primary-foreground">
                {cartCount}
              </span>
            )}
            {label}
          </a>
        ))}
      </div>
    </nav>
  );
}
