import { CreditCard, RefreshCcw, Truck } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";

const BENEFITS = [
  { icon: Truck, title: "Envios", text: "A todo el pais" },
  { icon: CreditCard, title: "Pagos", text: "Consulta opciones" },
  { icon: RefreshCcw, title: "Cambios", text: "Atencion directa" },
  { icon: WhatsAppIcon, title: "WhatsApp", text: "Te asesoramos" },
];

export function CommercialBenefits() {
  return (
    <section className="border-y border-border bg-secondary py-6 sm:py-8">
      <div className="mx-auto max-w-6xl px-4 xl:max-w-7xl xl:px-6">
        <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-4 lg:gap-6">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex min-w-0 items-center gap-3 px-1 text-left sm:justify-center"
            >
              <span className="inline-flex h-8 w-8 lg:h-10 lg:w-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                <p className="font-display text-xs font-extrabold uppercase leading-tight sm:text-sm">
                  {title}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:text-xs">
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
