import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Lock } from "lucide-react";

const PRIVATE_PIN = "1974";
const PRIVATE_KEY = "vd-private-preview";

export function hasPrivateAccess() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PRIVATE_KEY) === "1";
}

export function PrivateAccess() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [already, setAlready] = useState(false);

  useEffect(() => {
    setAlready(hasPrivateAccess());
  }, []);

  function go() {
    navigate({ to: "/tienda" });
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (pin.trim() === PRIVATE_PIN) {
      window.localStorage.setItem(PRIVATE_KEY, "1");
      setOpen(false);
      go();
    } else {
      setError(true);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => (already ? go() : setOpen(true))}
        aria-label="Acceso privado"
        className="inline-flex items-center gap-2 rounded-full border border-black/15 bg-black/5 px-3 py-1.5 text-[11px] font-semibold tracking-wide text-neutral-500 backdrop-blur transition hover:text-[#FF4B00] dark:border-white/15 dark:bg-white/5 dark:text-neutral-400"
      >
        <Lock className="h-3.5 w-3.5" />
        {already ? "Vista privada" : "Acceso privado"}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-5 backdrop-blur-sm">
          <form
            onSubmit={submit}
            className="w-full max-w-xs rounded-2xl bg-white p-5 text-left shadow-xl dark:bg-neutral-900"
          >
            <h2 className="font-display text-lg font-bold uppercase">Acceso privado</h2>
            <p className="mt-1 text-xs text-neutral-500 dark:text-neutral-400">
              Ingresá el PIN para ver la tienda mientras seguimos cargando productos.
            </p>
            <input
              autoFocus
              inputMode="numeric"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              placeholder="PIN"
              className="mt-4 w-full rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-[#FF4B00] dark:border-white/20"
            />
            {error && <p className="mt-2 text-xs font-semibold text-red-500">PIN incorrecto.</p>}
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-black/15 px-3 py-2 text-sm font-semibold dark:border-white/20"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 rounded-lg bg-[#FF4B00] px-3 py-2 text-sm font-bold text-white"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
