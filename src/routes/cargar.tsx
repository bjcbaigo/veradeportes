import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, useRef, useEffect } from "react";
import {
  Camera, Upload, CheckCircle2, Loader2, LogOut, Sparkles, ShieldCheck,
  ChevronLeft, ChevronRight, Check, Pencil,
} from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { submitUpload, verifyUploadPin } from "@/lib/uploads.functions";
import { optimizeImage, formatBytes, type OptimizedImage } from "@/lib/image-optimize";
import {
  IDEAL_PARA_OPTIONS,
  SELLOS_OPTIONS,
  splitTags,
} from "@/lib/product-taxonomy";
import { TallesPicker } from "@/components/TallesPicker";


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
    <div className="min-h-screen bg-neutral-50">
      <Toaster richColors />
      <header className="bg-vd-navy">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-4">
          <div>
            <h1 className="text-lg font-extrabold tracking-tight text-primary-foreground">Carga de productos</h1>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-primary-foreground/50">
              Vera Deportes — interno
            </p>
          </div>
          {pin && (
            <button
              onClick={() => { sessionStorage.removeItem(PIN_KEY); setPin(null); }}
              className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-primary-foreground/70 hover:bg-white/10"
            >
              <LogOut className="h-3.5 w-3.5" /> Salir
            </button>
          )}
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-6">
        {!pin ? <PinGate onOk={(p) => { sessionStorage.setItem(PIN_KEY, p); setPin(p); }} /> : <UploadWizard pin={pin} />}
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
        <h2 className="text-base font-semibold text-vd-navy">Ingresá el PIN</h2>
        <p className="mt-1 text-sm text-neutral-500">Pedí el PIN al administrador.</p>
      </div>
      <input
        type="password" inputMode="numeric" autoFocus
        value={pin} onChange={(e) => setPin(e.target.value)}
        placeholder="PIN" maxLength={20}
        className="w-full rounded-lg border border-neutral-300 px-3 py-3 text-base outline-none focus:border-primary focus:ring-2 focus:ring-primary/25"
      />
      <button type="submit" disabled={busy || !pin}
        className="w-full rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-60">
        {busy ? "Verificando…" : "Entrar"}
      </button>
    </form>
  );
}

/* ============ Asistente paso a paso ============ */
const STEP_LABELS = ["Fotos", "Datos", "Detalles", "Confirmar"] as const;

function UploadWizard({ pin }: { pin: string }) {
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
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);

  function goTo(n: number) {
    setStep(n);
    setMaxStep((m) => Math.max(m, n));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const canNext =
    step === 0 ? items.length > 0 && !optimizing
    : step === 1 ? usuario.trim() !== ""
    : true;

  async function onPick(files: FileList | null) {
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

  async function send() {
    if (items.length === 0) { toast.error("Elegí al menos una imagen"); goTo(0); return; }
    if (!usuario.trim()) { toast.error("Decinos tu nombre o alias"); goTo(1); return; }

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

  /* ----- Pantalla de éxito ----- */
  if (ok > 0) {
    return (
      <div className="space-y-4 rounded-2xl border border-green-200 bg-white p-6 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-green-600" />
        <div>
          <p className="text-lg font-bold text-vd-navy">
            {ok === 1 ? "¡Foto enviada!" : `¡${ok} fotos enviadas!`}
          </p>
          <p className="mt-1 text-sm text-neutral-500">
            El administrador ya las puede revisar y publicar.
          </p>
        </div>
        <div className="grid gap-2">
          <button type="button" onClick={() => { setOk(0); goTo(0); }}
            className="flex items-center justify-center gap-2 rounded-lg bg-primary px-3 py-3 text-sm font-bold text-primary-foreground hover:brightness-110">
            <Camera className="h-4 w-4" /> Cargar otro producto
          </button>
          <Link to="/admin-cargas"
            className="flex items-center justify-center gap-2 rounded-lg bg-vd-navy px-3 py-3 text-sm font-bold text-primary-foreground hover:bg-vd-navy-2">
            <ShieldCheck className="h-4 w-4" /> Ir a revisar (admin)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Stepper step={step} maxStep={maxStep} onGo={goTo} />

      <div className="rounded-2xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5">
        {step === 0 && (
          <section className="space-y-3">
            <PanelHead
              title="Fotos del producto"
              hint="Podés elegir varias a la vez. Se optimizan solas antes de subir."
            />
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
                        <button type="button" onClick={() => removeAt(i)}
                          className="absolute right-1 top-1 rounded-full bg-vd-navy/80 px-1.5 py-0.5 text-[10px] font-bold text-primary-foreground hover:bg-vd-navy">
                          ✕
                        </button>
                        <div className="absolute bottom-1 left-1 rounded bg-vd-navy/70 px-1 py-0.5 text-[10px] font-medium text-primary-foreground">
                          {i + 1}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-600">
                    <Sparkles className="h-3.5 w-3.5 text-primary" />
                    <span>
                      {items.length} foto{items.length > 1 ? "s" : ""} · {formatBytes(totalOriginal)} → <strong className="text-vd-navy">{formatBytes(totalOptimized)}</strong>
                    </span>
                  </div>
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm font-medium hover:bg-neutral-50">
                    + Agregar más fotos
                  </button>
                </div>
              ) : !optimizing && (
                <div className="grid gap-2">
                  <button type="button" onClick={() => fileRef.current?.click()}
                    className="flex items-center justify-center gap-2 rounded-lg bg-vd-navy px-4 py-4 text-sm font-semibold text-primary-foreground hover:bg-vd-navy-2">
                    <Camera className="h-4 w-4" /> Tomar / elegir fotos
                  </button>
                  <p className="text-center text-xs text-neutral-500">Sacá la foto con fondo claro y buena luz.</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" multiple
                className="hidden" onChange={(e) => onPick(e.target.files)} />
            </div>
          </section>
        )}

        {step === 1 && (
          <section className="space-y-4">
            <PanelHead
              title="Datos básicos"
              hint="Solo tu nombre es obligatorio; lo demás, si lo sabés."
            />
            <Field label="Tu nombre o alias" required>
              <input value={usuario} onChange={(e) => setUsuario(e.target.value)} maxLength={80}
                className={inputCls} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Marca">
                <input value={marca} onChange={(e) => setMarca(e.target.value)} maxLength={80}
                  placeholder="Ej: Nike" className={inputCls} />
              </Field>
              <Field label="Categoría">
                <input value={categoria} onChange={(e) => setCategoria(e.target.value)} maxLength={80}
                  placeholder="Ej: Zapatillas" className={inputCls} />
              </Field>
              <Field label="Modelo">
                <input value={modelo} onChange={(e) => setModelo(e.target.value)} maxLength={120}
                  placeholder="Ej: Gel-Challenger 14" className={inputCls} />
              </Field>
              <Field label="Color">
                <input value={color} onChange={(e) => setColor(e.target.value)} maxLength={80}
                  placeholder="Ej: Negro / blanco" className={inputCls} />
              </Field>
            </div>
          </section>
        )}

        {step === 2 && (
          <section className="space-y-4">
            <PanelHead
              title="Talles y sellos"
              hint="Todo opcional, pero ayuda a vender mejor en la tienda."
            />
            <ChipPicker label="Ideal para" options={IDEAL_PARA_OPTIONS} value={idealPara} onC={setIdealPara} />
            <ChipPicker label="Sellos" options={SELLOS_OPTIONS} value={sellos} onC={setSellos} />
            <TallesPicker value={talles} onC={setTalles} />
            <Field label="Comentario para el admin">
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={500} rows={3}
                placeholder="Precio sugerido, estado del producto, lo que sepas…"
                className={`${inputCls} resize-none`} />
            </Field>
          </section>
        )}

        {step === 3 && (
          <section className="space-y-4">
            <PanelHead
              title="Confirmá antes de enviar"
              hint="Revisá que esté todo bien. Podés tocar cualquier sección para corregir."
            />
            <div className="space-y-1 overflow-hidden rounded-xl border border-neutral-200">
              <SummaryRow label={`Fotos (${items.length})`} onEdit={() => goTo(0)}>
                <div className="flex gap-1.5 overflow-x-auto py-0.5">
                  {items.map((it, i) => (
                    <img key={i} src={it.previewUrl} alt="" className="h-12 w-12 shrink-0 rounded-md border border-neutral-200 object-cover" />
                  ))}
                </div>
              </SummaryRow>
              <SummaryRow label="Cargado por" value={usuario || "—"} onEdit={() => goTo(1)} />
              <SummaryRow label="Producto"
                value={[marca, modelo].filter(Boolean).join(" ") || "—"}
                sub={[categoria, color].filter(Boolean).join(" · ")} onEdit={() => goTo(1)} />
              <SummaryRow label="Ideal para" value={splitTags(idealPara).join(", ") || "—"} onEdit={() => goTo(2)} />
              <SummaryRow label="Sellos" value={splitTags(sellos).join(", ") || "—"} onEdit={() => goTo(2)} />
              <SummaryRow label="Talles" value={splitTags(talles).join(", ") || "Sin marcar"} onEdit={() => goTo(2)} />
              {comentario.trim() && (
                <SummaryRow label="Comentario" value={comentario.trim()} onEdit={() => goTo(2)} />
              )}
            </div>
          </section>
        )}
      </div>

      {/* Navegación del asistente */}
      <div className="mt-4 flex gap-2">
        {step > 0 && (
          <button type="button" onClick={() => goTo(step - 1)} disabled={busy}
            className="inline-flex items-center gap-1 rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">
            <ChevronLeft className="h-4 w-4" /> Atrás
          </button>
        )}
        {step < 3 ? (
          <button type="button" onClick={() => canNext && goTo(step + 1)} disabled={!canNext}
            className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary px-4 py-3 text-sm font-bold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-50">
            Continuar <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button type="button" onClick={send} disabled={busy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3.5 text-base font-bold text-primary-foreground shadow-sm transition hover:brightness-110 disabled:opacity-60">
            {busy
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Enviando {progress?.done ?? 0}/{progress?.total ?? items.length}…</>
              : <><Upload className="h-4 w-4" /> Enviar {items.length > 0 ? `(${items.length})` : ""}</>}
          </button>
        )}
      </div>
      {step === 1 && !usuario.trim() && (
        <p className="mt-2 text-center text-xs text-neutral-500">Completá tu nombre para continuar.</p>
      )}
    </div>
  );
}

const inputCls =
  "w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";

function PanelHead({ title, hint }: { title: string; hint: string }) {
  return (
    <div>
      <h2 className="text-base font-bold text-vd-navy">{title}</h2>
      <p className="mt-0.5 text-xs text-neutral-500">{hint}</p>
    </div>
  );
}

function SummaryRow({
  label, value, sub, onEdit, children,
}: {
  label: string; value?: string; sub?: string;
  onEdit: () => void; children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 bg-neutral-50 px-3 py-2.5 odd:bg-white">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</p>
        {children ?? (
          <>
            <p className="truncate text-sm font-medium text-vd-navy">{value}</p>
            {sub && <p className="truncate text-xs text-neutral-500">{sub}</p>}
          </>
        )}
      </div>
      <button type="button" onClick={onEdit}
        className="shrink-0 rounded-md p-1.5 text-neutral-400 hover:bg-neutral-200 hover:text-vd-navy">
        <Pencil className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Stepper({ step, maxStep, onGo }: { step: number; maxStep: number; onGo: (n: number) => void }) {
  return (
    <ol className="mb-5 flex items-start">
      {STEP_LABELS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        const reachable = i <= maxStep;
        return (
          <li key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && <div className={`h-0.5 flex-1 ${i <= step ? "bg-primary" : "bg-neutral-200"}`} />}
              <button type="button" disabled={!reachable} onClick={() => reachable && onGo(i)}
                aria-label={`Paso ${i + 1}: ${label}`}
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full text-xs font-bold transition disabled:cursor-not-allowed ${
                  current
                    ? "bg-vd-navy text-primary-foreground ring-4 ring-vd-navy/15"
                    : done
                      ? "bg-primary text-primary-foreground hover:brightness-110"
                      : "bg-neutral-200 text-neutral-500"
                }`}>
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </button>
              {i < STEP_LABELS.length - 1 && (
                <div className={`h-0.5 flex-1 ${i < step ? "bg-primary" : "bg-neutral-200"}`} />
              )}
            </div>
            <span className={`mt-1.5 text-[10px] font-semibold uppercase tracking-wide ${
              current ? "text-vd-navy" : done ? "text-primary" : "text-neutral-400"
            }`}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-600">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      {children}
    </label>
  );
}

function ChipPicker({
  label,
  options,
  value,
  onC,
}: {
  label: string;
  options: readonly string[];
  value: string;
  onC: (x: string) => void;
}) {
  const selected = splitTags(value);
  const toggle = (tag: string) => {
    const next = selected.includes(tag) ? selected.filter((t) => t !== tag) : [...selected, tag];
    onC(next.join("|"));
  };
  return (
    <div>
      <span className="block text-xs font-semibold uppercase tracking-wide text-neutral-600">{label}</span>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {options.map((tag) => {
          const on = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                on
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50"
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>
    </div>
  );
}
