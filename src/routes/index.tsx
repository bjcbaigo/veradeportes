import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Instagram, MessageCircle, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import logoAsset from "@/assets/logo-vera.png.asset.json";
import heroAthletes from "@/assets/hero-athletes.png";
import { waLink } from "@/lib/site";

const logo = logoAsset.url;

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Vera Deportes - Estamos trabajando en algo para vos" },
      {
        name: "description",
        content:
          "Vera Deportes esta preparando una nueva experiencia deportiva para Vera, Santa Fe y la region.",
      },
      { property: "og:title", content: "Vera Deportes - Muy pronto" },
      {
        property: "og:description",
        content: "Estamos trabajando en algo para vos. Muy pronto vas a conocer mas.",
      },
      { property: "og:url", content: "https://veradeportes.com/" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://veradeportes.com/" }],
  }),
  component: ComingSoonPage,
});

function ComingSoonPage() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== "undefined" ? localStorage.getItem("vd-theme") : null;
    if (stored) setIsDark(stored === "dark");
    else if (typeof window !== "undefined") {
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.toggle("dark", isDark);
    localStorage.setItem("vd-theme", isDark ? "dark" : "light");
  }, [isDark, mounted]);

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-[var(--page)] text-[var(--color-foreground)] font-sans">
      <SplashScreen />

      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 35%, rgba(255,75,0,0.35) 0%, rgba(255,75,0,0.10) 30%, rgba(0,0,0,0) 65%)",
        }}
      />
      <img
        src={heroAthletes}
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[-2%] top-1/2 z-0 hidden h-[75vh] w-auto -translate-y-1/2 select-none opacity-80 dark:opacity-90 md:block"
      />
      <img
        src={heroAthletes}
        alt=""
        aria-hidden
        className="pointer-events-none absolute right-[-30%] top-1/2 z-0 h-[70vh] w-auto -translate-y-1/2 select-none opacity-25 md:hidden"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-1/2 h-80 w-[120%] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(255,75,0,0.25) 0%, rgba(0,0,0,0) 70%)",
        }}
      />

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center justify-between px-5 pt-6 sm:pt-8">
        <a href="/" className="flex min-w-0 items-center gap-2 sm:gap-3">
          <span className="rounded-lg dark:bg-white dark:p-1.5">
            <img src={logo} alt="Vera Deportes" className="block h-14 w-auto sm:h-16" />
          </span>
          <span className="font-display text-lg font-extrabold leading-none tracking-tight sm:text-2xl">
            VERA <span className="text-[#FF4B00]">DEPORTES</span>
          </span>
        </a>
        <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400 sm:gap-4">
          <button
            onClick={() => setIsDark((d) => !d)}
            aria-label="Cambiar tema"
            suppressHydrationWarning
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 bg-black/10 backdrop-blur transition hover:text-[#FF4B00] dark:border-white/20 dark:bg-white/10"
          >
            {mounted ? (
              isDark ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )
            ) : (
              <Sun className="h-4 w-4" />
            )}
          </button>
          <a
            href="https://www.instagram.com/vera_deportes/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="hover:text-[#FF4B00]"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a
            href={waLink("Hola! Quiero hacer una consulta sobre Vera Deportes.")}
            target="_blank"
            rel="noopener"
            aria-label="WhatsApp"
            className="hover:text-[#FF4B00]"
          >
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </header>

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <div className="w-full max-w-2xl lg:max-w-xl">
          <span className="inline-block rounded-full border border-black/20 bg-black/10 px-3 py-1.5 text-[11px] font-bold tracking-[0.2em] text-[var(--color-foreground)] backdrop-blur dark:border-white/20 dark:bg-white/10 sm:text-xs">
            MUY PRONTO
          </span>

          <h1 className="mt-6 font-display text-4xl font-extrabold uppercase italic leading-[0.95] tracking-tight sm:text-6xl md:text-7xl">
            ESTAMOS <span className="text-[#FF4B00]">TRABAJANDO</span>
            <br />
            EN ALGO PARA VOS
          </h1>

          <p className="mx-auto mt-6 max-w-md text-base text-neutral-600 dark:text-neutral-300 sm:text-lg">
            Estamos preparando una nueva experiencia deportiva para Vera y la region.
            <br className="hidden sm:block" />
            Muy pronto vas a descubrir productos, ofertas y novedades.
          </p>

        </div>
      </section>

      <footer className="relative z-10 pb-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
        (c) {new Date().getFullYear()} Vera Deportes
      </footer>
    </main>
  );
}
