import { Grid2X2, Home, ShoppingCart, Tag, User } from "lucide-react";
import { useCart } from "@/lib/cart";

const ITEMS = [
  { label: "Inicio", icon: Home, href: "/tienda" },
  { label: "Categorias", icon: Grid2X2, href: "/tienda#categorias" },
  { label: "Ofertas", icon: Tag, href: "/ofertas" },
  { label: "Carrito", icon: ShoppingCart, href: "/carrito" },
  { label: "Cuenta", icon: User, href: "/tienda#cuenta" },
];

export function BottomNav({ active = "Inicio" }: { active?: string }) {
  const { count: cartCount } = useCart();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border/80 bg-white/96 pb-[env(safe-area-inset-bottom)] shadow-[0_-8px_26px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
      <div className="grid h-[64px] grid-cols-5">
        {ITEMS.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            className={`relative flex flex-col items-center justify-center gap-1 text-[10px] font-bold ${
              active === label ? "text-primary" : "text-foreground/70"
            }`}
          >
            <span
              className={`inline-flex h-7 w-9 items-center justify-center rounded-full ${
                active === label ? "bg-primary/12" : ""
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
