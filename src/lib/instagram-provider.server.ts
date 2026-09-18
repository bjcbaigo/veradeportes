/**
 * Proveedor Instagram — ETAPA 2.
 *
 * Flujo elegido: **Instagram API con Instagram Login** (cuentas PROFESIONALES:
 * Business o Creator). Se elige este flujo porque no requiere una página de
 * Facebook vinculada y permite publicar contenido con los scopes oficiales
 * `instagram_business_basic` + `instagram_business_content_publish`.
 *
 * La alternativa oficial (Facebook Login for Business + Instagram vía Página)
 * queda encapsulada: todo el acoplamiento con Meta vive en este archivo, así
 * que cambiar de flujo no toca el panel ni las funciones de servidor.
 *
 * Nada acá depende de un username o account id fijo: la identidad se obtiene
 * del token y se guarda en `social_connections`.
 *
 * Server-only: nunca importar desde el cliente.
 */

const AUTHORIZE_URL = "https://www.instagram.com/oauth/authorize";
const TOKEN_URL = "https://api.instagram.com/oauth/access_token";
const GRAPH = "https://graph.instagram.com";
const GRAPH_VERSION = "v23.0";

export const IG_SCOPES = "instagram_business_basic,instagram_business_content_publish";

export interface InstagramConfig {
  appId: string;
  appSecret: string;
  redirectUri: string;
}

export type ConfigItemState = "ok" | "missing" | "invalid";

export interface ConfigItem {
  /** Nombre exacto de la variable de entorno. */
  name: string;
  /** Etiqueta legible para el panel. */
  label: string;
  state: ConfigItemState;
  /** Qué hay que corregir (nunca incluye el valor del secreto). */
  detail: string;
}

export interface ConfigCheck {
  configured: boolean;
  /** Nombres exactos de lo que falta o está inválido. */
  missing: string[];
  /** Detalle por variable, para mostrar en la UI. */
  items: ConfigItem[];
  redirectUri: string | null;
}

/** Redirect URI: se prefiere el secreto explícito; si no, se deriva del origen del request. */
export function resolveRedirectUri(origin?: string | null): string | null {
  const explicit = process.env["META_REDIRECT_URI"];
  if (explicit) return explicit;
  if (origin) return `${origin.replace(/\/+$/, "")}/api/public/instagram/callback`;
  return null;
}

function checkAppId(raw: string | undefined): ConfigItem {
  const base = { name: "META_APP_ID", label: "ID de la app de Meta" };
  const v = (raw ?? "").trim();
  if (!v) return { ...base, state: "missing", detail: "Falta cargarlo en los ajustes del proyecto." };
  if (!/^\d{8,25}$/.test(v))
    return { ...base, state: "invalid", detail: "Debe ser el número de ID de la app (solo dígitos, 8 a 25)." };
  return { ...base, state: "ok", detail: "Cargado." };
}

function checkAppSecret(raw: string | undefined): ConfigItem {
  const base = { name: "META_APP_SECRET", label: "Clave secreta de la app de Meta" };
  const v = (raw ?? "").trim();
  if (!v) return { ...base, state: "missing", detail: "Falta cargarla en los ajustes del proyecto." };
  if (v.length < 20 || /\s/.test(v))
    return { ...base, state: "invalid", detail: "Valor demasiado corto o con espacios: copiala completa desde Meta." };
  return { ...base, state: "ok", detail: "Cargada." };
}

function checkRedirect(uri: string | null): ConfigItem {
  const base = { name: "META_REDIRECT_URI", label: "URL de retorno (redirect URI)" };
  if (!uri)
    return {
      ...base,
      state: "missing",
      detail: "No se pudo determinar la URL de retorno; cargá META_REDIRECT_URI.",
    };
  let url: URL;
  try {
    url = new URL(uri);
  } catch {
    return { ...base, state: "invalid", detail: `No es una URL válida: ${uri}` };
  }
  if (url.protocol !== "https:")
    return { ...base, state: "invalid", detail: "Meta exige que empiece con https://" };
  if (url.pathname !== "/api/public/instagram/callback")
    return {
      ...base,
      state: "invalid",
      detail: "Debe terminar en /api/public/instagram/callback",
    };
  return { ...base, state: "ok", detail: uri };
}

export function checkInstagramConfig(origin?: string | null): ConfigCheck {
  const redirectUri = resolveRedirectUri(origin);
  const items = [
    checkAppId(process.env["META_APP_ID"]),
    checkAppSecret(process.env["META_APP_SECRET"]),
    checkRedirect(redirectUri),
  ];
  const missing = items.filter((i) => i.state !== "ok").map((i) => i.name);
  return { configured: missing.length === 0, missing, items, redirectUri };
}

/** Devuelve la config completa o lanza un error explícito con lo que falta. */
export function requireInstagramConfig(origin?: string | null): InstagramConfig {
  const check = checkInstagramConfig(origin);
  if (!check.configured) {
    const detalle = check.items
      .filter((i) => i.state !== "ok")
      .map((i) => `${i.name}: ${i.detail}`)
      .join(" | ");
    throw new Error(`Instagram no está configurado. ${detalle}`);
  }
  return {
    appId: process.env["META_APP_ID"]!.trim(),
    appSecret: process.env["META_APP_SECRET"]!.trim(),
    redirectUri: check.redirectUri!,
  };
}

/** Mensajes de Meta sanitizados: sin tokens, sin secretos, acotados. */
function sanitize(raw: unknown): string {
  let msg = "";
  if (typeof raw === "string") msg = raw;
  else if (raw && typeof raw === "object") {
    const anyRaw = raw as any;
    msg = anyRaw?.error?.message || anyRaw?.error_message || anyRaw?.error_description || JSON.stringify(anyRaw);
  }
  msg = String(msg || "Error desconocido de Instagram");
  const secret = process.env["META_APP_SECRET"];
  if (secret) msg = msg.split(secret).join("***");
  msg = msg.replace(/(access_token=)[^&\s"]+/gi, "$1***").replace(/IG[A-Za-z0-9_-]{20,}/g, "***");
  return msg.slice(0, 500);
}

async function graphJson(url: string, init?: RequestInit): Promise<any> {
  const res = await fetch(url, init);
  let body: any = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }
  if (!res.ok || body?.error) {
    throw new Error(sanitize(body ?? `HTTP ${res.status}`));
  }
  return body;
}

export function buildAuthorizeUrl(cfg: InstagramConfig, state: string): string {
  const p = new URLSearchParams({
    client_id: cfg.appId,
    redirect_uri: cfg.redirectUri,
    response_type: "code",
    scope: IG_SCOPES,
    state,
  });
  return `${AUTHORIZE_URL}?${p.toString()}`;
}

export interface ExchangedToken {
  accessToken: string;
  expiresAt: string | null;
  scopes: string;
}

/** code -> token corto -> token de larga duración (60 días). */
export async function exchangeCodeForToken(cfg: InstagramConfig, code: string): Promise<ExchangedToken> {
  const form = new URLSearchParams({
    client_id: cfg.appId,
    client_secret: cfg.appSecret,
    grant_type: "authorization_code",
    redirect_uri: cfg.redirectUri,
    code,
  });
  const short = await graphJson(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: form.toString(),
  });
  const shortToken = short?.access_token as string | undefined;
  if (!shortToken) throw new Error("Instagram no devolvió un token de acceso.");
  const scopes = Array.isArray(short?.permissions) ? short.permissions.join(",") : IG_SCOPES;

  const longUrl = `${GRAPH}/access_token?grant_type=ig_exchange_token&client_secret=${encodeURIComponent(
    cfg.appSecret,
  )}&access_token=${encodeURIComponent(shortToken)}`;
  try {
    const long = await graphJson(longUrl);
    const token = (long?.access_token as string) || shortToken;
    const expiresIn = Number(long?.expires_in ?? 0);
    return {
      accessToken: token,
      expiresAt: expiresIn > 0 ? new Date(Date.now() + expiresIn * 1000).toISOString() : null,
      scopes,
    };
  } catch {
    // Si el intercambio a larga duración falla, se conserva el token corto.
    return { accessToken: shortToken, expiresAt: null, scopes };
  }
}

export interface InstagramIdentity {
  id: string;
  username: string | null;
  accountType: string | null;
}

export async function fetchIdentity(accessToken: string): Promise<InstagramIdentity> {
  const url = `${GRAPH}/${GRAPH_VERSION}/me?fields=user_id,username,account_type&access_token=${encodeURIComponent(
    accessToken,
  )}`;
  const me = await graphJson(url);
  const id = String(me?.user_id ?? me?.id ?? "");
  if (!id) throw new Error("No se pudo identificar la cuenta de Instagram.");
  return {
    id,
    username: me?.username ? String(me.username) : null,
    accountType: me?.account_type ? String(me.account_type) : null,
  };
}

/** Publicación oficial de imagen: contenedor de media + media_publish. */
export async function publishImage(args: {
  accessToken: string;
  igUserId: string;
  imageUrl: string;
  caption: string;
}): Promise<string> {
  const create = new URLSearchParams({
    image_url: args.imageUrl,
    caption: args.caption,
    access_token: args.accessToken,
  });
  const container = await graphJson(`${GRAPH}/${GRAPH_VERSION}/${args.igUserId}/media`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: create.toString(),
  });
  const creationId = container?.id as string | undefined;
  if (!creationId) throw new Error("Instagram no devolvió el contenedor de la publicación.");

  const publish = new URLSearchParams({ creation_id: creationId, access_token: args.accessToken });
  const posted = await graphJson(`${GRAPH}/${GRAPH_VERSION}/${args.igUserId}/media_publish`, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: publish.toString(),
  });
  const postId = posted?.id as string | undefined;
  if (!postId) throw new Error("Instagram no devolvió el identificador del posteo.");
  return postId;
}

/**
 * Revocación remota: la API de Instagram Login no expone hoy un endpoint de
 * revocación de permisos para el propio token (solo el usuario puede quitar el
 * acceso desde Instagram → Apps y sitios web). Por eso la desconexión invalida
 * la conexión local y se documenta la revocación remota como paso manual.
 */
export const REMOTE_REVOKE_SUPPORTED = false;

export { sanitize as sanitizeInstagramError };
