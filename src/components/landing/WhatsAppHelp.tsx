import { MessageCircle } from "lucide-react";
import { waLink } from "@/lib/site";

export function WhatsAppHelp() {
  return (
    <section id="whatsapp" className="py-3">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-center gap-3 rounded-[24px] border border-whatsapp/15 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground">
            <MessageCircle className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-base font-black">Tenes dudas?</h2>
            <p className="text-xs leading-snug text-muted-foreground">
              Escribinos por WhatsApp y te ayudamos con stock, talles y compras.
            </p>
          </div>
          <a
            href={waLink("Hola! Quiero hacer una consulta sobre Vera Deportes.")}
            target="_blank"
            rel="noopener"
            className="inline-flex h-10 shrink-0 items-center justify-center rounded-full bg-whatsapp px-4 text-xs font-extrabold text-whatsapp-foreground"
          >
            Chatear
          </a>
        </div>
      </div>
    </section>
  );
}
