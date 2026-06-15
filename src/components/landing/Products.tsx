import { useState, useMemo, useEffect } from "react";
import { Star, ArrowRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { PRODUCTS, type Product } from "@/lib/products";
import { listSheetProducts, type SheetProduct } from "@/lib/sheet-products.functions";
import { ProductDetailDialog } from "./ProductDetailDialog";
import { CATEGORY_EVENT, matchesCategory, type CategoryKey } from "@/lib/category-filter";

const CHIPS: CategoryKey[] = ["Todos", "Zapatillas", "Indumentaria", "Accesorios", "Niños", "Ofertas"];

const fmt = (raw: string) => {
  const n = Number(String(raw).replace(/[^\d.-]/g, ""));
  if (!Number.isFinite(n) || n <= 0) return raw || "";
  return "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });
};

function sheetToProduct(s: SheetProduct): Product {
  const parts = s.nombre.split(" ");
  const brand = parts[0] || s.categoria;
  return {
    id: s.id || String(s.rowIndex),
    sku: `SHEET-${s.id || s.rowIndex}`,
    name: s.nombre,
    brand,
    category: s.categoria,
    price: fmt(s.precio),
    image: s.imagen_url || "",
    badge: s.destacado ? "Destacado" : undefined,
    description: s.descripcion,
  };
}

export function Products() {
  const [selected, setSelected] = useState<Product | null>(null);
  const [open, setOpen] = useState(false);
  const [cat, setCat] = useState<CategoryKey>("Todos");

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<CategoryKey>).detail;
      if (detail) setCat(detail);
    };
    window.addEventListener(CATEGORY_EVENT, handler);
    return () => window.removeEventListener(CATEGORY_EVENT, handler);
  }, []);

  const fetchSheet = useServerFn(listSheetProducts);
  const { data: sheetRows } = useQuery({
    queryKey: ["sheet-products"],
    queryFn: () => fetchSheet(),
    staleTime: 5 * 60_000,
  });

  const allProducts = useMemo<Product[]>(() => {
    if (!sheetRows || sheetRows.length === 0) return PRODUCTS;
    const active = sheetRows.filter((r) => r.activo && r.nombre);
    if (active.length === 0) return PRODUCTS;
    return active
      .map(sheetToProduct)
      .sort((a, b) => Number(b.badge === "Destacado") - Number(a.badge === "Destacado"));
  }, [sheetRows]);

  const products = useMemo(
    () => allProducts.filter((p) => matchesCategory(p.category, p.name, p.badge, cat)),
    [allProducts, cat],
  );

  const handleSelect = (p: Product) => {
    setSelected(p);
    setOpen(true);
  };

  return (
    <section id="productos" className="py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display font-extrabold text-2xl md:text-3xl">
            Productos destacados
          </h2>
          <a href="#productos" className="text-sm font-semibold text-primary inline-flex items-center gap-1">
            Ver todas <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {products.map((p) => {
            const idNum = parseInt(p.id) || 1;
            const reviews = 12 + idNum * 4;
            return (
              <article
                key={p.id}
                className="flex flex-col rounded-3xl bg-card border border-border overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)] text-left cursor-pointer hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 hover:border-primary/40 transition-all duration-300"
                onClick={() => handleSelect(p)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSelect(p);
                  }
                }}
              >
                <div className="aspect-square bg-[#e5e7eb] p-3">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      width={400}
                      height={400}
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
                <div className="flex flex-col gap-1.5 px-3 pb-3">
                  {p.badge && (
                    <span className="self-start inline-block text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                      {p.badge}
                    </span>
                  )}
                  <h3 className="font-display font-bold text-[15px] leading-tight">
                    {p.name}
                  </h3>
                  <p className="text-[11px] text-muted-foreground">
                    {p.brand} · {p.category}
                  </p>
                  <div className="flex items-center gap-1 text-primary text-[12px] font-semibold">
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <Star className="h-3.5 w-3.5 fill-primary" />
                    <span className="text-muted-foreground ml-1">({reviews})</span>
                  </div>
                  <div className="mt-1 flex items-baseline gap-2">
                    <p className="font-display font-extrabold text-primary text-[15px]">
                      {p.price}
                    </p>
                    {p.priceOld && (
                      <p className="text-[11px] text-muted-foreground line-through">
                        {p.priceOld}
                      </p>
                    )}
                  </div>
                  <span className="mt-1 inline-flex items-center justify-center gap-1 rounded-lg bg-primary text-primary-foreground h-9 text-[12px] font-bold">
                    Ver detalles
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <ProductDetailDialog product={selected} open={open} onOpenChange={setOpen} />
    </section>
  );
}
