import { CreditCard, RefreshCcw, Truck } from "lucide-react";

const BENEFITS = [
  { icon: Truck, title: "Envios", text: "A todo el pais" },
  { icon: CreditCard, title: "Pagos", text: "Consulta opciones" },
  { icon: RefreshCcw, title: "Cambios", text: "Atencion directa" },
];

export function CommercialBenefits() {
  return (
    <section className="py-3">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="grid grid-cols-3 gap-2 rounded-[22px] border border-border/80 bg-white p-2 lg:gap-3 lg:p-3 shadow-[0_6px_18px_rgba(0,0,0,0.04)]">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex min-w-0 flex-col items-center justify-start gap-1.5 rounded-2xl bg-secondary/70 px-1.5 py-2.5 text-center lg:flex-row lg:justify-center lg:gap-3 lg:px-4 lg:py-3 lg:text-left"
            >
              <span className="inline-flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-[11px] font-extrabold lg:text-xs uppercase leading-tight">
                  {title}
                </p>
                <p className="mt-0.5 text-[10px] lg:text-xs leading-tight text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
