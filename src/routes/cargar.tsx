import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import { Camera, Upload, CheckCircle2, Loader2, LogOut, Sparkles, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { submitUpload, verifyUploadPin } from "@/lib/uploads.functions";
import { optimizeImage, formatBytes, type OptimizedImage } from "@/lib/image-optimize";
import {
  IDEAL_PARA_OPTIONS,
  SELLOS_OPTIONS,
  TALLES_CALZADO_OPTIONS,
  splitTags,
} from "@/lib/product-taxonomy";

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
  const [items, setItems] = useState<OptimizedImage[]>([]);
  const [optimizing, setOptimizing] = useState(false);
  const [usuario, setUsuario] = useState(() => localStorage.getItem("vera_uploader") ?? "");
  const [marca, setMarca] = useState("");
  const [categoria, setCategoria] = useState("");
  const [modelo, setModelo] = useState("");
  const [color, setColor] = useState("");
  const [idealPara, setIdealPara] = useState("");
  const [sellos, setSellos] = useState("");
  const [talles, setTalles] = useState("");
  const [comentario, setComentario] = useState("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [ok, setOk] = useState<number>(0);

  async function onPick(files: FileList | null) {
    setOk(0);
    if (!files || files.length === 0) return;
    setOptimizing(true);
    try {
      const results: OptimizedImage[] = [];
      for (const f of Array.from(files)) {
        try {
          results.push(await optimizeImage(f));
        } catch (err) {
          toast.error(`No se pudo procesar ${f.name}: ${(err as Error).message}`);
        }
      }
      setItems((prev) => [...prev, ...results]);
    } finally {
      setOptimizing(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    setItems((prev) => {
      const copy = [...prev];
      const [gone] = copy.splice(i, 1);
      if (gone) URL.revokeObjectURL(gone.previewUrl);
      return copy;
    });
  }

  async function toBase64(file: File) {
    const buf = await file.arrayBuffer();
    const bytes = new Uint8Array(buf);
    let bin = "";
    const CHUNK = 0x8000;
    for (let i = 0; i < bytes.length; i += CHUNK) {
      bin += String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK)));
    }
    return btoa(bin);
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (items.length === 0) { toast.error("Elegí al menos una imagen"); return; }
    if (!usuario.trim()) { toast.error("Decinos tu nombre o alias"); return; }

    setBusy(true);
    setProgress({ done: 0, total: items.length });
    const grupo = items.length > 1 ? `G-${Date.now().toString(36)}` : "";
    const comBase = comentario.trim();
    let enviadas = 0;
    try {
      for (let i = 0; i < items.length; i++) {
        const it = items[i];
        const b64 = await toBase64(it.file);
        const com = grupo
          ? `[${grupo} · ${i + 1}/${items.length}]${comBase ? " " + comBase : ""}`
          : comBase;
        await submit({ data: {
          pin, usuario: usuario.trim(),
          marca: marca.trim(), categoria: categoria.trim(),
          modelo: modelo.trim(), color: color.trim(),
          idealPara: idealPara.trim(), sellos: sellos.trim(), talles: talles.trim(),
          comentario: com,
          filename: it.file.name,
          mime: "image/jpeg", dataBase64: b64,
        }});
        enviadas++;
        setProgress({ done: enviadas, total: items.length });
      }
      localStorage.setItem("vera_uploader", usuario.trim());
      items.forEach((it) => URL.revokeObjectURL(it.previewUrl));
      setItems([]); setMarca(""); setCategoria(""); setComentario("");
      setModelo(""); setColor(""); setIdealPara(""); setSellos(""); setTalles("");
      setOk(enviadas);
      toast.success(enviadas === 1 ? "¡Foto enviada!" : `¡${enviadas} fotos enviadas!`);
    } catch (err) {
      toast.error(`Falló en la foto ${enviadas + 1}: ${(err as Error).message}`);
    } finally {
      setBusy(false);
      setProgress(null);
    }
  }

  const totalOriginal = items.reduce((a, b) => a + b.originalBytes, 0);
  const totalOptimized = items.reduce((a, b) => a + b.optimizedBytes, 0);

  return (
    <form onSubmit={send} className="space-y-5">
      {ok > 0 && (
        <div className="space-y-2 rounded-xl border border-green-200 bg-green-50 p-3">
          <div className="flex items-center gap-2 text-sm font-medium text-green-800">
            <CheckCircle2 className="h-4 w-4" />
            {ok === 1 ? "¡Foto enviada!" : `¡${ok} fotos enviadas!`} Ya las puede revisar el admin.
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => { setOk(0); fileRef.current?.click(); }}
              className="flex items-center justify-center gap-2 rounded-lg bg-green-600 px-3 py-2.5 text-sm font-bold text-white hover:bg-green-700">
              <Camera className="h-4 w-4" /> Subir más
            </button>
            <Link to="/admin-cargas"
              className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-3 py-2.5 text-sm font-bold text-white hover:bg-neutral-800">
              <ShieldCheck className="h-4 w-4" /> Ir a revisar
            </Link>
          </div>
        </div>
      )}

      <div className="rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 p-4">
        {optimizing && (
          <div className="mb-3 flex items-center justify-center gap-2 py-3 text-sm text-neutral-600">
            <Loader2 className="h-4 w-4 animate-spin" /> Optimizando…
          </div>
        )}

        {items.length > 0 ? (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {items.map((it, i) => (
                <div key={i} className="relative">
                  <img src={it.previewUrl} alt="" className="h-24 w-full rounded-lg object-cover" />
                  <button type="button" onClick={() => removeAt(i)} disabled={busy}
                    className="absolute right-1 top-1 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] font-bold text-white hover:bg-black">
                    ✕
                  </button>
                  <div className="absolute bottom-1 left-1 rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium text-white">
                    {i + 1}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600">
              <Sparkles className="h-3.5 w-3.5 text-orange-500" />
              <span>
                {items.length} foto{items.length > 1 ? "s" : ""} · {formatBytes(totalOriginal)} → <strong className="text-neutral-900">{formatBytes(totalOptimized)}</strong>
              </span>
            </div>
            <button type="button" onClick={() => fileRef.current?.click()} disabled={busy}
              className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-60">
              + Agregar más fotos
            </button>
          </div>
        ) : !optimizing && (
          <div className="grid gap-2">
            <button type="button" onClick={() => fileRef.current?.click()}
              className="flex items-center justify-center gap-2 rounded-lg bg-neutral-900 px-4 py-4 text-sm font-semibold text-white">
              <Camera className="h-4 w-4" /> Tomar / elegir fotos
            </button>
            <p className="text-center text-xs text-neutral-500">Podés elegir varias a la vez. Se optimizan automáticamente.</p>
          </div>
        )}
        <input ref={fileRef} type="file" accept="image/*" multiple
          className="hidden" onChange={(e) => onPick(e.target.files)} />
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
        <Field label="Modelo">
          <input value={modelo} onChange={(e) => setModelo(e.target.value)} maxLength={120}
            placeholder="Ej: Gel-Challenger 14"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </Field>
        <Field label="Color">
          <input value={color} onChange={(e) => setColor(e.target.value)} maxLength={80}
            placeholder="Ej: Negro / blanco"
            className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
        </Field>
      </div>

      <ChipPicker label="Ideal para (opcional)" options={IDEAL_PARA_OPTIONS} value={idealPara} onC={setIdealPara} />
      <ChipPicker label="Sellos (opcional)" options={SELLOS_OPTIONS} value={sellos} onC={setSellos} />
      <ChipPicker label="Talles disponibles (opcional)" options={TALLES_CALZADO_OPTIONS} value={talles} onC={setTalles} />

      <Field label="Comentario (opcional)">
        <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={500} rows={3}
          placeholder="Talles, color, precio sugerido, lo que sepas…"
          className="w-full resize-none rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
      </Field>

      <button type="submit" disabled={busy || items.length === 0 || optimizing}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-orange-500 px-4 py-3.5 text-base font-bold text-white shadow-sm transition hover:bg-orange-600 disabled:opacity-60">
        {busy
          ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando {progress?.done ?? 0}/{progress?.total ?? items.length}…</>
          : <><Upload className="h-4 w-4" /> Enviar {items.length > 0 ? `(${items.length})` : ""}</>}
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
