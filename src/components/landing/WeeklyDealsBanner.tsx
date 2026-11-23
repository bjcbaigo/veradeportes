import { useEffect, useState } from "react";
import { Flame } from "lucide-react";

function nextSundayEnd(now: Date) {
  const d = new Date(now);
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7));
  d.setHours(23, 59, 59, 0);
  return d;
}

export function WeeklyDealsBanner() {
  const [left, setLeft] = useState<number | null>(null);
  useEffect(() => {
    const tick = () => setLeft(Math.max(0, nextSundayEnd(new Date()).getTime() - Date.now()));
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const s = Math.floor((left ?? 0) / 1000);
  const parts = [
    [Math.floor(s / 86400), "días"],
    [Math.floor((s % 86400) / 3600), "hs"],
    [Math.floor((s % 3600) / 60), "min"],
    [s % 60, "seg"],
  ] as const;
  return (
    <section className="bg-background pt-4 sm:pt-8">
      <div className="mx-auto max-w-6xl px-3 sm:px-4 xl:max-w-7xl xl:px-6">
        <a href="/ofertas" className="flex flex-col gap-3 rounded-lg bg-ink px-4 py-3 text-ink-foreground shadow-md sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <div className="flex items-center gap-3">
            <Flame className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="font-display text-base font-black uppercase sm:text-2xl">Ofertas de la semana</p>
              <p className="text-[11px] text-ink-foreground/75 sm:text-sm">Terminan el domingo a la noche · Ver todas</p>
            </div>
          </div>
          <div className="flex gap-1.5" aria-label="Tiempo restante">
            {parts.map(([v, l]) => (
              <span key={l} className="min-w-[52px] rounded-md bg-primary px-2 py-1 text-center text-primary-foreground">
                <span className="block font-display text-lg font-black leading-none tabular-nums">{left === null ? "--" : String(v).padStart(2, "0")}</span>
                <span className="text-[9px] font-bold uppercase">{l}</span>
              </span>
            ))}
          </div>
        </a>
      </div>
    </section>
  );
}
