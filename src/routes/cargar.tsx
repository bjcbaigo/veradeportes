import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import { Camera, Upload, CheckCircle2, Loader2, LogOut, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { submitUpload, verifyUploadPin } from "@/lib/uploads.functions";
import { optimizeImage, formatBytes, type OptimizedImage } from "@/lib/image-optimize";

export const Route = createFileRoute("/cargar")({
  head: () => ({
    meta: [
      { title: "Cargar productos — Vera Deportes" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CargarPage,
});

const PIN_KEY = "vera_upload_pin_v1";

function CargarPage() {
  const [pin, setPin] = useState<string | null>(null);
  useEffect(() => {
    const v = sessionStorage.getItem(PIN_KEY);
    if (v) setPin(v);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Toaster richColors />
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-bold text-neutral-900">Carga de productos</h1>
            <p className="text-xs text-neutral-500">Vera Deportes — interno</p>
          </div>
          {pin && (
            <button
              onClick={() => { sessionStorage.removeItem(PIN_KEY); setPin(null); }}
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6">
        {!pin ? <PinGate onOk={(p) => { sessionStorage.setItem(PIN_KEY, p); setPin(p); }} /> : <UploadForm pin={pin} />}
      </main>
    </div>
  );
}

function PinGate({ onOk }: { onOk: (pin: string) => void }) {
  const verify = useServerFn(verifyUploadPin);
  const [pin, setPin] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!pin) return;
    setBusy(true);
    try {
      const res = await verify({ data: { pin } });
      if (!res.ok) { toast.error("PIN incorrecto"); return; }
      onOk(pin);
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-neutral-900">Ingresá el PIN</h2>
        <p className="mt-1 text-sm text-neutral-500">Pedí el PIN al administrador.</p>
      </div>
      <input
        type="password" inputMode="numeric" autoFocus
        value={pin} onChange={(e) => setPin(e.target.value)}
        placeholder="PIN" maxLength={20}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 text-base outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
      />
      <button type="submit" disabled={busy || !pin}
        className="w-full rounded-lg bg-orange-500 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60">
        {busy ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}

function UploadForm({ pin }: { pin: string }) {
  const submit = useServerFn(submitUpload);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [usuario, setUsuario] = useState(() => localStorage.getItem("vera_uploader") ?? "");
  const [marca, setMarca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [comentario, setComentario] = useState("");
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  function onPick(f: File | null) {
    setFile(f); setOk(false);
    setPreview(f ? URL.createObjectURL(f) : "");
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!file) { toast.error("Elegí una imagen"); return; }
    if (!usuario.trim()) { toast.error("Decinos tu nombre o alias"); return; }
    if (file.size > 12 * 1024 * 1024) { toast.error("Imagen demasiado grande (máx 12 MB)"); return; }

    setBusy(true);
    try {
      const buf = await file.arrayBuffer();
      const bytes = new Uint8Array(buf);
      let bin = "";
      const CHUNK = 0x8000;
      for (let i = 0; i < bytes.length; i += CHUNK) {
        bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
      }
      const b64 = btoa(bin);
      const mime = file.type || "image/jpeg";
      await submit({ data: {
        pin, usuario: usuario.trim(),
        marca: marca.trim(), categoria: categoria.trim(),
        comentario: comentario.trim(),
        filename: file.name || "foto.jpg",
        mime, dataBase64: b64,
      }});
      localStorage.setItem("vera_uploader", usuario.trim());
      setOk(true);
      setFile(null); setPreview(""); setMarca(""); setCategoria(""); setComentario("");
      if (fileRef.current) fileRef.current.value = "";
      toast.success("¡Imagen enviada!");
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <form onSubmit={send} className="space-y-5">
      {ok && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2.5 text-sm text-green-800">
          <CheckCircle2 className="h-4 w-4" /> Cargada. Subí otra cuando quieras.
        </div>
      )}

      <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4">
        {preview ? (
          <div className="space-y-3">
            <img src={preview} alt="" className="mx-auto max-h-72 w-auto rounded-lg object-contain" />
            <button type="button" onClick={() => fileRef.current?.click()}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50">
              Cambiar imagen
            </button>
          </div>
        ) : (
          <div className="grid gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-4 text-sm font-semibold text-white">
              <Camera className="h-4 w-4" /> Tomar / elegir foto
            </button>
            <p className="text-center text-xs text-neutral-500">JPG, PNG o WEBP — hasta 12 MB</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" capture="environment"
          className="hidden" onChange={(e) => onPick(e.target.files?.[0] ?? null)} />
      </div>

      <Field label="Tu nombre o alias" required>
        <input value={usuario} onChange={(e) => setUsuario(e.target.value)} maxLength={80}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
      </Field>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Marca (si la sabés)">
          <input value={marca} onChange={(e) => setMarca(e.target.value)} maxLength={80}
            placeholder="Ej: Nike"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </Field>
        <Field label="Categoría">
          <input value={categoria} onChange={(e) => setCategoria(e.target.value)} maxLength={80}
            placeholder="Ej: Zapatillas"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </Field>
      </div>

      <Field label="Comentario (opcional)">
        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={500} rows={3}
          placeholder="Talles, color, precio sugerido, lo que sepas…"
          className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
      </Field>

      <button type="submit" disabled={busy || !file}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando…</> : <><Upload className="h-4 w-4" /> Enviar</>}
      </button>
    </form>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {label} {required && <span className="text-orange-500">*</span>}
      </span>
      {children}
    </label>
  );
}
