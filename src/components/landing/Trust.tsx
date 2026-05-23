import { UserRound, Store, Zap } from "lucide-react";

const ITEMS = [
  {
    icon: UserRound,
    title: "Atención personalizada",
    text: "Te asesoramos para que elijas lo mejor.",
  },
  {
    icon: Store,
    title: "Retiro en local",
    text: "Reservá por WhatsApp y retirá en Vera.",
  },
  {
    icon: Zap,
    title: "Consultas rápidas",
    text: "Respondemos por WhatsApp en minutos.",
  },
];

export function Trust() {
  return (
    <section className="py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="rounded-2xl bg-card border border-border shadow-sm divide-y md:divide-y-0 md:divide-x divide-border md:grid md:grid-cols-3">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-start gap-3 p-4">
              <span className="flex-none inline-flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary text-primary">
                <Icon className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <div>
                <h3 className="font-display font-bold text-sm leading-tight">{title}</h3>
                <p className="text-xs text-muted-foreground mt-1 leading-snug">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
