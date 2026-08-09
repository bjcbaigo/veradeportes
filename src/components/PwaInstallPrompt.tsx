import { useEffect, useState } from "react";
import { Download, Share, X } from "lucide-react";

const DISMISS_KEY = "vera-pwa-install-dismissed-until";
const DISMISS_DAYS = 7;

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    Boolean((window.navigator as Navigator & { standalone?: boolean }).standalone)
  );
}

function isMobileViewport() {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(max-width: 767px)").matches;
}

function isIosSafariLike() {
  if (typeof window === "undefined") return false;
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua) || (ua.includes("Mac") && "ontouchend" in document);
  const isStandaloneBrowser =
    !ua.includes("CriOS") && !ua.includes("FxiOS") && !ua.includes("EdgiOS");
  return isIos && isStandaloneBrowser;
}

function dismissedRecently() {
  if (typeof window === "undefined") return true;
  const until = Number(window.localStorage.getItem(DISMISS_KEY) || 0);
  return Number.isFinite(until) && until > Date.now();
}

function dismissForLater() {
  const until = Date.now() + DISMISS_DAYS * 24 * 60 * 60 * 1000;
  window.localStorage.setItem(DISMISS_KEY, String(until));
}

export function PwaInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);
  const [iosHelp, setIosHelp] = useState(false);

  useEffect(() => {
    if (!isMobileViewport() || isStandalone() || dismissedRecently()) return;

    const showFallback = window.setTimeout(() => {
      if (isIosSafariLike()) {
        setIosHelp(true);
        setVisible(true);
      }
    }, 900);

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      window.clearTimeout(showFallback);
      setInstallPrompt(event as BeforeInstallPromptEvent);
      setIosHelp(false);
      setVisible(true);
    };

    const onInstalled = () => {
      setInstallPrompt(null);
      setVisible(false);
      window.localStorage.removeItem(DISMISS_KEY);
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);
    window.addEventListener("appinstalled", onInstalled);

    return () => {
      window.clearTimeout(showFallback);
      window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  if (!visible) return null;

  const close = () => {
    dismissForLater();
    setVisible(false);
  };

  const install = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    setInstallPrompt(null);
    if (choice.outcome === "accepted") {
      setVisible(false);
    } else {
      close();
    }
  };

  return (
    <aside className="fixed inset-x-3 bottom-[calc(76px+env(safe-area-inset-bottom))] z-[55] mx-auto max-w-sm rounded-2xl border border-border/80 bg-white p-3 text-foreground shadow-[0_16px_42px_rgba(0,0,0,0.18)] md:hidden">
      <div className="flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-primary">
          {iosHelp ? <Share className="h-4 w-4" /> : <Download className="h-4 w-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-sm font-extrabold leading-tight">
            Instalar Vera Deportes
          </p>
          <p className="mt-1 text-xs leading-snug text-muted-foreground">
            {iosHelp
              ? "En iPhone: toca Compartir y elegi Agregar a pantalla de inicio."
              : "Accede mas rapido desde tu pantalla de inicio."}
          </p>
          <div className="mt-3 flex items-center gap-2">
            {installPrompt && (
              <button
                type="button"
                onClick={install}
                className="inline-flex h-9 items-center justify-center rounded-full bg-primary px-4 text-xs font-extrabold text-primary-foreground"
              >
                Instalar
              </button>
            )}
            <button
              type="button"
              onClick={close}
              className="inline-flex h-9 items-center justify-center rounded-full border border-border px-4 text-xs font-bold text-foreground"
            >
              Ahora no
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={close}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-secondary hover:text-foreground"
          aria-label="Ocultar instalacion"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
