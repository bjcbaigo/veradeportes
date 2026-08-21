import { useEffect, useState } from "react";
import {
  TALLE_RANGOS,
  detectTalleRango,
  splitTags,
  type TalleRango,
} from "@/lib/product-taxonomy";

/**
 * Selector de talles en dos pasos: primero el rango (Niños / Adultos),
 * después los talles disponibles (incluye medios talles: 35.5, 36.5…).
 */
export function TallesPicker({
  label = "Talles disponibles",
  value,
  onC,
}: {
  label?: string;
  value: string;
  onC: (x: string) => void;
}) {
  const [rango, setRango] = useState<TalleRango>(() => detectTalleRango(value));
  useEffect(() => {
    if (value) setRango(detectTalleRango(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = TALLE_RANGOS.find((r) => r.id === rango) ?? TALLE_RANGOS[1];
  const selected = splitTags(value);

  const toggle = (t: string) => {
    const next = selected.includes(t) ? selected.filter((x) => x !== t) : [...selected, t];
    next.sort((a, b) => Number(a) - Number(b));
    onC(next.join("|"));
  };

  return (
    <div>
      <div className="flex items-center justify-between gap-2">
        <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-600">
          {label}
        </span>
        {selected.length > 0 && (
          <button
            type="button"
            onClick={() => onC("")}
            className="text-[11px] font-medium text-neutral-500 underline hover:text-neutral-800"
          >
            Limpiar
          </button>
        )}
      </div>

      <div className="mt-1.5 inline-flex rounded-lg border border-neutral-300 bg-neutral-100 p-0.5">
        {TALLE_RANGOS.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRango(r.id)}
            className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
              rango === r.id ? "bg-white text-neutral-900 shadow-sm" : "text-neutral-500"
            }`}
          >
            {r.label} <span className="font-normal opacity-70">({r.hint})</span>
          </button>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {current.options.map((t) => {
          const on = selected.includes(t);
          const half = !Number.isInteger(Number(t));
          return (
            <button
              key={t}
              type="button"
              onClick={() => toggle(t)}
              className={`min-w-[52px] rounded-full border px-2.5 py-1.5 text-sm font-medium transition ${
                on
                  ? "border-orange-500 bg-orange-500 text-white"
                  : half
                    ? "border-dashed border-neutral-300 bg-white text-neutral-500 hover:bg-neutral-50"
                    : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {t}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onC(current.options.filter((t) => Number.isInteger(Number(t))).join("|"))}
          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Todos los enteros
        </button>
        <button
          type="button"
          onClick={() => onC(current.options.join("|"))}
          className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-[11px] font-medium text-neutral-700 hover:bg-neutral-50"
        >
          Todo el rango
        </button>
        <span className="text-[11px] text-neutral-500">
          {selected.length > 0 ? `${selected.length} seleccionados: ${selected.join(" · ")}` : "Sin talles marcados"}
        </span>
      </div>
    </div>
  );
}
