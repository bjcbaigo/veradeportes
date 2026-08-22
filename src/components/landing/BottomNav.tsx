import { Home, Search, ShoppingCart, Tag, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useCart } from "@/lib/cart";

const ITEMS = [
  { label: "Inicio", icon: Home, href: "/tienda" },
  { label: "Buscar", icon: Search, href: "/tienda#buscar" },
  { label: "Ofertas", icon: Tag, href: "/ofertas" },
  { label: "Carrito", icon: ShoppingCart, href: "/carrito" },
  { label: "Registrarme", icon: User, href: "/registro?intent=cuenta&returnTo=%2Fregistro" },
];

function activeFromLocation(fallback: string) {
  if (typeof window === "undefined") return fallback;
  const { pathname, hash } = window.location;
  if (pathname === "/ofertas") return "Ofertas";
  if (pathname === "/carrito") return "Carrito";
  if (pathname === "/registro") return "Cuenta";
  if (pathname === "/tienda" && hash === "#buscar") return "Buscar";
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
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(7,27,59,0.06)] md:hidden">
      <div className="grid h-[66px] grid-cols-5">
        {ITEMS.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            onClick={() => setCurrent(label)}
            className={`relative flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${
              current === label ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <span className="inline-flex h-7 w-8 items-center justify-center rounded-full">
              <Icon className="h-5 w-5" strokeWidth={current === label ? 2.8 : 1.9} />
            </span>
            {label === "Carrito" && cartCount > 0 && (
              <span className="absolute right-3 top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-black text-primary-foreground">
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
