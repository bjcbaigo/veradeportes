const BRANDS = ["Nike", "Adidas", "New Balance", "Puma", "Topper", "Asics", "Skechers"];

export function Brands() {
  return (
    <section className="py-6 border-y border-border bg-card/50">
      <div className="mx-auto max-w-6xl px-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground text-center mb-3">
          Trabajamos con las mejores marcas
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:gap-x-10">
          {BRANDS.map((b) => (
            <span
              key={b}
              className="font-display font-extrabold text-base sm:text-lg tracking-tight text-foreground/70 hover:text-primary transition"
            >
              {b}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
