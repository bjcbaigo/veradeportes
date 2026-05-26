import { useEffect, useState } from "react";
import logo from "@/assets/splash-logo.png";

export function SplashScreen() {
  const [visible, setVisible] = useState(true);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFading(true), 700);
    const hideTimer = setTimeout(() => setVisible(false), 1000);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-black transition-opacity duration-300 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <img
        src={logo}
        alt="Vera Deportes"
        className="h-56 w-56 sm:h-72 sm:w-72 object-contain animate-scale-in"
      />
    </div>
  );
}
