import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  listSheetProducts,
  updateSheetProduct,
  type SheetProduct,
} from "@/lib/sheet-products.functions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Vera Deportes" }, { name: "robots", content: "noindex" }] }),
  component: AdminPage,
});

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

  if (loading) return <div className="p-8 text-center">Cargando…</div>;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Toaster />
      {session ? <Panel onLogout={() => supabase.auth.signOut()} /> : <LoginForm />}
    </main>
  );
}

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
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) throw error;
        toast.success("Cuenta creada. Revisá tu email para confirmar.");
      }
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border border-border bg-card p-6">
        <h1 className="font-display text-2xl font-bold">Admin Vera Deportes</h1>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña</Label>
          <Input id="password" type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "..." : mode === "login" ? "Ingresar" : "Crear cuenta"}
        </Button>
        <button
          type="button"
          className="w-full text-sm text-muted-foreground hover:text-foreground"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "¿No tenés cuenta? Registrate" : "Ya tengo cuenta"}
        </button>
      </form>
    </div>
  );
}

function Panel({ onLogout }: { onLogout: () => void }) {
  const fetchList = useServerFn(listSheetProducts);
  const [items, setItems] = useState<SheetProduct[] | null>(null);
  const [reloading, setReloading] = useState(false);

  async function refresh() {
    setReloading(true);
    try {
      const data = await fetchList();
      setItems(data);
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setReloading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  return (
    <div className="mx-auto max-w-4xl p-4 md:p-8">
      <header className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-bold">Productos</h1>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refresh} disabled={reloading}>
            {reloading ? "..." : "Recargar"}
          </Button>
          <Button variant="ghost" size="sm" onClick={onLogout}>Salir</Button>
        </div>
      </header>

      {!items ? (
        <p className="text-muted-foreground">Cargando productos…</p>
      ) : (
        <div className="space-y-3">
          {items.map((p) => (
            <ProductRow key={p.rowIndex} product={p} onSaved={refresh} />
          ))}
        </div>
      )}
    </div>
  );
}

function ProductRow({ product, onSaved }: { product: SheetProduct; onSaved: () => void }) {
  const save = useServerFn(updateSheetProduct);
  const [p, setP] = useState(product);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(file: File) {
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `producto-${p.id}-${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("productos").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });
      if (error) throw error;
      const { data } = supabase.storage.from("productos").getPublicUrl(path);
      setP({ ...p, imagen_url: data.publicUrl });
      toast.success("Foto subida. Acordate de guardar.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  async function handleSave() {
    setBusy(true);
    try {
      await save({
        data: {
          rowIndex: p.rowIndex,
          nombre: p.nombre,
          categoria: p.categoria,
          precio: p.precio,
          descripcion: p.descripcion,
          imagen_url: p.imagen_url,
          activo: p.activo,
          destacado: p.destacado,
        },
      });
      toast.success("Guardado");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex gap-4">
        <div className="h-24 w-24 shrink-0 rounded-lg bg-[#e5e7eb] overflow-hidden flex items-center justify-center">
          {p.imagen_url ? (
            <img src={p.imagen_url} alt={p.nombre} className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">sin foto</span>
          )}
        </div>
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">#{p.id}</span>
            <Input value={p.nombre} onChange={(e) => setP({ ...p, nombre: e.target.value })} className="h-8 text-sm font-semibold" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Input value={p.categoria} onChange={(e) => setP({ ...p, categoria: e.target.value })} className="h-8 text-xs" placeholder="Categoría" />
            <Input value={p.precio} onChange={(e) => setP({ ...p, precio: e.target.value })} className="h-8 text-xs" placeholder="Precio" />
          </div>
        </div>
      </div>

      <Textarea
        value={p.descripcion}
        onChange={(e) => setP({ ...p, descripcion: e.target.value })}
        rows={3}
        className="mt-3 text-sm"
        placeholder="Descripción"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" checked={p.activo} onChange={(e) => setP({ ...p, activo: e.target.checked })} />
          Activo
        </label>
        <label className="inline-flex items-center gap-1 text-xs">
          <input type="checkbox" checked={p.destacado} onChange={(e) => setP({ ...p, destacado: e.target.checked })} />
          Destacado
        </label>
        <div className="ml-auto flex gap-2">
          <label className="inline-flex">
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
            />
            <span className="inline-flex h-8 cursor-pointer items-center rounded-md border border-input bg-background px-3 text-xs font-medium hover:bg-accent">
              {uploading ? "Subiendo…" : "Subir foto"}
            </span>
          </label>
          <Button size="sm" onClick={handleSave} disabled={busy}>
            {busy ? "..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
}
