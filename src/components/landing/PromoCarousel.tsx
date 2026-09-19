import { getActivePromotions } from "@/lib/promotions";

export function PromoCarousel() {
  const promotions = getActivePromotions();

  return (
    <section id="promos" className="bg-background py-2 sm:py-8">
      <div className="mx-auto max-w-6xl xl:max-w-7xl">
        <div className="mb-4 hidden px-4 sm:block xl:px-6">
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">Elegidos para vos</p>
          <h2 className="mt-1 text-2xl font-black uppercase text-foreground sm:text-3xl">Historias en movimiento</h2>
        </div>
        <div className="px-3 sm:px-4 xl:px-6">
          <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:grid-cols-4 lg:gap-4">
            {promotions.map((promo) => (
              <a
                key={promo.id}
                href={promo.href}
                className={`group relative aspect-[4/5] min-w-0 overflow-hidden rounded-sm bg-ink shadow-lg ${promo.order > 2 ? "hidden sm:block" : "block"}`}
              >
                <img
                  src={promo.image}
                  alt=""
                  width={600}
                  height={750}
                  loading={promo.order === 1 ? "eager" : "lazy"}
                  className="absolute inset-0 h-full w-full object-cover opacity-70 transition-transform duration-500 group-hover:scale-110"
                />
                <span className="absolute inset-0 bg-gradient-to-t from-ink via-transparent to-transparent opacity-90" />
                <span className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
                  <h3 className="mb-1 font-display text-base font-black uppercase leading-tight text-ink-foreground sm:text-xl">
                    {promo.title}
                  </h3>
                  <p className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-ink-foreground/75 sm:mb-3 sm:text-sm">
                    {promo.subtitle}
                  </p>
                  <span className="inline-block w-fit bg-primary px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-primary-foreground transition-colors group-hover:bg-background group-hover:text-ink sm:px-4 sm:py-2 sm:text-xs">
                    {promo.ctaText}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
