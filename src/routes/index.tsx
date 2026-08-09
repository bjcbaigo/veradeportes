import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/landing/BottomNav";
import { Brands } from "@/components/landing/Brands";
import { Categories } from "@/components/landing/Categories";
import { CommercialBenefits } from "@/components/landing/CommercialBenefits";
import { FeaturedOffers } from "@/components/landing/FeaturedOffers";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { Products } from "@/components/landing/Products";
import { PromoCarousel } from "@/components/landing/PromoCarousel";
import { WhatsAppFab } from "@/components/landing/WhatsAppFab";
import { WhatsAppHelp } from "@/components/landing/WhatsAppHelp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vera Deportes - Tienda deportiva" },
      {
        name: "description",
        content:
          "Zapatillas, indumentaria, accesorios y ofertas deportivas en Vera, Santa Fe. Compra y consulta por WhatsApp.",
      },
      { property: "og:title", content: "Vera Deportes - Tienda deportiva" },
      {
        property: "og:description",
        content:
          "Promociones, categorias y productos deportivos desde una experiencia mobile-first.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  return (
    <div id="top" className="min-h-screen bg-page pb-20 text-foreground font-sans">
      <Header />
      <main>
        <PromoCarousel />
        <CommercialBenefits />
        <Categories />
        <FeaturedOffers />
        <Brands />
        <WhatsAppHelp />
        <Products limit={8} />
      </main>
      <Footer />
      <BottomNav active="Inicio" />
      <WhatsAppFab />
    </div>
  );
}
