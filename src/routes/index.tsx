import { createFileRoute } from "@tanstack/react-router";
import { Header } from "@/components/landing/Header";
import { Hero } from "@/components/landing/Hero";
import { Categories } from "@/components/landing/Categories";
import { Products } from "@/components/landing/Products";
import { Promo } from "@/components/landing/Promo";
import { Trust } from "@/components/landing/Trust";
import { Contact } from "@/components/landing/Contact";
import { Social } from "@/components/landing/Social";
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
    <main className="min-h-screen text-foreground pb-4">
      <Header />
      <Hero />
      <Categories />
      <Products />
      <Promo />
      <Trust />
      <Contact />
      <Social />
      <Footer />
      <BottomNav />
      <WhatsAppFab />
    </main>
  );
}
