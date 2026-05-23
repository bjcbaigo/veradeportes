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

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vera Deportes — Zapatillas e indumentaria deportiva en Vera, Santa Fe" },
      {
        name: "description",
        content:
          "Tienda deportiva local en Vera, Santa Fe. Zapatillas, remeras, shorts, buzos y accesorios. Consultá talles, precios y promos por WhatsApp.",
      },
      { property: "og:title", content: "Vera Deportes — Tienda deportiva en Vera" },
      {
        property: "og:description",
        content: "Productos deportivos, promos y atención cercana por WhatsApp.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Header />
      <Hero />
      <Categories />
      <Products />
      <Promo />
      <Trust />
      <Social />
      <Contact />
      <Footer />
      <BottomNav />
      <WhatsAppFab />
    </main>
  );
}
