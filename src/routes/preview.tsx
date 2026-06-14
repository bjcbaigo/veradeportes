import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Categories } from "@/components/landing/Categories";
import { Products } from "@/components/landing/Products";
import { Promo } from "@/components/landing/Promo";
import { Trust } from "@/components/landing/Trust";
import { Social } from "@/components/landing/Social";
import { Contact } from "@/components/landing/Contact";
import { Footer } from "@/components/landing/Footer";
import { BottomNav } from "@/components/landing/BottomNav";
import { WhatsAppFab } from "@/components/landing/WhatsAppFab";

export const Route = createFileRoute("/preview")({
  head: () => ({
    meta: [
      { title: "Vera Deportes — Zapatillas e indumentaria deportiva en Vera, Santa Fe" },
      {
        name: "description",
        content:
          "Zapatillas, remeras, shorts, buzos y accesorios deportivos en Vera, Santa Fe. Atención personalizada, retiro en local y consultas por WhatsApp.",
      },
      { property: "og:title", content: "Vera Deportes — Tienda deportiva en Vera, Santa Fe" },
      {
        property: "og:description",
        content:
          "Encontrá tu indumentaria deportiva en Vera. Consultá stock y talles por WhatsApp.",
      },
    ],
  }),
  component: PreviewPage,
});

function PreviewPage() {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <Header />
      <main>
        <Hero />
        <Categories />
        <Products />
        <Promo />
        <Trust />
        <Social />
        <Contact />
      </main>
      <Footer />
      <BottomNav />
      <WhatsAppFab />
    </div>
  );
}
