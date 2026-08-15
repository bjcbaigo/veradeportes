import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Instagram,
  Facebook,
  MessageCircle,
  Trophy,
  Gift,
  Tag,
  Clock,
  Megaphone,
  MessageSquareHeart,
  CalendarDays,
  Users,
  Pencil,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  Headphones,
  Lock,
  User as UserIcon,
} from "lucide-react";
import { SplashScreen } from "@/components/SplashScreen";
import { supabase } from "@/integrations/supabase/client";
import { addCartItem } from "@/lib/cart";
import { toggleFavorite } from "@/lib/favorites";
import {
  getFirstPurchaseBenefit,
  readCustomerProfile,
  saveCustomerProfile,
  takePendingAction,
  type CustomerProfile,
} from "@/lib/customer-access";
import logo from "@/assets/splash-logo.png";
import athletes from "@/assets/coming-athletes.jpg";
import kit from "@/assets/coming-kit.jpg";
import adidasLogo from "@/assets/brands/adidas.svg.asset.json";
import pumaLogo from "@/assets/brands/puma.png.asset.json";
import topperLogo from "@/assets/brands/topper.svg.asset.json";
import asicsLogo from "@/assets/brands/asics.png.asset.json";

export const Route = createFileRoute("/registro")({
  head: () => ({
    meta: [
      { title: "Registro — Vera Deportes | Sumate por beneficios" },
      {
        name: "description",
        content:
          "Registrate en Vera Deportes y sé de los primeros en enterarte. Beneficios exclusivos, sorteos y promos de lanzamiento en Vera, Santa Fe.",
      },
      { property: "og:title", content: "Registro — Vera Deportes" },
      {
        property: "og:description",
        content: "Registrate y participá del sorteo del Kit Deportivo Vera Deportes.",
      },
      { property: "og:url", content: "https://veradeportes.com/registro" },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://veradeportes.com/registro" }],
  }),
  component: ComingSoon,
});

function ComingSoon() {
  const [nombre, setNombre] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [returnTo, setReturnTo] = useState("");
  const [intent, setIntent] = useState("");

  useEffect(() => {
    setProfile(readCustomerProfile());
    const params = new URLSearchParams(window.location.search);
    setReturnTo(params.get("returnTo") || "");
    setIntent(params.get("intent") || "");
  }, []);

  function finishPendingAccess(fallback = "/tienda") {
    const pending = takePendingAction();
    if (pending?.type === "add-to-cart") {
      addCartItem(pending.item);
      window.location.href = "/carrito";
      return;
    }
    if (pending?.type === "toggle-favorite") {
      toggleFavorite(pending.productId);
    }
    window.location.href = returnTo || fallback;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    const n = nombre.trim();
    const w = whatsapp.trim();
    if (n.length < 1 || w.length < 6) {
      setErrorMsg("Completá tu nombre y un WhatsApp válido.");
      setStatus("error");
      return;
    }
    setStatus("loading");
    const { error } = await supabase.from("leads").insert({ nombre: n, whatsapp: w });
    if (error) {
      setStatus("error");
      setErrorMsg("No pudimos registrarte. Intentá de nuevo.");
      return;
    }
    saveCustomerProfile(n, w);
    setProfile(readCustomerProfile());
    setStatus("ok");
    setNombre("");
    setWhatsapp("");
    if (returnTo || intent) {
      window.setTimeout(() => finishPendingAccess(), 250);
    }
  }

  return (
    <main className="min-h-screen bg-card text-foreground font-sans">
      <SplashScreen />

      {/* TOP BAR */}
      <header className="mx-auto max-w-6xl px-5 pt-5 sm:pt-7 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2 sm:gap-3">
          <img src={logo} alt="Vera Deportes" className="h-10 sm:h-12 w-auto invert" />
          <span className="font-display font-extrabold text-lg sm:text-2xl tracking-tight">
            VERA <span className="text-primary">DEPORTES</span>
          </span>
        </a>
        <div className="hidden sm:flex items-center gap-4 text-sm text-neutral-600">
          <span>Seguinos en nuestras redes</span>
          <a href="#" aria-label="Instagram" className="hover:text-primary">
            <Instagram className="h-5 w-5" />
          </a>
          <a href="#" aria-label="Facebook" className="hover:text-primary">
            <Facebook className="h-5 w-5" />
          </a>
          <a href="#" aria-label="WhatsApp" className="hover:text-primary">
            <MessageCircle className="h-5 w-5" />
          </a>
        </div>
      </header>

      {/* HERO */}
      <section
        id="top"
        className="mx-auto max-w-6xl px-5 pt-8 sm:pt-12 grid md:grid-cols-2 gap-8 md:gap-10 items-center"
      >
        <div>
          <span className="inline-block bg-ink text-ink-foreground text-xs font-bold tracking-wider px-3 py-1.5 rounded">
            MUY PRONTO
          </span>
          <h1 className="font-display font-extrabold italic uppercase mt-4 leading-[0.95] text-2xl sm:text-5xl md:text-6xl tracking-tight">
            Algo <span className="text-primary">grande</span>
            <br />
            está por llegar
          </h1>
          <p className="mt-5 text-neutral-600 text-base sm:text-lg max-w-md">
            Estamos creando una nueva experiencia para los apasionados del deporte.
          </p>

          {/* Benefit icons */}
          <div className="mt-8 grid grid-cols-4 gap-3 sm:gap-6 max-w-md">
            {[
              { icon: Trophy, t: "BENEFICIOS", s: "EXCLUSIVOS" },
              { icon: Gift, t: "SORTEOS", s: "ESPECIALES" },
              { icon: Tag, t: "PROMOCIONES", s: "DE LANZAMIENTO" },
              { icon: Clock, t: "ACCESO", s: "ANTICIPADO" },
            ].map(({ icon: Icon, t, s }) => (
              <div key={t} className="text-center">
                <Icon
                  className="h-8 w-8 sm:h-10 sm:w-10 mx-auto text-primary"
                  strokeWidth={1.8}
                />
                <div className="mt-2 text-[10px] sm:text-xs font-extrabold">{t}</div>
                <div className="text-[10px] sm:text-xs font-extrabold text-primary">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <img
            src={athletes}
            alt="Atletas en acción"
            width={1280}
            height={1024}
            className="w-full h-auto"
          />
        </div>
      </section>

      {/* FORM CARD */}
      <section className="mx-auto max-w-md px-5 mt-10">
        <div className="bg-card rounded-2xl shadow-xl border border-neutral-100 p-6 sm:p-7">
          <h2 className="text-center font-extrabold text-xl sm:text-2xl tracking-tight">
            SÉ DE LOS PRIMEROS
            <div className="text-primary">EN ENTERARTE</div>
          </h2>
          <p className="text-center text-sm text-neutral-500 mt-2">
            Registrate y recibí novedades exclusivas, beneficios y acceso anticipado.
          </p>
          <p className="mt-3 rounded-xl bg-primary/10 px-3 py-2 text-center text-xs font-bold text-primary">
            {getFirstPurchaseBenefit()}
          </p>

          {profile ? (
            <div className="mt-5 rounded-xl border border-neutral-200 bg-neutral-50 p-4 text-center">
              <p className="text-xs font-bold uppercase tracking-wide text-neutral-500">
                Mi cuenta
              </p>
              <h2 className="mt-1 text-lg font-extrabold">{profile.nombre}</h2>
              <p className="mt-1 text-sm text-neutral-600">WhatsApp: {profile.whatsapp}</p>
              <button
                type="button"
                onClick={() => finishPendingAccess("/tienda")}
                className="mt-4 inline-flex h-11 w-full items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
              >
                {returnTo || intent ? "Continuar" : "Volver a la tienda"}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="mt-5 space-y-3">
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  maxLength={120}
                  required
                  aria-label="Tu nombre"
                  placeholder="Tu nombre"
                  className="w-full h-12 pl-10 pr-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-primary focus:bg-card transition"
                />
              </div>
              <div className="relative">
                <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
                <input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  inputMode="tel"
                  maxLength={30}
                  required
                  aria-label="Tu WhatsApp"
                  placeholder="Tu WhatsApp"
                  className="w-full h-12 pl-10 pr-3 rounded-lg border border-neutral-200 bg-neutral-50 text-sm focus:outline-none focus:border-primary focus:bg-card transition"
                />
              </div>

              <button
                type="submit"
                disabled={status === "loading"}
                className="w-full h-12 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-sm tracking-wide transition disabled:opacity-60"
              >
                {status === "loading" ? "ENVIANDO..." : "QUIERO SER DE LOS PRIMEROS"}
              </button>

              {status === "ok" && (
                <p className="text-sm text-green-600 text-center font-medium flex items-center justify-center gap-1.5">
                  <Check className="h-4 w-4" /> ¡Listo! Te avisaremos antes que a nadie.
                </p>
              )}
              {status === "error" && errorMsg && (
                <p className="text-sm text-red-600 text-center">{errorMsg}</p>
              )}

              <p className="text-xs text-neutral-500 text-center flex items-center justify-center gap-1.5 pt-1">
                <Lock className="h-3 w-3" /> Tus datos están protegidos. No enviamos spam.
              </p>
            </form>
          )}
        </div>
      </section>

      {/* COMUNIDAD */}
      <section className="mx-auto max-w-6xl px-5 mt-16 sm:mt-20 text-center">
        <h3 className="font-extrabold text-xl sm:text-3xl tracking-tight">
          LA COMUNIDAD DEPORTIVA DE VERA Y LA REGIÓN
        </h3>
        <p className="text-primary italic font-bold text-lg sm:text-2xl mt-1">
          TIENE UN NUEVO PUNTO DE ENCUENTRO
        </p>

        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Megaphone, t: "Novedades y lanzamientos de las mejores marcas" },
            { icon: MessageSquareHeart, t: "Contenido, consejos y tips para tu rendimiento" },
            { icon: CalendarDays, t: "Eventos y actividades deportivas locales" },
            { icon: Users, t: "Una comunidad que comparte tu pasión" },
          ].map(({ icon: Icon, t }, i) => (
            <div key={i} className="px-2">
              <Icon className="h-9 w-9 mx-auto" strokeWidth={1.6} />
              <p className="mt-3 text-xs sm:text-sm text-neutral-700 leading-snug">{t}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section className="mx-auto max-w-6xl px-5 mt-16 sm:mt-20 border-t border-neutral-200 pt-12">
        <h3 className="text-center font-extrabold text-xl sm:text-2xl tracking-tight">
          ¿CÓMO FUNCIONA?
        </h3>
        <div className="mx-auto mt-2 h-1 w-12 bg-primary rounded-full" />

        <div className="mt-10 grid grid-cols-2 md:grid-cols-4 gap-8 relative">
          {[
            {
              n: 1,
              icon: Pencil,
              t: "REGISTRATE",
              s: "Completá el formulario con tu nombre y WhatsApp.",
            },
            {
              n: 2,
              icon: MessageCircle,
              t: "RECIBÍ NOVEDADES",
              s: "Te avisaremos antes que nadie del lanzamiento oficial.",
            },
            {
              n: 3,
              icon: Gift,
              t: "PARTICIPÁ",
              s: "Ya estás participando por el sorteo del Kit Deportivo.",
            },
            {
              n: 4,
              icon: Share2,
              t: "COMPARTÍ",
              s: "Compartí con tus amigos y aumentá tus chances de ganar.",
            },
          ].map(({ n, icon: Icon, t, s }) => (
            <div key={n} className="text-center relative">
              <div className="mx-auto w-7 h-7 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center">
                {n}
              </div>
              <div className="mx-auto mt-3 w-20 h-20 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center">
                <Icon className="h-9 w-9" strokeWidth={1.7} />
              </div>
              <div className="mt-3 font-extrabold text-sm">{t}</div>
              <p className="mt-1 text-xs text-neutral-600 leading-snug px-2">{s}</p>
            </div>
          ))}
        </div>
      </section>

      {/* KIT */}
      <section className="mx-auto max-w-6xl px-5 mt-16 sm:mt-20">
        <div className="bg-neutral-50 rounded-2xl border border-neutral-200 p-6 sm:p-10 grid md:grid-cols-[1fr_1.2fr_auto] gap-6 items-center">
          <div>
            <p className="text-sm font-semibold">¡Ya estás participando por!</p>
            <h4 className="font-display font-extrabold text-2xl sm:text-3xl mt-1 leading-tight">
              KIT DEPORTIVO
              <br />
              <span className="text-primary">VERA DEPORTES</span>
            </h4>
            <ul className="mt-4 space-y-1.5 text-sm">
              {["Mochila deportiva", "Botella deportiva", "Remera técnica", "Toalla deportiva"].map(
                (i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" /> {i}
                  </li>
                ),
              )}
            </ul>
          </div>
          <img
            src={kit}
            alt="Kit Deportivo Vera Deportes"
            loading="lazy"
            width={1280}
            height={768}
            className="w-full h-auto"
          />
          <div className="text-center">
            <div className="w-36 h-36 sm:w-44 sm:h-44 rounded-full border-2 border-primary flex items-center justify-center mx-auto">
              <div>
                <div className="text-xs font-bold tracking-wider">SORTEAMOS</div>
                <div className="text-primary font-extrabold text-3xl sm:text-4xl leading-none mt-1">
                  1 KIT
                </div>
                <div className="text-[11px] italic mt-2 px-3">¡Registrate y participá!</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARCAS */}
      <section className="mx-auto max-w-6xl px-5 mt-16 sm:mt-20 text-center">
        <h4 className="font-extrabold text-sm tracking-wider">TRABAJAMOS CON LAS MEJORES MARCAS</h4>
        <div className="mt-6 grid grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center">
          {[
            { name: "Adidas", src: adidasLogo.url },
            { name: "Puma", src: pumaLogo.url },
            { name: "Topper", src: topperLogo.url },
            { name: "New Balance", src: `https://cdn.simpleicons.org/newbalance/000000` },
            { name: "Skechers", src: null },
            { name: "Asics", src: asicsLogo.url },
          ].map((m) => (
            <div
              key={m.name}
              className="h-10 flex items-center justify-center opacity-70 hover:opacity-100 transition"
            >
              {m.src ? (
                <img
                  src={m.src}
                  alt={m.name}
                  loading="lazy"
                  className="max-h-8 w-auto object-contain [filter:brightness(0)]"
                />
              ) : (
                <span className="font-extrabold uppercase tracking-wider text-base sm:text-lg text-foreground">
                  {m.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* TRUST */}
      <section className="mx-auto max-w-6xl px-5 mt-12 border-t border-neutral-200 pt-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
        {[
          { icon: ShieldCheck, t: "COMPRA SEGURA", s: "Tus datos protegidos" },
          { icon: Truck, t: "ENVÍOS A TODA LA REGIÓN", s: "Rápidos y confiables" },
          { icon: Headphones, t: "ATENCIÓN PERSONALIZADA", s: "Estamos para ayudarte" },
        ].map(({ icon: Icon, t, s }) => (
          <div key={t} className="flex items-center gap-3 justify-center md:justify-start">
            <Icon className="h-8 w-8" strokeWidth={1.6} />
            <div>
              <div className="font-extrabold">{t}</div>
              <div className="text-neutral-500">{s}</div>
            </div>
          </div>
        ))}
      </section>

      {/* FOOTER */}
      <footer className="mt-12 bg-ink text-ink-foreground">
        <div className="mx-auto max-w-6xl px-5 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="Vera Deportes" className="h-8 w-auto" />
            <span className="font-display font-extrabold text-base">
              VERA <span className="text-primary">DEPORTES</span>
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} Vera Deportes. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4">
            <a href="#" aria-label="Instagram">
              <Instagram className="h-5 w-5" />
            </a>
            <a href="#" aria-label="Facebook">
              <Facebook className="h-5 w-5" />
            </a>
            <a href="#" aria-label="WhatsApp">
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
