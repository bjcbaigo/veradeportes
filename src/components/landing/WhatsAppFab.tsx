import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";

export function WhatsAppFab() {
  return (
    <a
      href={waLink("Hola! Quiero hacer una consulta.")}
      target="_blank"
      rel="noopener"
      aria-label="Consultar por WhatsApp"
      className="fixed right-4 bottom-20 md:bottom-6 z-50 inline-flex h-14 w-14 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-xl shadow-black/20 hover:scale-105 transition"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
}
