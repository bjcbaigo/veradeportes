import { useEffect, useState } from "react";
import logo from "@/assets/splash-logo.png";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1100);
    const hideTimer = setTimeout(() => setVisible(false), 1500);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-black transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* Glow radial pulsante */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle, rgba(255,255,255,0.22) 0%, rgba(255,255,255,0.08) 35%, rgba(0,0,0,0) 70%)",
          animation: "splash-pulse 1.6s ease-in-out infinite",
        }}
      />
      {/* Barrido luminoso */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "linear-gradient(115deg, transparent 40%, rgba(255,255,255,0.12) 50%, transparent 60%)",
          backgroundSize: "200% 100%",
          animation: "splash-sweep 1.8s ease-in-out infinite",
        }}
      />

      <img
        src={logo}
        alt="Vera Deportes"
        className="relative z-10 h-56 w-56 sm:h-72 sm:w-72 object-contain animate-scale-in drop-shadow-[0_0_40px_rgba(255,255,255,0.45)]"
      />

      <style>{`
        @keyframes splash-pulse {
          0%, 100% { opacity: 0.55; transform: translate(-50%, -50%) scale(0.92); }
          50%      { opacity: 1;    transform: translate(-50%, -50%) scale(1.08); }
        }
        @keyframes splash-sweep {
          0%   { background-position: 200% 0; }
          100% { background-position: -100% 0; }
        }
      `}</style>
    </div>
  );
}
