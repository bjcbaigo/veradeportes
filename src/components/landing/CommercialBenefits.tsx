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
    <section className="border-y border-border bg-secondary py-3 sm:py-8">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 xl:max-w-7xl xl:px-6">
        <div className="grid grid-cols-4 gap-1.5 sm:gap-6">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex min-w-0 flex-col items-center gap-1 text-center sm:flex-row sm:gap-3 sm:px-1 sm:text-left sm:justify-center"
            >
               <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-background text-primary shadow-sm lg:h-10 lg:w-10">
                <Icon className="h-4 w-4 lg:h-5 lg:w-5" strokeWidth={2.5} />
              </span>
              <div className="min-w-0">
                 <p className="font-display text-[9px] font-extrabold leading-tight sm:text-sm sm:uppercase">
                  {title}
                </p>
                 <p className="mt-0.5 hidden text-[11px] leading-tight text-muted-foreground sm:block sm:text-xs">
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
