import { CreditCard, RefreshCcw, Truck } from "lucide-react";

const BENEFITS = [
  { icon: Truck, title: "Envios", text: "A todo el pais" },
  { icon: CreditCard, title: "Cuotas", text: "Hasta 6 sin interes" },
  { icon: RefreshCcw, title: "Cambios", text: "Hasta 30 dias" },
];

export function CommercialBenefits() {
  return (
    <section className="py-3">
      <div className="mx-auto max-w-6xl overflow-x-auto px-4">
        <div className="flex min-w-max gap-2 sm:grid sm:min-w-0 sm:grid-cols-3">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex w-[146px] items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 sm:w-auto"
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="h-4 w-4" strokeWidth={2.4} />
              </span>
              <div>
                <p className="font-display text-xs font-extrabold uppercase leading-tight">
                  {title}
                </p>
                <p className="text-[11px] leading-tight text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
