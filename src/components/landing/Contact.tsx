import { MessageCircle, MapPin } from "lucide-react";
import igLogo from "@/assets/ig-logo.jpg.asset.json";
import { SITE, waLink } from "@/lib/site";

const CARDS = [
  {
    icon: MessageCircle,
    title: "WhatsApp",
    text: "Escribinos ahora",
    href: waLink("Hola! Quiero hacer una consulta."),
    accent: "bg-whatsapp text-whatsapp-foreground",
  },
  {
    image: igLogo.url,
    title: "Instagram",
    text: "@veradeportes",
    href: SITE.instagram,
    accent: "bg-gradient-to-tr from-[oklch(0.55_0.22_15)] via-[oklch(0.65_0.22_330)] to-[oklch(0.7_0.18_60)] text-white",
  },
  {
    icon: MapPin,
    title: "Cómo llegar",
    text: SITE.city,
    href: SITE.maps,
    accent: "bg-primary text-primary-foreground",
  },
];

export function Contact() {
  return (
    <section id="contacto" className="py-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {CARDS.map(({ icon: Icon, title, text, href, accent }) => (
            <a
              key={title}
              href={href}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-3 rounded-3xl bg-card border border-border p-3 hover:border-primary hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] transition"
            >
              <span className={`flex-none inline-flex h-11 w-11 items-center justify-center rounded-full ${accent}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-display font-bold text-sm leading-tight">{title}</p>
                <p className="text-xs text-muted-foreground">{text}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
