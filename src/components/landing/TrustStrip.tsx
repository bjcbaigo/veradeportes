import { CreditCard, MapPin } from "lucide-react";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { SITE, waLink } from "@/lib/site";

export function TrustStrip() {
  const wa = waLink("Hola! Quiero hacer una consulta.");
  const items = [
    { icon: CreditCard, title: "Cuotas", text: "Consultá planes de pago", href: wa, ext: true },
    { icon: MapPin, title: "Retiro en el local", text: `${SITE.address} · ${SITE.city}`, href: SITE.maps, ext: true },
    { icon: WhatsAppIcon, title: "WhatsApp", text: "Te respondemos rápido", href: wa, ext: true },
  ];
  return (
    <section className="bg-ink py-4 text-ink-foreground sm:py-6">
      <div className="mx-auto grid max-w-6xl grid-cols-3 gap-2 px-3 sm:gap-6 sm:px-4 xl:max-w-7xl xl:px-6">
        {items.map(({ icon: Icon, title, text, href }) => (
          <a key={title} href={href} target="_blank" rel="noopener" className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:flex-row sm:gap-3 sm:text-left">
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground sm:h-11 sm:w-11">
              <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
            </span>
            <span className="min-w-0">
              <span className="block text-[11px] font-black uppercase sm:text-sm">{title}</span>
              <span className="block text-[10px] leading-tight text-ink-foreground/75 sm:text-xs">{text}</span>
            </span>
          </a>
        ))}
      </div>
    </section>
  );
}
