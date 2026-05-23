import { Footprints, Shirt, Layers, Flame, ShoppingBag, Tag } from "lucide-react";

const CATS = [
  { label: "Zapatillas", icon: Footprints },
  { label: "Remeras", icon: Shirt },
  { label: "Shorts", icon: Layers },
  { label: "Buzos", icon: Flame },
  { label: "Accesorios", icon: ShoppingBag },
  { label: "Ofertas", icon: Tag, highlight: true },
];

export function Categories() {
  return (
    <section id="categorias" className="py-10 md:py-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-5">
          <h2 className="font-display font-bold text-2xl md:text-3xl">Categorías</h2>
          <span className="text-sm text-muted-foreground">Tocá una para consultar</span>
        </div>

        <div className="-mx-4 px-4 overflow-x-auto md:overflow-visible">
          <div className="flex gap-3 md:grid md:grid-cols-6 min-w-max md:min-w-0">
            {CATS.map(({ label, icon: Icon, highlight }) => (
              <a
                key={label}
                href="#productos"
                className={`group flex flex-col items-center justify-center gap-2 rounded-2xl border px-4 py-5 min-w-[110px] md:min-w-0 transition ${
                  highlight
                    ? "bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20"
                    : "bg-secondary border-border hover:border-primary/50 hover:bg-background"
                }`}
              >
                <Icon className="h-7 w-7" strokeWidth={2.2} />
                <span className="text-sm font-semibold">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
