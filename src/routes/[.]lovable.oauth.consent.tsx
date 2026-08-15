import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { oauthApi, type OAuthDetails } from "@/lib/oauth-consent";


export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search }) => {
    if (!search.authorization_id) throw new Error("Falta authorization_id");
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data: sess } = await supabase.auth.getSession();
    if (!sess.session) return { needsAuth: true as const, details: null, authorizationId };
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return { needsAuth: false as const, details: data, authorizationId };
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>No se pudo cargar la autorización</h1>
      <p>{String((error as Error)?.message ?? error)}</p>
    </main>
  ),
});

function Consent() {
  const data = Route.useLoaderData();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  if (data.needsAuth) return <LoginPanel authorizationId={data.authorizationId} />;

  const details = data.details;
  const clientName = details?.client?.name ?? "esta aplicación externa";

  async function decide(approve: boolean) {
    setBusy(true);
    setErr(null);
    const api = oauthApi();
    const { data: res, error } = approve
      ? await api.approveAuthorization(data.authorizationId)
      : await api.denyAuthorization(data.authorizationId);
    if (error) { setBusy(false); setErr(error.message); return; }
    const target = res?.redirect_url ?? res?.redirect_to;
    if (!target) { setBusy(false); setErr("El servidor de autorización no devolvió redirección."); return; }
    window.location.href = target;
  }

  return (
    <main style={panelStyle}>
      <div style={cardStyle}>
        <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>Conectar {clientName} a tu cuenta</h1>
        <p style={{ color: "#4A5A78", marginTop: 0 }}>
          {clientName} podrá usar las herramientas de Vera Deportes actuando como vos.
          Esto no salta las políticas de la app: solo verás lo que tu rol permite.
        </p>
        {err && <p role="alert" style={{ color: "#D9344A" }}>{err}</p>}
        <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
          <button disabled={busy} onClick={() => decide(true)} style={primaryBtn}>Aprobar</button>
          <button disabled={busy} onClick={() => decide(false)} style={secondaryBtn}>Rechazar</button>
        </div>
      </div>
    </main>
  );
}

function LoginPanel({ authorizationId }: { authorizationId: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setBusy(false); setErr(error.message); return; }
    // Reload the same URL so the loader re-runs with a session.
    window.location.reload();
  }

  return (
    <main style={panelStyle}>
      <form onSubmit={onSubmit} style={cardStyle}>
        <h1 style={{ margin: "0 0 8px", fontSize: 22 }}>Iniciar sesión</h1>
        <p style={{ color: "#4A5A78", marginTop: 0 }}>
          Necesitás iniciar sesión con tu cuenta admin de Vera Deportes para autorizar esta conexión.
        </p>
        <input
          type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
          placeholder="Email" style={inputStyle} autoComplete="email"
        />
        <input
          type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
          placeholder="Contraseña" style={inputStyle} autoComplete="current-password"
        />
        {err && <p role="alert" style={{ color: "#D9344A", margin: "8px 0" }}>{err}</p>}
        <button type="submit" disabled={busy} style={primaryBtn}>
          {busy ? "Ingresando..." : "Ingresar"}
        </button>
        <input type="hidden" value={authorizationId} readOnly />
      </form>
    </main>
  );
}

const panelStyle: React.CSSProperties = {
  minHeight: "100vh", display: "grid", placeItems: "center",
  background: "#F4F7FC", fontFamily: "system-ui, sans-serif", padding: 16,
};
const cardStyle: React.CSSProperties = {
  background: "#fff", padding: 24, borderRadius: 12,
  boxShadow: "0 4px 12px rgba(13,27,62,0.08)", maxWidth: 420, width: "100%",
  display: "flex", flexDirection: "column", gap: 8,
};
const inputStyle: React.CSSProperties = {
  padding: "10px 12px", border: "1px solid #D8E0EF", borderRadius: 8, fontSize: 14,
};
const primaryBtn: React.CSSProperties = {
  padding: "10px 16px", background: "#0D2B6E", color: "#fff",
  border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600,
};
const secondaryBtn: React.CSSProperties = {
  padding: "10px 16px", background: "#fff", color: "#0D2B6E",
  border: "1px solid #D8E0EF", borderRadius: 8, cursor: "pointer", fontWeight: 600,
};
