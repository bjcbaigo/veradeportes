import { HeartHandshake, MessageCircle, Store, BadgePercent, Clock } from "lucide-react";

const ITEMS = [
  { icon: HeartHandshake, title: "Atención personalizada", text: "Te asesoramos con cada producto." },
  { icon: MessageCircle, title: "Consultá antes de venir", text: "Respondemos rápido por WhatsApp." },
  { icon: Store, title: "Retiro en local", text: "Te lo dejamos listo en Vera." },
  { icon: BadgePercent, title: "Promos vigentes", text: "Descuentos cada semana." },
  { icon: Clock, title: "Respuesta rápida", text: "En horario comercial." },
];

export function Trust() {
  return (
    <section className="py-12 md:py-16 bg-secondary/60">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="font-display font-bold text-2xl md:text-3xl text-center">
          Tu tienda deportiva local
        </h2>
        <p className="mt-2 text-center text-muted-foreground max-w-xl mx-auto">
          No es una tienda online: somos un local real en Vera con atención cercana y rápida.
        </p>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
          {ITEMS.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="flex flex-col items-start gap-2 rounded-2xl bg-background border border-border p-4"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="font-display font-semibold text-sm">{title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
