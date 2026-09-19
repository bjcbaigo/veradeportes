import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { requireCustomerAccess } from "@/lib/customer-access";
import { waLink } from "@/lib/site";

export function WhatsAppHelp() {
  const message = "Hola! Quiero hacer una consulta sobre Vera Deportes.";
  const href = waLink(message);

  return (
    <section id="whatsapp" className="py-2 sm:py-3">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 xl:max-w-7xl xl:px-6">
        <div className="flex items-center gap-2.5 rounded-lg bg-ink p-3 text-ink-foreground shadow-lg sm:gap-3 sm:rounded-[24px] sm:border sm:border-whatsapp/15 sm:bg-card sm:p-4 sm:text-foreground lg:p-5">
          <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground">
            <WhatsAppIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-sm font-bold sm:text-base">¿Tenés dudas?</h2>
            <p className="text-[10px] leading-snug text-ink-foreground/80 sm:text-xs sm:text-muted-foreground">
              Escribinos por WhatsApp y te ayudamos con stock, talles y compras.
            </p>
          </div>
          <a
            href={href}
            onClick={(e) => requireCustomerAccess(e, "whatsapp", href)}
            target="_blank"
            rel="noopener"
            className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-full bg-whatsapp px-3 text-[10px] font-extrabold text-whatsapp-foreground sm:h-10 sm:px-4 sm:text-xs"
          >
            <WhatsAppIcon className="hidden h-4 w-4 sm:block" />
            Chatear ahora
          </a>
        </div>
      </div>
    </section>
  );
}
