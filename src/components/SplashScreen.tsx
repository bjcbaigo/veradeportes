import { useEffect, useState } from "react";
import logo from "@/assets/logo-vera.png";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 1700);
    const hideTimer = setTimeout(() => setVisible(false), 2200);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background/70 backdrop-blur-xl transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={logo}
        alt="Vera Deportes"
        className="h-32 w-32 sm:h-40 sm:w-40 object-contain animate-scale-in drop-shadow-2xl"
      />
    </div>
  );
}
