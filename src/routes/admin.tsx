import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Settings, LayoutGrid, Tag, ShoppingBag, Save, CheckCircle, AlertCircle,
  Plus, Trash2, ChevronDown, ImagePlus, Info, Package, Eye, EyeOff, Star,
  Menu, X, KeyRound, Loader2, Search,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  listSheetProducts,
  updateSheetProduct,
  type SheetProduct,
} from "@/lib/sheet-products.functions";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "CMS — Vera Deportes" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

/* ============================================================
   CMS-scoped design tokens (don't leak into public site)
============================================================ */
const cmsStyles = `
.cms-root {
  --cms-primary: #0D2B6E;
  --cms-primary-hover: #1A3D8F;
  --cms-accent: #29B8D8;
  --cms-accent-light: #E6F7FB;
  --cms-accent-mid: #B3E8F4;
  --cms-accent-dark: #1A8FAA;
  --cms-bg: #F4F7FC;
  --cms-surface: #FFFFFF;
  --cms-surface2: #F0F4FA;
  --cms-surface3: #E5EAF4;
  --cms-border: #D8E0EF;
  --cms-text: #0D1B3E;
  --cms-text-muted: #4A5A78;
  --cms-text-dim: #7A8CAA;
  --cms-success: #12A064;
  --cms-success-bg: #E6F8F1;
  --cms-error: #D9344A;
  --cms-error-bg: #FEE8EC;
  --cms-warning: #D97B14;
  --cms-warning-bg: #FEF3E2;
  --cms-shadow-sm: 0 1px 2px rgba(13,27,62,0.05);
  --cms-shadow: 0 4px 12px rgba(13,27,62,0.08);
  font-family: "Plus Jakarta Sans", system-ui, sans-serif;
  color: var(--cms-text);
  background: var(--cms-bg);
}
.cms-root *:focus-visible { outline: 2px solid var(--cms-accent); outline-offset: 2px; border-radius: 6px; }
.cms-mono { font-family: "JetBrains Mono", ui-monospace, monospace; }
.cms-fade { animation: cmsFade .2s ease both; }
@keyframes cmsFade { from { opacity:0; transform: translateY(4px);} to {opacity:1; transform:none;} }
.cms-accordion-body { display: grid; grid-template-rows: 0fr; transition: grid-template-rows .2s ease; }
.cms-accordion-body.open { grid-template-rows: 1fr; }
.cms-accordion-body > div { overflow: hidden; }
`;

type PageId = "config" | "cats" | "marcas" | "prods";

function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Awaited<ReturnType<typeof supabase.auth.getSession>>["data"]["session"] | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: cmsStyles }} />
      <div className="cms-root min-h-screen">
        <Toaster />
        {loading ? (
          <div className="flex min-h-screen items-center justify-center text-sm" style={{ color: "var(--cms-text-muted)" }}>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cargando…
          </div>
        ) : session ? (
          <Shell onLogout={() => supabase.auth.signOut()} />
        ) : (
          <LoginForm />
        )}
      </div>
    </>
  );
}

/* ============================================================
   Login
============================================================ */
function LoginForm() {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Revisá tu email para confirmar.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally { setBusy(false); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-5 rounded-2xl p-7 cms-fade"
        style={{ background: "var(--cms-surface)", border: "1px solid var(--cms-border)", boxShadow: "var(--cms-shadow)" }}>
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold"
            style={{ background: "var(--cms-accent)", color: "var(--cms-primary)" }}>VD</div>
          <div>
            <h1 className="text-[17px] font-bold">Vera Deportes</h1>
            <p className="text-[11px]" style={{ color: "var(--cms-text-muted)" }}>Gestión de contenido</p>
          </div>
        </div>
        <Field label="Email">
          <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="cms-input" />
        </Field>
        <Field label="Contraseña">
          <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="cms-input" />
        </Field>
        <button type="submit" disabled={busy} className="w-full rounded-[10px] py-2.5 text-sm font-semibold text-white transition-colors"
          style={{ background: "var(--cms-primary)" }}>
          {busy ? "…" : mode === "login" ? "Ingresar" : "Crear cuenta"}
        </button>
        <button type="button" className="w-full text-xs hover:underline" style={{ color: "var(--cms-text-muted)" }}
          onClick={() => setMode(mode === "login" ? "signup" : "login")}>
          {mode === "login" ? "¿No tenés cuenta? Registrate" : "Ya tengo cuenta"}
        </button>
        <style>{`.cms-input{width:100%;background:var(--cms-surface2);border:1.5px solid var(--cms-border);border-radius:10px;padding:10px 12px;font-size:13px;color:var(--cms-text);transition:.15s}.cms-input:focus{outline:none;border-color:var(--cms-accent);box-shadow:0 0 0 3px rgba(41,184,216,.15);background:#fff}`}</style>
      </form>
    </div>
  );
}

function Field({ label, required, hint, error, children }: { label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1.5">
      <span className="block text-[12px] font-bold uppercase tracking-[0.7px]" style={{ color: "var(--cms-text-muted)" }}>
        {label} {required && <span style={{ color: "var(--cms-error)" }}>*</span>}
      </span>
      {children}
      {error ? (
        <span className="block text-[11px]" style={{ color: "var(--cms-error)" }}>{error}</span>
      ) : hint ? (
        <span className="block text-[12px] leading-[1.5]" style={{ color: "var(--cms-text-dim)" }}>{hint}</span>
      ) : null}
    </label>
  );
}

/* ============================================================
   Shell (sidebar + topbar + pages)
============================================================ */
const NAV: { id: PageId; label: string; icon: typeof Settings; title: string; subtitle: string; step: number }[] = [
  { id: "config", label: "Configuración", icon: Settings,    title: "Configuración del sitio", subtitle: "Datos de contacto, redes y branding", step: 1 },
  { id: "cats",   label: "Categorías",    icon: LayoutGrid,  title: "Categorías",              subtitle: "Organizá el catálogo por rubro",    step: 2 },
  { id: "marcas", label: "Marcas",        icon: Tag,         title: "Marcas",                  subtitle: "Marcas disponibles en el comercio", step: 3 },
  { id: "prods",  label: "Productos",     icon: ShoppingBag, title: "Productos",               subtitle: "Editá precios, fotos y descripción", step: 4 },
];

type SaveStatus = "idle" | "saving" | "success";

function Shell({ onLogout }: { onLogout: () => void }) {
  const [page, setPage] = useState<PageId>("prods");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [connected] = useState(true);
  const saveHandlerRef = useRef<() => Promise<void> | void>(() => {});

  const current = NAV.find((n) => n.id === page)!;

  async function handleSave() {
    setSaveStatus("saving");
    try {
      await saveHandlerRef.current();
      setSaveStatus("success");
      setDirty(false);
      setTimeout(() => setSaveStatus("idle"), 2500);
    } catch (e) {
      toast.error((e as Error).message);
      setSaveStatus("idle");
    }
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar page={page} setPage={(p) => { setPage(p); setMobileOpen(false); }} onLogout={onLogout}
        connected={connected} mobileOpen={mobileOpen} closeMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col md:ml-[260px]">
        <Topbar current={current} dirty={dirty} saveStatus={saveStatus} onSave={handleSave} onMenu={() => setMobileOpen(true)} />

        <main className="flex-1 p-4 md:p-7 lg:p-8 pb-24 md:pb-8">
          <div key={page} className="cms-fade mx-auto max-w-4xl">
            <PageHeader current={current} />
            {page === "config" && <ConfigPage onDirty={() => setDirty(true)} registerSave={(fn) => (saveHandlerRef.current = fn)} />}
            {page === "cats"   && <CategoriesPage onDirty={() => setDirty(true)} registerSave={(fn) => (saveHandlerRef.current = fn)} />}
            {page === "marcas" && <BrandsPage     onDirty={() => setDirty(true)} registerSave={(fn) => (saveHandlerRef.current = fn)} />}
            {page === "prods"  && <ProductsPage   onDirty={() => setDirty(true)} registerSave={(fn) => (saveHandlerRef.current = fn)} />}
          </div>
        </main>

        <MobileBottomNav page={page} setPage={setPage} />
      </div>
    </div>
  );
}

/* ============================================================
   Sidebar
============================================================ */
function Sidebar({ page, setPage, onLogout, connected, mobileOpen, closeMobile }:
  { page: PageId; setPage: (p: PageId) => void; onLogout: () => void; connected: boolean; mobileOpen: boolean; closeMobile: () => void }) {
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const inner = (
    <aside className="flex h-full w-[260px] flex-col" style={{ background: "var(--cms-primary)", color: "#fff" }}>
      <div className="flex items-center justify-between px-5 pt-5 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl text-sm font-bold"
            style={{ background: "var(--cms-accent)", color: "var(--cms-primary)" }}>VD</div>
          <div>
            <div className="text-[15px] font-bold leading-tight">Vera Deportes</div>
            <div className="text-[11px]" style={{ color: "rgba(255,255,255,.75)" }}>Gestión de contenido</div>
          </div>
        </div>
        <button onClick={closeMobile} aria-label="Cerrar menú" className="md:hidden rounded-md p-1.5 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav role="menu" aria-label="Secciones" className="flex-1 space-y-1 px-3 pt-2">
        {NAV.map((n) => {
          const active = page === n.id;
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              role="menuitem"
              aria-current={active ? "page" : undefined}
              onClick={() => setPage(n.id)}
              className={cn(
                "group flex w-full items-center gap-3 rounded-[10px] px-3 py-2.5 text-left text-[13px] font-medium transition-colors",
                active ? "" : "hover:bg-white/8",
              )}
              style={
                active
                  ? { background: "rgba(41,184,216,.18)", color: "#fff", boxShadow: "inset 3px 0 0 var(--cms-accent)" }
                  : { color: "rgba(255,255,255,.75)" }
              }
            >
              <span className="grid h-7 w-7 place-items-center rounded-[8px]"
                style={{ background: active ? "var(--cms-accent)" : "rgba(255,255,255,.08)", color: active ? "var(--cms-primary)" : "#fff" }}>
                <Icon className="h-[15px] w-[15px]" />
              </span>
              <span className="flex-1">{n.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="px-4 py-4 space-y-3" style={{ borderTop: "1px solid rgba(255,255,255,.08)" }}>
        <div className="flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2" style={{ color: "rgba(255,255,255,.75)" }}>
            <span className="inline-block h-1.5 w-1.5 rounded-full"
              style={{ background: connected ? "var(--cms-success)" : "var(--cms-error)" }} />
            {connected ? "Conectado" : "Sin conexión"}
          </div>
          <button onClick={() => setAdvancedOpen(true)} aria-label="Configuración avanzada"
            className="rounded-md p-1 hover:bg-white/10" style={{ color: "rgba(255,255,255,.6)" }}>
            <KeyRound className="h-3.5 w-3.5" />
          </button>
        </div>
        <button onClick={onLogout} className="w-full rounded-md py-1.5 text-[11px] hover:bg-white/10"
          style={{ color: "rgba(255,255,255,.75)" }}>Cerrar sesión</button>
        <div className="text-center text-[11px]" style={{ color: "rgba(255,255,255,.4)" }}>Powered by ASIN</div>
      </div>

      {advancedOpen && <AdvancedModal onClose={() => setAdvancedOpen(false)} />}
    </aside>
  );

  return (
    <>
      {/* Desktop fixed sidebar */}
      <div className="fixed inset-y-0 left-0 z-30 hidden md:block">{inner}</div>
      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={closeMobile} />
          <div className="absolute inset-y-0 left-0 cms-fade">{inner}</div>
        </div>
      )}
    </>
  );
}

function AdvancedModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-4" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-2xl bg-white p-6 cms-fade" style={{ color: "var(--cms-text)" }}>
        <h2 className="text-[17px] font-bold">Configuración avanzada</h2>
        <p className="mt-1 text-[12px]" style={{ color: "var(--cms-text-muted)" }}>
          La conexión con la hoja de cálculo está gestionada por el servidor. No es necesario configurar nada aquí.
        </p>
        <button onClick={onClose} className="mt-5 rounded-[10px] px-4 py-2 text-sm font-semibold text-white"
          style={{ background: "var(--cms-primary)" }}>Cerrar</button>
      </div>
    </div>
  );
}

/* ============================================================
   Topbar
============================================================ */
function Topbar({ current, dirty, saveStatus, onSave, onMenu }:
  { current: typeof NAV[number]; dirty: boolean; saveStatus: SaveStatus; onSave: () => void; onMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-3 px-4 md:px-7"
      style={{ background: "rgba(244,247,252,.85)", backdropFilter: "blur(10px)", borderBottom: "1px solid var(--cms-border)" }}>
      <button onClick={onMenu} className="md:hidden grid h-9 w-9 place-items-center rounded-[10px]"
        style={{ background: "var(--cms-surface)", border: "1px solid var(--cms-border)" }} aria-label="Abrir menú">
        <Menu className="h-4 w-4" />
      </button>

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[17px] font-bold leading-tight">{current.title}</h1>
        <p className="truncate text-[12px]" style={{ color: "var(--cms-text-muted)" }}>{current.subtitle}</p>
      </div>

      {dirty && saveStatus === "idle" && (
        <div className="hidden sm:flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold cms-fade"
          style={{ background: "var(--cms-warning-bg)", color: "var(--cms-warning)" }}>
          <AlertCircle className="h-3.5 w-3.5" /> Cambios sin guardar
        </div>
      )}

      <button onClick={onSave} disabled={saveStatus === "saving"}
        className="inline-flex items-center gap-2 rounded-[10px] px-3.5 md:px-4 py-2 text-[13px] font-semibold text-white transition-all"
        style={{ background: saveStatus === "success" ? "var(--cms-success)" : "var(--cms-primary)" }}>
        {saveStatus === "saving" ? <Loader2 className="h-4 w-4 animate-spin" /> :
         saveStatus === "success" ? <CheckCircle className="h-4 w-4" /> :
         <Save className="h-4 w-4" />}
        <span className="hidden sm:inline">
          {saveStatus === "saving" ? "Guardando…" : saveStatus === "success" ? "Guardado" : "Guardar cambios"}
        </span>
      </button>
    </header>
  );
}

/* ============================================================
   Page header
============================================================ */
function PageHeader({ current }: { current: typeof NAV[number] }) {
  const pct = (current.step / NAV.length) * 100;
  return (
    <div className="mb-6">
      <div className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide"
        style={{ background: "var(--cms-accent-light)", color: "var(--cms-accent-dark)" }}>
        <span className="cms-mono">Paso {current.step} de {NAV.length}</span>
      </div>
      <div className="mt-2 h-[3px] w-full overflow-hidden rounded-full" style={{ background: "var(--cms-surface3)" }}>
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${pct}%`, background: "var(--cms-accent)" }} />
      </div>
      <h2 className="mt-4 text-[28px] font-bold leading-tight" style={{ letterSpacing: "-.01em" }}>{current.title}</h2>
      <p className="mt-1 max-w-[520px] text-[13px] leading-[1.6]" style={{ color: "var(--cms-text-muted)" }}>{current.subtitle}</p>
    </div>
  );
}

/* ============================================================
   Reusable Card + Input
============================================================ */
function Card({ icon: Icon, title, subtitle, children }: { icon: typeof Settings; title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl p-5 md:p-6"
      style={{ background: "var(--cms-surface)", border: "1px solid var(--cms-border)", boxShadow: "var(--cms-shadow-sm)" }}>
      <header className="mb-5 flex items-center gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-[10px]"
          style={{ background: "var(--cms-accent-light)", color: "var(--cms-accent-dark)" }}>
          <Icon className="h-[18px] w-[18px]" />
        </div>
        <div className="min-w-0">
          <div className="text-[14px] font-bold leading-tight">{title}</div>
          {subtitle && <div className="text-[11px]" style={{ color: "var(--cms-text-muted)" }}>{subtitle}</div>}
        </div>
      </header>
      {children}
    </section>
  );
}

const inputCls = "w-full rounded-[10px] px-3 py-2.5 text-[13px] outline-none transition-all focus:bg-white";
const inputStyle: React.CSSProperties = {
  background: "var(--cms-surface2)", border: "1.5px solid var(--cms-border)",
  color: "var(--cms-text)",
};
function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cn(inputCls, props.className)} style={{ ...inputStyle, ...(props.style || {}) }}
    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--cms-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(41,184,216,.15)"; props.onFocus?.(e); }}
    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--cms-border)"; e.currentTarget.style.boxShadow = "none"; props.onBlur?.(e); }} />;
}
function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={cn(inputCls, "min-h-[80px] resize-y", props.className)} style={{ ...inputStyle, ...(props.style || {}) }}
    onFocus={(e) => { e.currentTarget.style.borderColor = "var(--cms-accent)"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(41,184,216,.15)"; props.onFocus?.(e); }}
    onBlur={(e) => { e.currentTarget.style.borderColor = "var(--cms-border)"; e.currentTarget.style.boxShadow = "none"; props.onBlur?.(e); }} />;
}

function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} aria-label={label} onClick={() => onChange(!checked)}
      className="relative inline-flex h-[22px] w-[40px] shrink-0 items-center rounded-full transition-colors"
      style={{
        background: checked ? "var(--cms-accent)" : "var(--cms-surface3)",
        border: `1.5px solid ${checked ? "var(--cms-accent-dark)" : "var(--cms-border)"}`,
      }}>
      <span className="absolute h-[14px] w-[14px] rounded-full bg-white shadow transition-transform"
        style={{ transform: checked ? "translateX(20px)" : "translateX(2px)" }} />
    </button>
  );
}

function InfoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-2 rounded-[10px] px-3.5 py-3 text-[12px] leading-[1.6]"
      style={{ background: "var(--cms-accent-light)", border: "1.5px solid var(--cms-accent-mid)", color: "var(--cms-accent-dark)" }}>
      <Info className="mt-[1px] h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Package; text: string }) {
  return (
    <div className="grid place-items-center rounded-2xl px-6 py-12 text-center"
      style={{ background: "var(--cms-surface)", border: "1.5px dashed var(--cms-border)" }}>
      <Icon className="h-12 w-12" style={{ color: "var(--cms-text-dim)", opacity: .35 }} />
      <p className="mt-3 text-[13px]" style={{ color: "var(--cms-text-muted)" }}>{text}</p>
    </div>
  );
}

function AddButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-[13px] font-semibold transition-colors"
      style={{ border: "1.5px dashed var(--cms-border)", color: "var(--cms-text-muted)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--cms-accent)"; e.currentTarget.style.color = "var(--cms-primary)"; e.currentTarget.style.background = "var(--cms-accent-light)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--cms-border)"; e.currentTarget.style.color = "var(--cms-text-muted)"; e.currentTarget.style.background = "transparent"; }}>
      <Plus className="h-4 w-4" /> {children}
    </button>
  );
}

/* ============================================================
   Page: Configuración (mocked, persisted to localStorage)
============================================================ */
type SiteConfig = {
  nombre: string; email: string; whatsapp: string; direccion: string;
  instagram: string; facebook: string; mostrarPromo: boolean;
};
const DEFAULT_CONFIG: SiteConfig = {
  nombre: "Vera Deportes", email: "", whatsapp: "",
  direccion: "", instagram: "vera_deportes", facebook: "", mostrarPromo: true,
};

function ConfigPage({ onDirty, registerSave }: { onDirty: () => void; registerSave: (fn: () => void) => void }) {
  const [cfg, setCfg] = useState<SiteConfig>(() => {
    if (typeof window === "undefined") return DEFAULT_CONFIG;
    try { return { ...DEFAULT_CONFIG, ...JSON.parse(localStorage.getItem("cms-config") || "{}") }; } catch { return DEFAULT_CONFIG; }
  });
  const change = <K extends keyof SiteConfig>(k: K, v: SiteConfig[K]) => { setCfg((c) => ({ ...c, [k]: v })); onDirty(); };

  useEffect(() => {
    registerSave(async () => {
      localStorage.setItem("cms-config", JSON.stringify(cfg));
      toast.success("Configuración guardada localmente.");
    });
  }, [cfg, registerSave]);

  return (
    <div className="space-y-5">
      <InfoBanner>Esta sección se guarda localmente como vista previa. La integración con la base de datos se conectará luego.</InfoBanner>

      <Card icon={Settings} title="Datos del comercio" subtitle="Información pública visible en el sitio">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre del comercio" required><Input value={cfg.nombre} onChange={(e) => change("nombre", e.target.value)} /></Field>
          <Field label="Email de contacto"><Input type="email" value={cfg.email} onChange={(e) => change("email", e.target.value)} placeholder="contacto@vera.com" /></Field>
          <Field label="WhatsApp" hint="Número con código de país, sin espacios"><Input value={cfg.whatsapp} onChange={(e) => change("whatsapp", e.target.value)} placeholder="5491100000000" /></Field>
          <Field label="Dirección"><Input value={cfg.direccion} onChange={(e) => change("direccion", e.target.value)} /></Field>
        </div>
      </Card>

      <Card icon={Tag} title="Redes sociales" subtitle="Usuarios sin la @">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Instagram"><Input value={cfg.instagram} onChange={(e) => change("instagram", e.target.value)} placeholder="vera_deportes" /></Field>
          <Field label="Facebook"><Input value={cfg.facebook} onChange={(e) => change("facebook", e.target.value)} placeholder="VeraDeportes" /></Field>
        </div>
      </Card>

      <Card icon={Star} title="Opciones de la home">
        <div className="flex items-center justify-between rounded-[10px] px-3 py-2.5"
          style={{ background: "var(--cms-surface2)", border: "1.5px solid var(--cms-border)" }}>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold">Mostrar banner promocional</div>
            <div className="text-[12px]" style={{ color: "var(--cms-text-dim)" }}>Bloque destacado en la portada</div>
          </div>
          <Toggle checked={cfg.mostrarPromo} onChange={(v) => change("mostrarPromo", v)} label="Mostrar promo" />
        </div>
      </Card>
    </div>
  );
}

/* ============================================================
   Page: Categorías (mocked)
============================================================ */
type CatItem = { id: string; nombre: string; slug: string; visible: boolean };
const DEFAULT_CATS: CatItem[] = [
  { id: "c1", nombre: "Fútbol", slug: "futbol", visible: true },
  { id: "c2", nombre: "Running", slug: "running", visible: true },
  { id: "c3", nombre: "Indumentaria", slug: "indumentaria", visible: false },
];

function CategoriesPage({ onDirty, registerSave }: { onDirty: () => void; registerSave: (fn: () => void) => void }) {
  const [items, setItems] = useState<CatItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_CATS;
    try { const s = localStorage.getItem("cms-cats"); return s ? JSON.parse(s) : DEFAULT_CATS; } catch { return DEFAULT_CATS; }
  });
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => { registerSave(async () => { localStorage.setItem("cms-cats", JSON.stringify(items)); toast.success("Categorías guardadas localmente."); }); }, [items, registerSave]);

  const update = (id: string, patch: Partial<CatItem>) => { setItems((arr) => arr.map((x) => x.id === id ? { ...x, ...patch } : x)); onDirty(); };
  const add = () => { const id = `c${Date.now()}`; setItems((arr) => [...arr, { id, nombre: "Nueva categoría", slug: "nueva-categoria", visible: true }]); setOpenId(id); onDirty(); };
  const remove = (id: string) => { setItems((arr) => arr.filter((x) => x.id !== id)); setConfirmDelete(null); onDirty(); };

  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyState icon={LayoutGrid} text="No hay categorías. Agregá la primera." />}
      {items.map((it, i) => {
        const open = openId === it.id;
        return (
          <div key={it.id} className="rounded-2xl transition-all"
            style={{ background: "var(--cms-surface)", border: `1.5px solid ${open ? "var(--cms-accent)" : "var(--cms-border)"}`,
              boxShadow: open ? "0 0 0 3px rgba(41,184,216,.1)" : "var(--cms-shadow-sm)" }}>
            <button type="button" aria-expanded={open} aria-controls={`cat-${it.id}`}
              onClick={() => setOpenId(open ? null : it.id)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-[8px] cms-mono text-[11px]"
                style={{ background: open ? "var(--cms-primary)" : "var(--cms-surface2)", color: open ? "#fff" : "var(--cms-text)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-semibold">{it.nombre}</div>
                <div className="truncate text-[11px]" style={{ color: "var(--cms-text-muted)" }}>/{it.slug}</div>
              </div>
              <StatusPill visible={it.visible} />
              <DeleteButton confirming={confirmDelete === it.id} onClickAsk={(e) => { e.stopPropagation(); setConfirmDelete(it.id); }}
                onCancel={(e) => { e.stopPropagation(); setConfirmDelete(null); }} onConfirm={(e) => { e.stopPropagation(); remove(it.id); }}
                label={it.nombre} />
              <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "var(--cms-text-dim)", transform: open ? "rotate(180deg)" : "none" }} />
            </button>
            <div id={`cat-${it.id}`} role="region" className={cn("cms-accordion-body", open && "open")}>
              <div>
                <div className="border-t p-4" style={{ borderColor: "var(--cms-border)", background: "var(--cms-surface2)" }}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nombre" required><Input value={it.nombre} onChange={(e) => update(it.id, { nombre: e.target.value })} /></Field>
                    <Field label="Slug" hint="Identificador en URL"><Input value={it.slug} onChange={(e) => update(it.id, { slug: e.target.value })} /></Field>
                  </div>
                  <div className="mt-3 flex items-center justify-between rounded-[10px] bg-white px-3 py-2" style={{ border: "1.5px solid var(--cms-border)" }}>
                    <span className="text-[13px] font-medium">Visible en la web</span>
                    <Toggle checked={it.visible} onChange={(v) => update(it.id, { visible: v })} label="Visible" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <AddButton onClick={add}>Agregar categoría</AddButton>
    </div>
  );
}

function StatusPill({ visible }: { visible: boolean }) {
  return visible ? (
    <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: "var(--cms-success-bg)", color: "var(--cms-success)", border: "1px solid #9FE0C8" }}>
      <CheckCircle className="h-2.5 w-2.5" /> Visible
    </span>
  ) : (
    <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
      style={{ background: "var(--cms-surface3)", color: "var(--cms-text-dim)", border: "1px solid var(--cms-border)" }}>
      <EyeOff className="h-2.5 w-2.5" /> Oculto
    </span>
  );
}

function DeleteButton({ confirming, onClickAsk, onCancel, onConfirm, label }:
  { confirming: boolean; onClickAsk: (e: React.MouseEvent) => void; onCancel: (e: React.MouseEvent) => void; onConfirm: (e: React.MouseEvent) => void; label: string }) {
  if (confirming) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-[8px] px-2 py-1 text-[11px]"
        style={{ background: "var(--cms-error-bg)", border: "1px solid #F5B3BC" }}>
        <span style={{ color: "var(--cms-error)" }}>¿Eliminar?</span>
        <button onClick={onCancel} className="rounded px-1.5 py-0.5 hover:bg-white" style={{ color: "var(--cms-text-muted)" }}>Cancelar</button>
        <button onClick={onConfirm} className="rounded px-1.5 py-0.5 font-semibold text-white" style={{ background: "var(--cms-error)" }}>Eliminar</button>
      </span>
    );
  }
  return (
    <button onClick={onClickAsk} aria-label={`Eliminar ${label}`}
      className="grid h-8 w-8 place-items-center rounded-[8px] transition-colors"
      style={{ color: "var(--cms-text-dim)" }}
      onMouseEnter={(e) => { e.currentTarget.style.background = "var(--cms-error-bg)"; e.currentTarget.style.color = "var(--cms-error)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "var(--cms-text-dim)"; }}>
      <Trash2 className="h-4 w-4" />
    </button>
  );
}

/* ============================================================
   Page: Marcas (mocked)
============================================================ */
type MarcaItem = { id: string; nombre: string; visible: boolean };
const DEFAULT_MARCAS: MarcaItem[] = [
  { id: "m1", nombre: "Adidas", visible: true },
  { id: "m2", nombre: "Nike", visible: true },
  { id: "m3", nombre: "Puma", visible: true },
];

function BrandsPage({ onDirty, registerSave }: { onDirty: () => void; registerSave: (fn: () => void) => void }) {
  const [items, setItems] = useState<MarcaItem[]>(() => {
    if (typeof window === "undefined") return DEFAULT_MARCAS;
    try { const s = localStorage.getItem("cms-marcas"); return s ? JSON.parse(s) : DEFAULT_MARCAS; } catch { return DEFAULT_MARCAS; }
  });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  useEffect(() => { registerSave(async () => { localStorage.setItem("cms-marcas", JSON.stringify(items)); toast.success("Marcas guardadas localmente."); }); }, [items, registerSave]);

  const update = (id: string, patch: Partial<MarcaItem>) => { setItems((arr) => arr.map((x) => x.id === id ? { ...x, ...patch } : x)); onDirty(); };
  const add = () => { setItems((arr) => [...arr, { id: `m${Date.now()}`, nombre: "Nueva marca", visible: true }]); onDirty(); };
  const remove = (id: string) => { setItems((arr) => arr.filter((x) => x.id !== id)); setConfirmDelete(null); onDirty(); };

  return (
    <div className="space-y-3">
      {items.length === 0 && <EmptyState icon={Tag} text="No hay marcas todavía." />}
      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((it) => (
          <div key={it.id} className="flex items-center gap-3 rounded-2xl p-4"
            style={{ background: "var(--cms-surface)", border: "1.5px solid var(--cms-border)", boxShadow: "var(--cms-shadow-sm)" }}>
            <div className="grid h-10 w-10 place-items-center rounded-[10px]"
              style={{ background: "var(--cms-accent-light)", color: "var(--cms-accent-dark)" }}>
              <Tag className="h-[18px] w-[18px]" />
            </div>
            <Input value={it.nombre} onChange={(e) => update(it.id, { nombre: e.target.value })} className="flex-1" />
            <Toggle checked={it.visible} onChange={(v) => update(it.id, { visible: v })} label={`Visible ${it.nombre}`} />
            <DeleteButton confirming={confirmDelete === it.id} onClickAsk={() => setConfirmDelete(it.id)}
              onCancel={() => setConfirmDelete(null)} onConfirm={() => remove(it.id)} label={it.nombre} />
          </div>
        ))}
      </div>
      <AddButton onClick={add}>Agregar marca</AddButton>
    </div>
  );
}

/* ============================================================
   Page: Productos (real — Google Sheets via server fn)
============================================================ */
function ProductsPage({ onDirty, registerSave }: { onDirty: () => void; registerSave: (fn: () => void) => void }) {
  const fetchList = useServerFn(listSheetProducts);
  const save = useServerFn(updateSheetProduct);
  const [items, setItems] = useState<SheetProduct[] | null>(null);
  const [edited, setEdited] = useState<Record<number, SheetProduct>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [reloading, setReloading] = useState(false);
  const [search, setSearch] = useState("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);

  async function refresh() {
    setReloading(true);
    try { const data = await fetchList(); setItems(data); setEdited({}); }
    catch (e) { toast.error((e as Error).message); }
    finally { setReloading(false); }
  }
  useEffect(() => { refresh(); }, []);

  useEffect(() => {
    registerSave(async () => {
      const dirty = Object.values(edited);
      if (dirty.length === 0) { toast.message("No hay cambios para guardar."); return; }
      for (const p of dirty) {
        await save({ data: {
          rowIndex: p.rowIndex, nombre: p.nombre, categoria: p.categoria, precio: p.precio,
          descripcion: p.descripcion, imagen_url: p.imagen_url, activo: p.activo, destacado: p.destacado,
        }});
      }
      toast.success(`${dirty.length} producto(s) actualizados.`);
      await refresh();
    });
  }, [edited, registerSave, save]);

  const merged = useMemo(() => (items ?? []).map((p) => edited[p.rowIndex] ?? p), [items, edited]);
  const filtered = useMemo(() => merged.filter((p) =>
    !search.trim() || (p.nombre + p.categoria + p.id).toLowerCase().includes(search.trim().toLowerCase())
  ), [merged, search]);

  function update(p: SheetProduct, patch: Partial<SheetProduct>) {
    setEdited((m) => ({ ...m, [p.rowIndex]: { ...p, ...patch } }));
    onDirty();
  }

  async function handleUpload(p: SheetProduct, file: File) {
    setUploadingId(p.id);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `producto-${p.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("productos").upload(path, file, { cacheControl: "3600", upsert: false, contentType: file.type });
      if (error) throw error;
      const { data } = supabase.storage.from("productos").getPublicUrl(path);
      update(p, { imagen_url: data.publicUrl });
      toast.success("Foto subida. Acordate de guardar.");
    } catch (e) { toast.error((e as Error).message); }
    finally { setUploadingId(null); }
  }

  if (!items) {
    return <EmptyState icon={Package} text={reloading ? "Cargando productos…" : "Sin datos"} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: "var(--cms-text-dim)" }} />
          <Input placeholder="Buscar por nombre, categoría o ID" value={search} onChange={(e) => setSearch(e.target.value)} style={{ paddingLeft: 36 }} />
        </div>
        <button onClick={refresh} disabled={reloading} className="rounded-[10px] px-3 py-2 text-[12px] font-semibold"
          style={{ background: "var(--cms-surface)", border: "1.5px solid var(--cms-border)", color: "var(--cms-text-muted)" }}>
          {reloading ? "…" : "Recargar"}
        </button>
      </div>

      {filtered.length === 0 && <EmptyState icon={Package} text="No hay productos que coincidan." />}

      {filtered.map((p, i) => {
        const open = openId === p.id;
        const isDirty = !!edited[p.rowIndex];
        return (
          <div key={p.id} className="rounded-2xl transition-all"
            style={{ background: "var(--cms-surface)", border: `1.5px solid ${open ? "var(--cms-accent)" : isDirty ? "var(--cms-warning)" : "var(--cms-border)"}`,
              boxShadow: open ? "0 0 0 3px rgba(41,184,216,.1)" : "var(--cms-shadow-sm)" }}>
            <button type="button" aria-expanded={open} aria-controls={`prod-${p.id}`}
              onClick={() => setOpenId(open ? null : p.id)}
              className="flex w-full items-center gap-3 px-3.5 py-3 text-left">
              <span className="grid h-[30px] w-[30px] place-items-center rounded-[8px] cms-mono text-[11px]"
                style={{ background: open ? "var(--cms-primary)" : "var(--cms-surface2)", color: open ? "#fff" : "var(--cms-text)" }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="grid h-[38px] w-[38px] place-items-center overflow-hidden rounded-[9px]" style={{ background: "var(--cms-surface3)" }}>
                {p.imagen_url ? (
                  <img src={p.imagen_url} alt={p.nombre} className="h-full w-full object-cover" />
                ) : (
                  <Package className="h-4 w-4" style={{ color: "var(--cms-text-dim)" }} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="truncate text-[14px] font-semibold">{p.nombre || "Sin nombre"}</span>
                  {isDirty && <span className="rounded-full px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide"
                    style={{ background: "var(--cms-warning-bg)", color: "var(--cms-warning)" }}>edit</span>}
                </div>
                <div className="truncate text-[11px]" style={{ color: "var(--cms-text-muted)" }}>{p.categoria || "Sin categoría"} · #{p.id}</div>
              </div>
              <span className="hidden md:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "var(--cms-warning-bg)", color: "var(--cms-warning)", border: "1px solid #F9D49B" }}>
                {p.precio || "—"}
              </span>
              {p.destacado && <span className="hidden sm:inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold"
                style={{ background: "var(--cms-accent-light)", color: "var(--cms-accent-dark)", border: "1px solid var(--cms-accent-mid)" }}>
                <Star className="h-2.5 w-2.5" /> Destacado
              </span>}
              <StatusPill visible={p.activo} />
              <ChevronDown className="h-4 w-4 transition-transform" style={{ color: "var(--cms-text-dim)", transform: open ? "rotate(180deg)" : "none" }} />
            </button>

            <div id={`prod-${p.id}`} role="region" className={cn("cms-accordion-body", open && "open")}>
              <div>
                <div className="space-y-4 border-t p-4" style={{ borderColor: "var(--cms-border)", background: "var(--cms-surface2)" }}>
                  <div className="grid gap-4 md:grid-cols-2">
                    <Field label="Nombre" required><Input value={p.nombre} onChange={(e) => update(p, { nombre: e.target.value })} /></Field>
                    <Field label="Categoría"><Input value={p.categoria} onChange={(e) => update(p, { categoria: e.target.value })} /></Field>
                    <Field label="Precio"><Input value={p.precio} onChange={(e) => update(p, { precio: e.target.value })} placeholder="$ 12.500" /></Field>
                    <Field label="URL de imagen"><Input value={p.imagen_url} onChange={(e) => update(p, { imagen_url: e.target.value })} placeholder="https://…" /></Field>
                  </div>
                  <Field label="Descripción"><Textarea rows={3} value={p.descripcion} onChange={(e) => update(p, { descripcion: e.target.value })} /></Field>

                  <div className="grid gap-3 sm:grid-cols-2">
                    <ImageUpload current={p.imagen_url} uploading={uploadingId === p.id} onFile={(f) => handleUpload(p, f)} />
                    <div className="space-y-2">
                      <div className="flex items-center justify-between rounded-[10px] bg-white px-3 py-2.5" style={{ border: "1.5px solid var(--cms-border)" }}>
                        <span className="text-[13px] font-medium">Activo</span>
                        <Toggle checked={p.activo} onChange={(v) => update(p, { activo: v })} label="Activo" />
                      </div>
                      <div className="flex items-center justify-between rounded-[10px] bg-white px-3 py-2.5" style={{ border: "1.5px solid var(--cms-border)" }}>
                        <span className="text-[13px] font-medium">Destacado</span>
                        <Toggle checked={p.destacado} onChange={(v) => update(p, { destacado: v })} label="Destacado" />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-1">
                    <DeleteButton confirming={confirmDelete === p.id}
                      onClickAsk={() => { setConfirmDelete(p.id); toast.message("La eliminación de filas en la hoja no está habilitada todavía."); setTimeout(() => setConfirmDelete(null), 50); }}
                      onCancel={() => setConfirmDelete(null)} onConfirm={() => setConfirmDelete(null)} label={p.nombre} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ImageUpload({ current, uploading, onFile }: { current: string; uploading: boolean; onFile: (f: File) => void }) {
  return (
    <label className="flex cursor-pointer items-center gap-3 rounded-[10px] bg-white p-3 transition-colors"
      style={{ border: "1.5px dashed var(--cms-border)" }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--cms-accent)"; e.currentTarget.style.background = "var(--cms-accent-light)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--cms-border)"; e.currentTarget.style.background = "#fff"; }}>
      <input type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
      <div className="grid h-[54px] w-[54px] place-items-center overflow-hidden rounded-[9px]" style={{ background: "var(--cms-surface3)" }}>
        {current ? <img src={current} alt="" className="h-full w-full object-cover" /> : <ImagePlus className="h-5 w-5" style={{ color: "var(--cms-text-dim)" }} />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-[13px] font-semibold">{uploading ? "Subiendo…" : "Subir foto"}</div>
        <div className="text-[11px]" style={{ color: "var(--cms-text-dim)" }}>JPG, PNG o WebP · máx 2 MB</div>
      </div>
    </label>
  );
}

/* ============================================================
   Mobile Bottom Nav
============================================================ */
function MobileBottomNav({ page, setPage }: { page: PageId; setPage: (p: PageId) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 md:hidden"
      style={{ background: "var(--cms-surface)", borderTop: "1px solid var(--cms-border)", boxShadow: "0 -4px 12px rgba(13,27,62,.06)" }}>
      <div className="grid grid-cols-4">
        {NAV.map((n) => {
          const Icon = n.icon; const active = page === n.id;
          return (
            <button key={n.id} onClick={() => setPage(n.id)} aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold"
              style={{ color: active ? "var(--cms-primary)" : "var(--cms-text-dim)" }}>
              <Icon className="h-[18px] w-[18px]" />
              <span>{n.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
