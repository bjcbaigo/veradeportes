import { Heart, Home, Search, ShoppingCart, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";
import { openSearch } from "@/lib/search";

const ITEMS = [
  { label: "Inicio", icon: Home, href: "/tienda" },
  { label: "Buscar", icon: Search, href: "#buscar" },
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="grid h-[68px] grid-cols-5">
        {ITEMS.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            onClick={(e) => {
              if (label === "Buscar") {
                e.preventDefault();
                openSearch();
              }
              setCurrent(label);
            }}

            className={`relative flex flex-col items-center justify-center gap-1 text-[11px] ${
              current === label ? "font-bold text-primary" : "font-medium text-foreground/55"
            }`}
          >
            <span className="inline-flex h-6 w-6 items-center justify-center">
              <Icon
                className="h-[22px] w-[22px]"
                strokeWidth={current === label ? 2.4 : 1.9}
                fill={current === label && label !== "Buscar" ? "currentColor" : "none"}
              />
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
