import { createFileRoute } from "@tanstack/react-router";
import { SplashScreen } from "@/components/SplashScreen";
import comingSoon from "@/assets/coming-soon.png.asset.json";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vera Deportes — Algo grande está por llegar" },
      {
        name: "description",
        content:
          "Muy pronto: nueva experiencia Vera Deportes. Registrate y sé de los primeros en enterarte.",
      },
      { property: "og:title", content: "Vera Deportes — Muy pronto" },
      {
        property: "og:description",
        content: "Algo grande está por llegar. Registrate y participá del sorteo.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="min-h-screen w-full bg-white flex items-start justify-center">
      <SplashScreen />
      <img
        src={comingSoon.url}
        alt="Vera Deportes — Algo grande está por llegar"
        className="w-full h-auto max-w-[1100px] block"
      />
    </main>
  );
}
