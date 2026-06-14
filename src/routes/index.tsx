import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Instagram, Facebook, MessageCircle, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import logo from "@/assets/splash-logo.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vera Deportes — Algo grande está por llegar" },
      {
        name: "description",
        content:
          "Algo grande está por llegar. Vera Deportes, la nueva experiencia deportiva de Vera y la región. Muy pronto.",
      },
      { property: "og:title", content: "Vera Deportes — Muy pronto" },
      {
        property: "og:description",
        content: "Algo grande está por llegar.",
      },
    ],
  }),
  component: Intriga,
});

function Intriga() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-black text-white font-sans flex flex-col">
      <SplashScreen />

      {/* Glow background */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,75,0,0.35) 0%, rgba(255,75,0,0.10) 30%, rgba(0,0,0,0) 65%)",
        }}
      />
      <div
        aria-hidden
        className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[120%] h-80 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,75,0,0.25) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 mx-auto w-full max-w-6xl px-5 pt-6 sm:pt-8 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-3">
          <img src={logo} alt="Vera Deportes" className="h-10 sm:h-12 w-auto" />
          <span className="font-display font-extrabold text-lg sm:text-2xl tracking-tight">
            VERA <span className="text-[#FF4B00]">DEPORTES</span>
          </span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-sm text-neutral-400">
          <a href="#" aria-label="Instagram" className="hover:text-[#FF4B00]"><Instagram className="h-5 w-5" /></a>
          <a href="#" aria-label="Facebook" className="hover:text-[#FF4B00]"><Facebook className="h-5 w-5" /></a>
          <a href="#" aria-label="WhatsApp" className="hover:text-[#FF4B00]"><MessageCircle className="h-5 w-5" /></a>
        </div>
      </header>

      {/* Center content */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 py-16">
        <span className="inline-block bg-white/10 backdrop-blur text-white text-[11px] sm:text-xs font-bold tracking-[0.2em] px-3 py-1.5 rounded-full border border-white/20">
          MUY PRONTO
        </span>

        <h1 className="font-display font-extrabold italic uppercase mt-6 leading-[0.95] text-4xl sm:text-6xl md:text-7xl tracking-tight max-w-4xl">
          Algo <span className="text-[#FF4B00]">grande</span><br />
          está por llegar
        </h1>

        <p className="mt-6 text-neutral-300 text-base sm:text-lg max-w-md">
          La comunidad deportiva de Vera y la región<br className="hidden sm:block" />
          tiene un nuevo punto de encuentro.
        </p>

        <Link
          to="/registro"
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#FF4B00] hover:bg-[#e54300] text-white font-bold text-sm sm:text-base px-7 py-4 tracking-wide transition shadow-[0_10px_40px_-10px_rgba(255,75,0,0.8)]"
        >
          QUIERO SABER MÁS
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>

      <footer className="relative z-10 text-center pb-6 text-xs text-neutral-500">
        © {new Date().getFullYear()} Vera Deportes
      </footer>
    </main>
  );
}
