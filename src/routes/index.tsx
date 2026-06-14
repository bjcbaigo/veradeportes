import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight, Instagram, MessageCircle, Moon, Sun, X, Mail, Check, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { SplashScreen } from "@/components/SplashScreen";
import { supabase } from "@/integrations/supabase/client";
import { appendLeadToSheet } from "@/lib/leads-sheet.functions";
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
      { property: "og:description", content: "Algo grande está por llegar." },
    ],
  }),
  component: Intriga,
});

function Intriga() {
  const [mounted, setMounted] = useState(false);
  const [isDark, setIsDark] = useState(true);

  const [open, setOpen] = useState(false);
  const appendToSheet = useServerFn(appendLeadToSheet);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    setMounted(true);
    const stored = typeof window !== "undefined" ? localStorage.getItem("vd-theme") : null;
    if (stored) setIsDark(stored === "dark");
    else if (typeof window !== "undefined")
      setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (isDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("vd-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("vd-theme", "light");
    }
  }, [isDark, mounted]);


  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && closeModal();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function closeModal() {
    setOpen(false);
    setTimeout(() => {
      setStatus("idle");
      setErrorMsg("");
      setNombre("");
      setEmail("");
      setPhone("");
    }, 200);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const nm = nombre.trim();
    const em = email.trim();
    const ph = phone.trim();
    if (nm.length < 2) {
      setErrorMsg("Ingresá tu nombre y apellido.");
      setStatus("error");
      return;
    }
    const emailOk = /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(em);
    if (!emailOk) {
      setErrorMsg("Ingresá un email válido.");
      setStatus("error");
      return;
    }
    if (ph.length < 6) {
      setErrorMsg("Ingresá un teléfono válido.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    const { error } = await supabase
      .from("leads")
      .insert({ nombre: nm, email: em, whatsapp: ph });
    if (error) {
      setStatus("error");
      setErrorMsg("No pudimos registrarte. Intentá de nuevo.");
      return;
    }
    try {
      await appendToSheet({ data: { nombre: nm, email: em, telefono: ph } });
    } catch (err) {
      console.error("Sheet append failed", err);
    }
    setStatus("ok");
  }


  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--page)] text-[var(--color-foreground)] font-sans flex flex-col">
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
        <div className="flex items-center gap-3 sm:gap-4 text-sm text-neutral-500 dark:text-neutral-400">
          <button
            onClick={() => setIsDark((d) => !d)}
            aria-label="Cambiar tema"
            suppressHydrationWarning
            className="flex h-9 w-9 items-center justify-center rounded-full border border-black/20 dark:border-white/20 bg-black/10 dark:bg-white/10 backdrop-blur hover:text-[#FF4B00] transition"
          >
            {mounted ? (isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />) : <Sun className="h-4 w-4" />}
          </button>
          <a href="https://www.instagram.com/vera_deportes" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="hover:text-[#FF4B00]"><Instagram className="h-5 w-5" /></a>
          <a href="#" aria-label="WhatsApp" className="hover:text-[#FF4B00]"><MessageCircle className="h-5 w-5" /></a>
        </div>
      </header>

      {/* Center content */}
      <section className="relative z-10 flex-1 flex flex-col items-center justify-center text-center px-5 py-16">
        <span className="inline-block bg-black/10 dark:bg-white/10 backdrop-blur text-[var(--color-foreground)] text-[11px] sm:text-xs font-bold tracking-[0.2em] px-3 py-1.5 rounded-full border border-black/20 dark:border-white/20">
          MUY PRONTO
        </span>

        <h1 className="font-display font-extrabold italic uppercase mt-6 leading-[0.95] text-4xl sm:text-6xl md:text-7xl tracking-tight max-w-4xl">
          Algo <span className="text-[#FF4B00]">grande</span><br />
          está por llegar
        </h1>

        <p className="mt-6 text-neutral-600 dark:text-neutral-300 text-base sm:text-lg max-w-md">
          La comunidad deportiva de Vera y la región<br className="hidden sm:block" />
          tiene un nuevo punto de encuentro.
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-[#FF4B00] hover:bg-[#e54300] text-white font-bold text-sm sm:text-base px-7 py-4 tracking-wide transition shadow-[0_10px_40px_-10px_rgba(255,75,0,0.8)]"
        >
          QUIERO SABER MÁS
          <ArrowRight className="h-4 w-4" />
        </button>
      </section>

      <footer className="relative z-10 text-center pb-6 text-xs text-neutral-400 dark:text-neutral-500">
        © {new Date().getFullYear()} Vera Deportes
      </footer>

      {/* MODAL */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        >
          <div
            role="dialog"
            aria-modal="true"
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md rounded-2xl bg-white text-neutral-900 dark:bg-neutral-900 dark:text-white shadow-2xl border border-black/10 dark:border-white/10 p-6 sm:p-7"
          >
            <button
              onClick={closeModal}
              aria-label="Cerrar"
              className="absolute right-3 top-3 h-9 w-9 rounded-full flex items-center justify-center text-neutral-500 hover:text-[#FF4B00] hover:bg-black/5 dark:hover:bg-white/10 transition"
            >
              <X className="h-5 w-5" />
            </button>

            {status === "ok" ? (
              <div className="text-center py-4">
                <div className="mx-auto h-14 w-14 rounded-full bg-[#FF4B00]/15 flex items-center justify-center">
                  <Check className="h-7 w-7 text-[#FF4B00]" />
                </div>
                <h3 className="mt-4 font-display font-extrabold text-2xl tracking-tight">
                  ¡Gracias!
                </h3>
                <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300 leading-relaxed">
                  En los próximos días vas a conocer más.<br />
                  <span className="font-semibold text-neutral-900 dark:text-white">Te avisaremos.</span>
                </p>
                <button
                  onClick={closeModal}
                  className="mt-6 inline-flex items-center justify-center w-full h-11 rounded-lg bg-[#FF4B00] hover:bg-[#e54300] text-white font-bold text-sm tracking-wide transition"
                >
                  CERRAR
                </button>
              </div>
            ) : (
              <>
                <h3 className="text-center font-extrabold text-xl sm:text-2xl tracking-tight">
                  SÉ DE LOS PRIMEROS
                  <div className="text-[#FF4B00]">EN ENTERARTE</div>
                </h3>
                <p className="text-center text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                  Dejanos tus datos y te contamos antes que a nadie.
                </p>

                <form onSubmit={onSubmit} className="mt-5 space-y-3">
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      type="text"
                      autoComplete="name"
                      maxLength={120}
                      required
                      placeholder="Nombre y apellido"
                      className="w-full h-12 pl-10 pr-3 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#FF4B00] focus:bg-white dark:focus:bg-white/10 transition"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      type="email"
                      inputMode="email"
                      autoComplete="email"
                      maxLength={200}
                      required
                      placeholder="Tu email"
                      className="w-full h-12 pl-10 pr-3 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#FF4B00] focus:bg-white dark:focus:bg-white/10 transition"
                    />
                  </div>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={30}
                      required
                      placeholder="Tu teléfono"
                      className="w-full h-12 pl-10 pr-3 rounded-lg border border-neutral-200 dark:border-white/10 bg-neutral-50 dark:bg-white/5 text-sm focus:outline-none focus:border-[#FF4B00] focus:bg-white dark:focus:bg-white/10 transition"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full h-12 rounded-lg bg-[#FF4B00] hover:bg-[#e54300] text-white font-bold text-sm tracking-wide transition disabled:opacity-60"
                  >
                    {status === "loading" ? "ENVIANDO..." : "OK, AVISAME"}
                  </button>

                  {status === "error" && errorMsg && (
                    <p className="text-sm text-red-600 text-center">{errorMsg}</p>
                  )}
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
