import { Home, ShoppingBag, Tag, MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";

const ITEMS = [
  { label: "Inicio", icon: Home, href: "#top" },
  { label: "Productos", icon: ShoppingBag, href: "#productos" },
  { label: "Ofertas", icon: Tag, href: "#ofertas" },
];

export function BottomNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-background border-t border-border">
      <div className="grid grid-cols-4">
        {ITEMS.map(({ label, icon: Icon, href }) => (
          <a
            key={label}
            href={href}
            className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-medium text-foreground/80"
          >
            <Icon className="h-5 w-5" />
            {label}
          </a>
        ))}
        <a
          href={waLink("Hola! Quiero hacer una consulta.")}
          target="_blank"
          rel="noopener"
          className="flex flex-col items-center justify-center gap-1 py-2.5 text-[11px] font-bold text-primary"
        >
          <MessageCircle className="h-5 w-5" />
          WhatsApp
        </a>
      </div>
    </nav>
  );
}
