import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { Loader2, RefreshCw, CheckCircle2, XCircle, Edit3, Settings, Image as ImageIcon, Calendar, LogOut, Globe, ShoppingBag, Star, Camera } from "lucide-react";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  initAdminSheets, listCargas, updateCargaEstado,
  aprobarYCrearProducto, listProductosAdmin, updateProductoEstado,
  agendarPublicacion, listAgenda, publicarEnLanding, resetAllSheets,
  type Carga, type Producto,
} from "@/lib/admin-cargas.functions";

import { listSheetProducts, updateSheetProduct, bulkDeleteByCategories, type SheetProduct } from "@/lib/sheet-products.functions";

export const Route = createFileRoute("/admin-cargas")({
  ssr: false,
  head: () => ({ meta: [{ title: "Cargas — Vera Deportes" }, { name: "robots", content: "noindex" }] }),
  component: Page,
});

function Page() {
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  async function checkAdmin(userId: string) {
    try {
      const { data } = await supabase.rpc("has_role", { _user_id: userId, _role: "admin" });
      setIsAdmin(!!data);
    } catch (e) {
      console.error("[admin-cargas] has_role error", e);
      setIsAdmin(false);
    }
  }

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!mounted) return;
        setSession(data.session);
        if (data.session) await checkAdmin(data.session.user.id);
      } catch (e) {
        console.error("[admin-cargas] getSession error", e);
      } finally {
        if (mounted) setReady(true);
      }
    })();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      if (s) checkAdmin(s.user.id);
      else setIsAdmin(null);
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <Toaster richColors />
      {!ready ? (
        <Centered><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></Centered>
      ) : !session ? (
        <Login />
      ) : isAdmin === null ? (
        <Centered><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></Centered>
      ) : !isAdmin ? (
        <Centered>
          <div className="text-center">
            <p className="text-base font-semibold text-neutral-900">No tenés permisos de administrador.</p>
            <button className="mt-3 text-sm text-orange-600 underline" onClick={() => supabase.auth.signOut()}>Cerrar sesión</button>
          </div>
        </Centered>
      ) : (
        <AdminUI email={session.user.email} onLogout={() => supabase.auth.signOut()} />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center">{children}</div>;
}

function Login() {
  const [mode, setMode] = useState<"in"|"up">("in");
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setBusy(true);
    try {
      if (mode === "in") {
        const { error } = await supabase.auth.signInWithPassword({ email, password: pwd });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ email, password: pwd, options: { emailRedirectTo: `${window.location.origin}/admin-cargas` }});
        if (error) throw error;
        toast.success("Cuenta creada. El admin debe asignarte el rol.");
      }
    } catch (err) { toast.error((err as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
        <h1 className="text-lg font-bold text-neutral-900">Panel — Cargas</h1>
        <input type="email" required placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
        <input type="password" required minLength={6} placeholder="Contraseña" value={pwd} onChange={e => setPwd(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2.5 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
        <button type="submit" disabled={busy} className="w-full rounded-lg bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-neutral-800 disabled:opacity-60">
          {busy ? "…" : mode === "in" ? "Ingresar" : "Crear cuenta"}
        </button>
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="block w-full text-center text-xs text-neutral-500 hover:underline">
          {mode === "in" ? "¿No tenés cuenta? Registrate" : "Ya tengo cuenta"}
        </button>
      </form>
    </div>
  );
}

const ESTADOS = ["PENDIENTE","EN_REVISION","ANALIZADO","APROBADO","PUBLICADO","DESCARTADO"] as const;
type Tab = "cargas" | "productos" | "landing" | "agenda";

function AdminUI({ email, onLogout }: { email?: string; onLogout: () => void }) {
  const [tab, setTab] = useState<Tab>("cargas");

  const initFn = useServerFn(initAdminSheets);
  const resetFn = useServerFn(resetAllSheets);
  const qc = useQueryClient();
  const [initBusy, setInitBusy] = useState(false);
  const [resetBusy, setResetBusy] = useState(false);
  async function doInit() {
    setInitBusy(true);
    try {
      const res = await initFn({});
      toast.success(res.created.length ? `Creadas: ${res.created.join(", ")}` : "Pestañas ya existían");
    } catch (e) { toast.error((e as Error).message); }
    finally { setInitBusy(false); }
  }
  async function doReset() {
    const ok = window.confirm(
      "Esto vaciará TODAS las cargas, productos internos y la landing pública.\n\nLas fotos en Drive NO se borran.\n\n¿Continuar?"
    );
    if (!ok) return;
    setResetBusy(true);
    try {
      await resetFn({});
      await qc.invalidateQueries();
      toast.success("Todo limpio. Podés empezar de cero.");
    } catch (e) { toast.error((e as Error).message); }
    finally { setResetBusy(false); }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-4 md:py-6">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">Gestión de cargas</h1>
          <p className="text-xs text-neutral-500">{email}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/cargar" className="inline-flex items-center gap-1.5 rounded-md bg-orange-500 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-orange-600">
            <Camera className="h-3.5 w-3.5" /> Cargar fotos
          </Link>
          <button onClick={doInit} disabled={initBusy} title="Crear pestañas en el Sheet si faltan"
            className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs text-neutral-700 hover:bg-neutral-50 disabled:opacity-60">
            <Settings className="h-3.5 w-3.5" /> Inicializar
          </button>
          <button onClick={doReset} disabled={resetBusy} title="Vaciar cargas, productos y landing"
            className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-60">
            <XCircle className="h-3.5 w-3.5" /> {resetBusy ? "Limpiando…" : "Reset total"}
          </button>
          <button onClick={onLogout} className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs text-neutral-500 hover:bg-neutral-100">
            <LogOut className="h-3.5 w-3.5" /> Salir
          </button>
        </div>
      </header>


      <nav className="mb-4 flex gap-1 overflow-x-auto border-b border-neutral-200">
        {([
          ["cargas","Cargas",ImageIcon],
          ["productos","Productos",CheckCircle2],
          ["landing","Landing",ShoppingBag],
          ["agenda","Calendario",Calendar],
        ] as const).map(([k, label, Icon]) => (
          <button key={k} onClick={() => setTab(k)}
            className={`-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-3 py-2 text-sm font-medium transition ${
              tab === k ? "border-orange-500 text-neutral-900" : "border-transparent text-neutral-500 hover:text-neutral-800"
            }`}>
            <Icon className="h-4 w-4" /> {label}
          </button>
        ))}
      </nav>

      {tab === "cargas" && <CargasView />}
      {tab === "productos" && <ProductosView />}
      {tab === "landing" && <LandingView />}
      {tab === "agenda" && <AgendaView />}
    </div>
  );
}

/* ============ Cargas ============ */
function parseGroupId(comment: string): string | null {
  const m = /\[G-([A-Za-z0-9]+)/.exec(comment || "");
  return m ? `G-${m[1]}` : null;
}
function parseGroupPos(comment: string): number {
  const m = /·\s*(\d+)\s*\/\s*\d+\s*\]/.exec(comment || "");
  return m ? parseInt(m[1], 10) : 999;
}

function CargasView() {
  const qc = useQueryClient();
  const fetchCargas = useServerFn(listCargas);
  const updEstado = useServerFn(updateCargaEstado);
  const [filter, setFilter] = useState<typeof ESTADOS[number] | "TODOS">("PENDIENTE");
  const [editing, setEditing] = useState<Carga[] | null>(null);

  const q = useQuery({ queryKey: ["cargas"], queryFn: () => fetchCargas() });

  const groups = useMemo(() => {
    const all = q.data ?? [];
    const filtered = filter === "TODOS" ? all : all.filter(c => c.estado === filter);
    const map = new Map<string, Carga[]>();
    for (const c of filtered) {
      const key = parseGroupId(c.comentario) ?? `single:${c.id}`;
      const arr = map.get(key) ?? [];
      arr.push(c);
      map.set(key, arr);
    }
    return Array.from(map.entries()).map(([key, items]) => ({
      key,
      items: items.sort((a, b) => parseGroupPos(a.comentario) - parseGroupPos(b.comentario)),
    }));
  }, [q.data, filter]);

  const mut = useMutation({
    mutationFn: (v: { rowIndex: number; estado: typeof ESTADOS[number] }) => updEstado({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cargas"] }); toast.success("Estado actualizado"); },
    onError: (e) => toast.error((e as Error).message),
  });

  async function descartarGrupo(items: Carga[]) {
    for (const c of items) await mut.mutateAsync({ rowIndex: c.rowIndex, estado: "DESCARTADO" });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button onClick={() => q.refetch()} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs hover:bg-neutral-50">
          <RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} /> Refrescar
        </button>
        <div className="flex flex-wrap gap-1">
          {(["TODOS", ...ESTADOS] as const).map(e => (
            <button key={e} onClick={() => setFilter(e as any)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                filter === e ? "border-orange-500 bg-orange-50 text-orange-700" : "border-neutral-300 bg-white text-neutral-600 hover:bg-neutral-50"
              }`}>{e}</button>
          ))}
        </div>
        <span className="ml-auto text-xs text-neutral-500">{groups.length} producto{groups.length !== 1 ? "s" : ""}</span>
      </div>

      {q.isLoading ? (
        <Centered><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></Centered>
      ) : groups.length === 0 ? (
        <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-sm text-neutral-500">Sin cargas.</div>
      ) : (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map(({ key, items }) => {
            const primary = items[0];
            const isGroup = items.length > 1;
            return (
              <div key={key} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="relative aspect-square bg-[#e5e7eb]">
                  {primary.url_imagen ? (
                    <a href={primary.url_drive || primary.url_imagen} target="_blank" rel="noreferrer">
                      <img src={primary.url_imagen} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    </a>
                  ) : <div className="grid h-full place-items-center text-xs text-neutral-400">sin imagen</div>}
                  {isGroup && (
                    <span className="absolute right-2 top-2 rounded-full bg-neutral-900/80 px-2 py-0.5 text-[10px] font-bold text-white">
                      {items.length} fotos
                    </span>
                  )}
                </div>
                {isGroup && (
                  <div className="flex gap-1 overflow-x-auto border-t border-neutral-100 bg-neutral-50 px-2 py-1.5">
                    {items.map(c => (
                      <img key={c.id} src={c.url_imagen} alt="" className="h-10 w-10 flex-shrink-0 rounded border border-neutral-200 bg-white object-contain" loading="lazy" />
                    ))}
                  </div>
                )}
                <div className="space-y-1.5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor(primary.estado)}`}>{primary.estado}</span>
                    <span className="text-[11px] text-neutral-500">{primary.fecha}</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">{primary.marca || "—"} <span className="font-normal text-neutral-500">/ {primary.categoria || "—"}</span></p>
                  <p className="text-xs text-neutral-500">por {primary.usuario || "—"}</p>
                  {primary.comentario && <p className="text-xs text-neutral-700 line-clamp-2">{primary.comentario}</p>}
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <button onClick={() => setEditing(items)}
                      className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-orange-600">
                      <Edit3 className="h-3 w-3" /> {isGroup ? "Aprobar grupo" : "Editar / Aprobar"}
                    </button>
                    <button onClick={() => isGroup ? descartarGrupo(items) : mut.mutate({ rowIndex: primary.rowIndex, estado: "DESCARTADO" })}
                      className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] text-red-600 hover:bg-red-50">
                      <XCircle className="h-3 w-3" /> Descartar
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && <ProductoEditor cargas={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function badgeColor(e: string) {
  switch (e) {
    case "PENDIENTE": return "bg-amber-100 text-amber-800";
    case "EN_REVISION": return "bg-blue-100 text-blue-800";
    case "ANALIZADO": return "bg-indigo-100 text-indigo-800";
    case "APROBADO": return "bg-green-100 text-green-800";
    case "PUBLICADO": return "bg-emerald-100 text-emerald-800";
    case "DESCARTADO": return "bg-red-100 text-red-800";
    default: return "bg-neutral-100 text-neutral-700";
  }
}

/* ============ Editor / aprobador ============ */
function ProductoEditor({ cargas, onClose }: { cargas: Carga[]; onClose: () => void }) {
  const qc = useQueryClient();
  const aprobar = useServerFn(aprobarYCrearProducto);
  const updEstado = useServerFn(updateCargaEstado);
  const [primaryIdx, setPrimaryIdx] = useState(0);
  const primary = cargas[primaryIdx] ?? cargas[0];
  const isGroup = cargas.length > 1;

  const [v, setV] = useState({
    marca: primary.marca, modelo: "", categoria: primary.categoria, subcategoria: "",
    descripcion: (primary.comentario || "").replace(/\s*\[G-[^\]]+\]\s*/g, "").trim(),
    caracteristicas: "", uso: "",
    hashtags: "", texto_ig: "", texto_wsp: "",
    estado: "APROBADO" as "APROBADO"|"PUBLICADO"|"DESCARTADO",
  });
  const [busy, setBusy] = useState(false);

  async function save() {
    if (!v.marca.trim()) { toast.error("Marca obligatoria"); return; }
    setBusy(true);
    try {
      const extras = cargas
        .filter((c) => c.rowIndex !== primary.rowIndex)
        .map((c) => c.url_imagen)
        .filter(Boolean)
        .join("|");
      await aprobar({ data: {
        url_imagen: primary.url_imagen, marca: v.marca, modelo: v.modelo,
        categoria: v.categoria, subcategoria: v.subcategoria,
        descripcion: v.descripcion, caracteristicas: v.caracteristicas,
        uso: v.uso, hashtags: v.hashtags, texto_ig: v.texto_ig, texto_wsp: v.texto_wsp,
        estado: v.estado, carga_id: primary.id, carga_rowIndex: primary.rowIndex,
        imagenes_extra: extras,
      }});
      // Marcar el resto del grupo con el mismo estado
      for (const c of cargas) {
        if (c.rowIndex === primary.rowIndex) continue;
        await updEstado({ data: { rowIndex: c.rowIndex, estado: v.estado } });
      }
      toast.success(isGroup ? `Producto creado (${cargas.length} fotos agrupadas)` : "Producto creado");
      qc.invalidateQueries({ queryKey: ["cargas"] });
      qc.invalidateQueries({ queryKey: ["productos"] });
      onClose();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  function suggest() {
    const hash = [v.marca, v.categoria, "VeraDeportes"].filter(Boolean).map(t => `#${t.replace(/\s+/g, "")}`).join(" ");
    const ig = `${v.marca} ${v.modelo}\n${v.descripcion}\n\n📍 Vera Deportes\n${hash}`.trim();
    const wsp = `Hola! 👋\nTenemos: *${v.marca} ${v.modelo}*\n${v.descripcion}\n¿Te interesa?`;
    setV(s => ({ ...s, hashtags: hash, texto_ig: ig, texto_wsp: wsp }));
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-neutral-200 bg-white px-5 py-3">
          <h2 className="text-base font-bold text-neutral-900">
            {isGroup ? `Revisar y aprobar (${cargas.length} fotos)` : "Revisar y aprobar"}
          </h2>
          <button onClick={onClose} className="rounded-md p-1.5 text-neutral-500 hover:bg-neutral-100">✕</button>
        </div>
        <div className="grid gap-4 p-5 md:grid-cols-[220px_1fr]">
          <div className="space-y-2">
            {primary.url_imagen && <img src={primary.url_imagen} alt="" className="aspect-square w-full rounded-lg border border-neutral-200 object-contain bg-neutral-100" />}
            {isGroup && (
              <>
                <p className="text-[11px] font-semibold text-neutral-700">Elegí la foto principal:</p>
                <div className="grid grid-cols-4 gap-1.5">
                  {cargas.map((c, i) => (
                    <button key={c.id} type="button" onClick={() => setPrimaryIdx(i)}
                      className={`aspect-square overflow-hidden rounded-md border-2 bg-neutral-100 ${
                        i === primaryIdx ? "border-orange-500 ring-2 ring-orange-200" : "border-neutral-200 hover:border-neutral-400"
                      }`}>
                      <img src={c.url_imagen} alt="" className="h-full w-full object-contain" loading="lazy" />
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-neutral-500">Solo la principal aparece en la landing. Las demás quedan archivadas con el mismo estado.</p>
              </>
            )}
            <p className="text-[11px] text-neutral-500">{primary.fecha} · {primary.usuario}</p>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Inp label="Marca *" v={v.marca} onC={x => setV(s => ({ ...s, marca: x }))} />
            <Inp label="Modelo" v={v.modelo} onC={x => setV(s => ({ ...s, modelo: x }))} />
            <Inp label="Categoría" v={v.categoria} onC={x => setV(s => ({ ...s, categoria: x }))} />
            <Inp label="Subcategoría" v={v.subcategoria} onC={x => setV(s => ({ ...s, subcategoria: x }))} />
            <TA label="Descripción comercial" v={v.descripcion} onC={x => setV(s => ({ ...s, descripcion: x }))} span />
            <TA label="Características" v={v.caracteristicas} onC={x => setV(s => ({ ...s, caracteristicas: x }))} span />
            <Inp label="Uso recomendado" v={v.uso} onC={x => setV(s => ({ ...s, uso: x }))} span />
            <div className="sm:col-span-2">
              <button type="button" onClick={suggest}
                className="rounded-md border border-orange-300 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700 hover:bg-orange-100">
                Sugerir textos para redes
              </button>
            </div>
            <Inp label="Hashtags" v={v.hashtags} onC={x => setV(s => ({ ...s, hashtags: x }))} span />
            <TA label="Texto Instagram" v={v.texto_ig} onC={x => setV(s => ({ ...s, texto_ig: x }))} span rows={4} />
            <TA label="Texto WhatsApp" v={v.texto_wsp} onC={x => setV(s => ({ ...s, texto_wsp: x }))} span rows={4} />
            <label className="sm:col-span-2 block">
              <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-600">Estado</span>
              <select value={v.estado} onChange={e => setV(s => ({ ...s, estado: e.target.value as any }))}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm">
                <option value="APROBADO">APROBADO</option>
                <option value="PUBLICADO">PUBLICADO</option>
                <option value="DESCARTADO">DESCARTADO</option>
              </select>
            </label>
          </div>
        </div>
        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-neutral-200 bg-white px-5 py-3">
          <button onClick={onClose} className="rounded-md border border-neutral-300 px-3 py-2 text-sm hover:bg-neutral-50">Cancelar</button>
          <button onClick={save} disabled={busy}
            className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Guardar producto
          </button>
        </div>
      </div>
    </div>
  );
}

function Inp({ label, v, onC, span }: { label: string; v: string; onC: (x: string) => void; span?: boolean }) {
  return (
    <label className={`block ${span ? "sm:col-span-2" : ""}`}>
      <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-600">{label}</span>
      <input value={v} onChange={e => onC(e.target.value)}
        className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
    </label>
  );
}
function TA({ label, v, onC, span, rows = 3 }: { label: string; v: string; onC: (x: string) => void; span?: boolean; rows?: number }) {
  return (
    <label className={`block ${span ? "sm:col-span-2" : ""}`}>
      <span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-600">{label}</span>
      <textarea value={v} onChange={e => onC(e.target.value)} rows={rows}
        className="mt-1 w-full resize-y rounded-md border border-neutral-300 px-3 py-2 text-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-200" />
    </label>
  );
}

/* ============ Productos ============ */
function ProductosView() {
  const qc = useQueryClient();
  const fetch = useServerFn(listProductosAdmin);
  const upd = useServerFn(updateProductoEstado);
  const agendar = useServerFn(agendarPublicacion);
  const q = useQuery({ queryKey: ["productos"], queryFn: () => fetch() });
  const [scheduling, setScheduling] = useState<Producto | null>(null);
  const [publishing, setPublishing] = useState<Producto | null>(null);

  const mut = useMutation({
    mutationFn: (v: { rowIndex: number; estado: "APROBADO"|"PUBLICADO"|"DESCARTADO" }) => upd({ data: v }),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["productos"] }); toast.success("Actualizado"); },
    onError: (e) => toast.error((e as Error).message),
  });

  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => q.refetch()} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs hover:bg-neutral-50">
          <RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} /> Refrescar
        </button>
        <span className="ml-auto text-xs text-neutral-500">{q.data?.length ?? 0}</span>
      </div>
      {q.isLoading ? <Centered><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></Centered>
        : !q.data?.length ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-sm text-neutral-500">Sin productos aprobados todavía.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {q.data.map(p => (
              <div key={p.id} className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm">
                <div className="relative aspect-square bg-[#e5e7eb]">
                  {p.url_imagen && <img src={p.url_imagen} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />}
                </div>
                <div className="space-y-1.5 p-3">
                  <div className="flex items-center justify-between">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor(p.estado)}`}>{p.estado}</span>
                    <span className="text-[11px] text-neutral-500">{p.fecha_revision}</span>
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">{p.marca} {p.modelo}</p>
                  <p className="text-xs text-neutral-500">{p.categoria} {p.subcategoria && `/ ${p.subcategoria}`}</p>
                  <p className="line-clamp-2 text-xs text-neutral-700">{p.descripcion}</p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <button onClick={() => setPublishing(p)} disabled={p.estado === "PUBLICADO"}
                      className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-orange-600 disabled:opacity-50">
                      <Globe className="h-3 w-3" /> Publicar en landing
                    </button>
                    <button onClick={() => setScheduling(p)} className="inline-flex items-center gap-1 rounded-md bg-neutral-900 px-2 py-1 text-[11px] font-semibold text-white hover:bg-neutral-800">
                      <Calendar className="h-3 w-3" /> Agendar
                    </button>
                    <button onClick={() => mut.mutate({ rowIndex: p.rowIndex, estado: "DESCARTADO" })} className="rounded-md border border-red-300 bg-white px-2 py-1 text-[11px] text-red-700 hover:bg-red-50">Descartar</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {scheduling && <ScheduleDialog producto={scheduling} onClose={() => setScheduling(null)} agendar={(v) => agendar({ data: v })} />}
      {publishing && <PublishDialog producto={publishing} onClose={() => setPublishing(null)} />}
    </div>
  );
}

function PublishDialog({ producto, onClose }: { producto: Producto; onClose: () => void }) {
  const qc = useQueryClient();
  const publicar = useServerFn(publicarEnLanding);
  const [nombre, setNombre] = useState(`${producto.marca} ${producto.modelo}`.trim());
  const [categoria, setCategoria] = useState(producto.categoria || "");
  const [precio, setPrecio] = useState("");
  const [descripcion, setDescripcion] = useState(producto.descripcion || "");
  const [imagen, setImagen] = useState(producto.url_imagen || "");
  const [imagenesExtra, setImagenesExtra] = useState(producto.imagenes_extra || "");
  const [destacado, setDestacado] = useState(false);
  const [busy, setBusy] = useState(false);

  const extraList = imagenesExtra.split("|").map((s) => s.trim()).filter(Boolean);

  async function save() {
    if (!nombre.trim() || !categoria.trim() || !precio.trim() || !imagen.trim()) {
      toast.error("Nombre, categoría, precio e imagen son obligatorios");
      return;
    }
    setBusy(true);
    try {
      await publicar({ data: {
        producto_rowIndex: producto.rowIndex,
        nombre, categoria, precio, descripcion, imagen_url: imagen, destacado,
        imagenes_extra: extraList.join("|"),
      }});
      toast.success("Publicado en la landing");
      qc.invalidateQueries({ queryKey: ["productos"] });
      qc.invalidateQueries({ queryKey: ["sheet-products"] });
      onClose();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-base font-bold">Publicar en landing</h2>
        <p className="text-xs text-neutral-500">Se agrega como fila activa en la pestaña <span className="font-mono">Productos</span>.</p>
        <Inp label="Nombre *" v={nombre} onC={setNombre} />
        <Inp label="Categoría *" v={categoria} onC={setCategoria} />
        <Inp label="Precio * (ej: 89000)" v={precio} onC={setPrecio} />
        <Inp label="Imagen principal *" v={imagen} onC={setImagen} />
        <TA
          label={`Imágenes extra (una por línea) — ${extraList.length}`}
          v={imagenesExtra.replace(/\|/g, "\n")}
          onC={(val) => setImagenesExtra(val.split(/\n+/).map((s) => s.trim()).filter(Boolean).join("|"))}
          rows={3}
        />
        {extraList.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto">
            {[imagen, ...extraList].filter(Boolean).map((src, i) => (
              <img key={i} src={src} alt="" className="h-14 w-14 shrink-0 rounded border border-neutral-200 bg-neutral-50 object-contain" />
            ))}
          </div>
        )}
        <TA label="Descripción" v={descripcion} onC={setDescripcion} rows={3} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={destacado} onChange={e => setDestacado(e.target.checked)} />
          Marcar como destacado
        </label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">Cancelar</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Publicar
          </button>
        </div>
      </div>
    </div>
  );
}

function ScheduleDialog({ producto, onClose, agendar }: { producto: Producto; onClose: () => void; agendar: (v: any) => Promise<any> }) {
  const qc = useQueryClient();
  const [fecha, setFecha] = useState(() => new Date().toISOString().slice(0, 10));
  const [canal, setCanal] = useState<"Instagram"|"WhatsApp"|"Facebook"|"Otro">("Instagram");
  const [tipo, setTipo] = useState("Post");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try {
      await agendar({ producto_id: producto.id, fecha, canal, tipo });
      toast.success("Agendado");
      qc.invalidateQueries({ queryKey: ["agenda"] });
      onClose();
    } catch (e) { toast.error((e as Error).message); }
    finally { setBusy(false); }
  }
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="w-full max-w-md space-y-3 rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-base font-bold">Agendar publicación</h2>
        <p className="text-xs text-neutral-500">{producto.marca} {producto.modelo}</p>
        <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-600">Fecha</span>
          <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" /></label>
        <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-600">Canal</span>
          <select value={canal} onChange={e => setCanal(e.target.value as any)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm">
            <option>Instagram</option><option>WhatsApp</option><option>Facebook</option><option>Otro</option>
          </select></label>
        <label className="block"><span className="block text-[11px] font-bold uppercase tracking-wide text-neutral-600">Tipo</span>
          <input value={tipo} onChange={e => setTipo(e.target.value)} className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm" /></label>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">Cancelar</button>
          <button onClick={save} disabled={busy} className="inline-flex items-center gap-2 rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-60">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />} Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============ Agenda ============ */
function AgendaView() {
  const fetch = useServerFn(listAgenda);
  const q = useQuery({ queryKey: ["agenda"], queryFn: () => fetch() });
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <button onClick={() => q.refetch()} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs hover:bg-neutral-50">
          <RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} /> Refrescar
        </button>
      </div>
      {q.isLoading ? <Centered><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></Centered>
        : !q.data?.length ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-sm text-neutral-500">Sin publicaciones agendadas.</div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full text-sm">
              <thead className="bg-neutral-50 text-left text-xs uppercase text-neutral-500">
                <tr><th className="px-3 py-2">Fecha</th><th className="px-3 py-2">Producto</th><th className="px-3 py-2">Canal</th><th className="px-3 py-2">Tipo</th><th className="px-3 py-2">Estado</th></tr>
              </thead>
              <tbody>
                {q.data.map(a => (
                  <tr key={a.id} className="border-t border-neutral-200">
                    <td className="px-3 py-2">{a.fecha}</td>
                    <td className="px-3 py-2 font-mono text-xs">{a.producto_id}</td>
                    <td className="px-3 py-2">{a.canal}</td>
                    <td className="px-3 py-2">{a.tipo}</td>
                    <td className="px-3 py-2"><span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${badgeColor(a.estado)}`}>{a.estado}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
    </div>
  );
}

/* ============ Landing (pestaña Productos del Sheet) ============ */
function LandingView() {
  const qc = useQueryClient();
  const fetchLanding = useServerFn(listSheetProducts);
  const updLanding = useServerFn(updateSheetProduct);
  const q = useQuery({ queryKey: ["sheet-products"], queryFn: () => fetchLanding() });
  const [editing, setEditing] = useState<SheetProduct | null>(null);

  const mut = useMutation({
    mutationFn: (v: SheetProduct) => updLanding({ data: {
      rowIndex: v.rowIndex, nombre: v.nombre, categoria: v.categoria, precio: v.precio,
      descripcion: v.descripcion, imagen_url: v.imagen_url, activo: v.activo, destacado: v.destacado,
    }}),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["sheet-products"] }); toast.success("Landing actualizada"); },
    onError: (e) => toast.error((e as Error).message),
  });

  const delFn = useServerFn(bulkDeleteByCategories);
  const delMut = useMutation({
    mutationFn: (cats: string[]) => delFn({ data: { categorias: cats } }),
    onSuccess: (r: any) => { qc.invalidateQueries({ queryKey: ["sheet-products"] }); toast.success(`${r?.cleared ?? 0} filas eliminadas`); },
    onError: (e) => toast.error((e as Error).message),
  });

  const bulkDelete = (cats: string[], label: string) => {
    if (!confirm(`¿Eliminar TODOS los productos de "${label}" del Sheet? Esta acción no se puede deshacer.`)) return;
    delMut.mutate(cats);
  };

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <button onClick={() => q.refetch()} className="inline-flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs hover:bg-neutral-50">
          <RefreshCw className={`h-3.5 w-3.5 ${q.isFetching ? "animate-spin" : ""}`} /> Refrescar
        </button>
        <button onClick={() => bulkDelete(["Zapatillas"], "Zapatillas")} disabled={delMut.isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50">
          Limpiar Zapatillas
        </button>
        <button onClick={() => bulkDelete(["Ofertas"], "Ofertas")} disabled={delMut.isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-300 bg-white px-2.5 py-1.5 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50">
          Limpiar Ofertas
        </button>
        <button onClick={() => bulkDelete(["Zapatillas", "Ofertas"], "Zapatillas + Ofertas")} disabled={delMut.isPending}
          className="inline-flex items-center gap-1.5 rounded-md border border-red-400 bg-red-600 px-2.5 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-50">
          Limpiar Zapatillas + Ofertas
        </button>
        <span className="ml-auto text-xs text-neutral-500">{q.data?.length ?? 0} en el Sheet</span>
      </div>
      {q.isLoading ? <Centered><Loader2 className="h-5 w-5 animate-spin text-neutral-400" /></Centered>
        : !q.data?.length ? (
          <div className="rounded-lg border border-dashed border-neutral-300 bg-neutral-50 py-12 text-center text-sm text-neutral-500">La pestaña <span className="font-mono">Productos</span> está vacía.</div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {q.data.map(p => (
              <div key={p.rowIndex} className={`overflow-hidden rounded-xl border bg-white shadow-sm ${p.activo ? "border-neutral-200" : "border-neutral-200 opacity-60"}`}>
                <div className="aspect-square bg-[#e5e7eb]">
                  {p.imagen_url && <img src={p.imagen_url} alt="" className="h-full w-full object-contain" loading="lazy" />}
                </div>
                <div className="space-y-1.5 p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${p.activo ? "bg-emerald-100 text-emerald-800" : "bg-neutral-200 text-neutral-600"}`}>
                      {p.activo ? "ACTIVO" : "OCULTO"}
                    </span>
                    {p.destacado && <span className="inline-flex items-center gap-0.5 rounded-full bg-orange-100 px-2 py-0.5 text-[10px] font-bold text-orange-700"><Star className="h-3 w-3 fill-orange-500" />DESTACADO</span>}
                  </div>
                  <p className="text-sm font-semibold text-neutral-900">{p.nombre}</p>
                  <p className="text-xs text-neutral-500">{p.categoria} · <span className="font-semibold text-neutral-700">{p.precio}</span></p>
                  <div className="flex flex-wrap gap-1.5 pt-2">
                    <button onClick={() => setEditing(p)} className="inline-flex items-center gap-1 rounded-md bg-orange-500 px-2 py-1 text-[11px] font-semibold text-white hover:bg-orange-600">
                      <Edit3 className="h-3 w-3" /> Editar
                    </button>
                    <button onClick={() => mut.mutate({ ...p, activo: !p.activo })}
                      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-[11px] hover:bg-neutral-50">
                      {p.activo ? "Ocultar" : "Activar"}
                    </button>
                    <button onClick={() => mut.mutate({ ...p, destacado: !p.destacado })}
                      className="rounded-md border border-neutral-300 bg-white px-2 py-1 text-[11px] hover:bg-neutral-50">
                      {p.destacado ? "Quitar destacado" : "Destacar"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      {editing && <LandingEditor producto={editing} onClose={() => setEditing(null)} onSave={(v) => { mut.mutate(v); setEditing(null); }} />}
    </div>
  );
}

function LandingEditor({ producto, onClose, onSave }: { producto: SheetProduct; onClose: () => void; onSave: (v: SheetProduct) => void }) {
  const [v, setV] = useState<SheetProduct>(producto);
  const extraText = (v.imagenes_extra || "").split("|").filter(Boolean).join("\n");
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-3" onClick={onClose}>
      <div onClick={e => e.stopPropagation()} className="max-h-[92vh] w-full max-w-md space-y-3 overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
        <h2 className="text-base font-bold">Editar producto de landing</h2>
        <Inp label="Nombre" v={v.nombre} onC={x => setV(s => ({ ...s, nombre: x }))} />
        <Inp label="Categoría" v={v.categoria} onC={x => setV(s => ({ ...s, categoria: x }))} />
        <Inp label="Precio" v={v.precio} onC={x => setV(s => ({ ...s, precio: x }))} />
        <Inp label="Imagen principal" v={v.imagen_url} onC={x => setV(s => ({ ...s, imagen_url: x }))} />
        <TA
          label="Imágenes extra (una por línea)"
          v={extraText}
          onC={(x) => setV((s) => ({ ...s, imagenes_extra: x.split(/\n+/).map((u) => u.trim()).filter(Boolean).join("|") }))}
          rows={3}
        />
        <TA label="Descripción" v={v.descripcion} onC={x => setV(s => ({ ...s, descripcion: x }))} rows={3} />
        <div className="flex gap-4 text-sm">
          <label className="flex items-center gap-2"><input type="checkbox" checked={v.activo} onChange={e => setV(s => ({ ...s, activo: e.target.checked }))} />Activo</label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={v.destacado} onChange={e => setV(s => ({ ...s, destacado: e.target.checked }))} />Destacado</label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} className="rounded-md border border-neutral-300 px-3 py-2 text-sm">Cancelar</button>
          <button onClick={() => onSave(v)} className="rounded-md bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600">Guardar</button>
        </div>
      </div>
    </div>
  );
}
