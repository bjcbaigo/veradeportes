import { createFileRoute } from "@tanstack/react-router";
import { BottomNav } from "@/components/landing/BottomNav";
import { Brands } from "@/components/landing/Brands";
import { Categories } from "@/components/landing/Categories";
import { CommercialBenefits } from "@/components/landing/CommercialBenefits";
import { FeaturedOffers } from "@/components/landing/FeaturedOffers";
import { Footer } from "@/components/landing/Footer";
import { Header } from "@/components/landing/Header";
import { HomeHero } from "@/components/landing/HomeHero";
import { HomeSearch } from "@/components/landing/HomeSearch";
import { Products } from "@/components/landing/Products";
import { PromoCarousel } from "@/components/landing/PromoCarousel";
import { StoreLocation } from "@/components/landing/StoreLocation";
import { StoreExperience } from "@/components/landing/StoreExperience";
import { WhatsAppFab } from "@/components/landing/WhatsAppFab";
import { WhatsAppHelp } from "@/components/landing/WhatsAppHelp";

export const Route = createFileRoute("/tienda")({
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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: StorefrontPage,
});

function StorefrontPage() {
  return (
    <div
      id="top"
      className="min-h-screen bg-page pb-[calc(84px+env(safe-area-inset-bottom))] text-foreground font-sans lg:pb-0"
    >
      <Header />
      <HomeHero />
      <HomeSearch />
      <main>
        <Categories />
        <PromoCarousel />
        <FeaturedOffers />
        <Products />
        <CommercialBenefits />
        <Brands />
        <WhatsAppHelp />
        <StoreExperience />
        <StoreLocation />
      </main>
      <Footer />
      <BottomNav active="Inicio" />
      <WhatsAppFab />
    </div>
  );
}
