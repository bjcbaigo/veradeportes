import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  ExternalLink,
  Instagram,
  Loader2,
  Plug,
  PlugZap,
  RotateCcw,
  Save,
  Send,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import {
  getSocialPublication,
  saveSocialPublicationDraft,
  setSocialPublicationStatus,
} from "@/lib/social-publications.functions";
import {
  disconnectInstagram,
  getInstagramConnectionStatus,
  publishInstagramNow,
  startInstagramConnect,
} from "@/lib/social-connections.functions";
import { INSTAGRAM_PROFESSIONAL_NOTICE } from "@/lib/social-publisher";
import { productUrl } from "@/lib/product-url";

/**
 * Publicación Instagram — ETAPA 2: conexión y publicación reales.
 *
 * Solo se ofrecen como media imágenes YA aprobadas del producto (principal o
 * secundarias); nunca borradores IA privados ni URLs firmadas temporales.
 * Video queda fuera de esta etapa (el catálogo no lo soporta).
 * El token de Meta nunca llega al navegador: todo pasa por funciones de servidor.
 */

export interface InstagramPublicationProducto {
  /** Referencia estable disponible hoy: ID de fila de PRODUCTOS_ADMIN. */
  source_ref: string;
  sku?: string;
  marca?: string;
  modelo?: string;
  categoria?: string;
  subcategoria?: string;
  color?: string;
  descripcion?: string;
  uso?: string;
  ideal_para?: string;
  talles?: string;
  hashtags?: string;
  texto_ig?: string;
}

const SIGNED_HINT = ["token=", "X-Amz-", "/object/sign/"];

/** Descarta URLs firmadas/temporales: solo media estable y aprobada. */
function esEstable(url: string) {
  if (!/^https?:\/\//i.test(url)) return false;
  return !SIGNED_HINT.some((h) => url.includes(h));
}

/** Sugerencia de copy construida SOLO con datos ya registrados en la ficha. */
export function buildCaptionSuggestion(p: InstagramPublicationProducto) {
  if (p.texto_ig?.trim()) return p.texto_ig.trim();
  const titulo = [p.marca, p.modelo].map((x) => (x || "").trim()).filter(Boolean).join(" ");
  const lineas: string[] = [];
  if (titulo) lineas.push(titulo);
  const ficha = [p.categoria, p.subcategoria, p.color].map((x) => (x || "").trim()).filter(Boolean);
  if (ficha.length) lineas.push(ficha.join(" · "));
  if (p.descripcion?.trim()) lineas.push(p.descripcion.trim());
  if (p.uso?.trim()) lineas.push(`Uso recomendado: ${p.uso.trim()}`);
  if (p.ideal_para?.trim()) lineas.push(`Ideal para: ${p.ideal_para.split("|").map((s) => s.trim()).filter(Boolean).join(", ")}`);
  if (p.talles?.trim()) lineas.push(`Talles disponibles: ${p.talles.split("|").map((s) => s.trim()).filter(Boolean).join(", ")}`);
  lineas.push("Consultanos por WhatsApp.");
  return lineas.join("\n");
}

function buildHashtagsSuggestion(p: InstagramPublicationProducto) {
  if (p.hashtags?.trim()) return p.hashtags.trim();
  const base = ["#VeraDeportes"];
  const add = (raw?: string) => {
    const t = (raw || "").trim().replace(/[^\p{L}\p{N}]/gu, "");
    if (t.length > 2) base.push(`#${t}`);
  };
  add(p.marca);
  add(p.categoria);
  return base.slice(0, 6).join(" ");
}

const ESTADO_STYLE: Record<string, string> = {
  BORRADOR: "bg-amber-100 text-amber-800",
  LISTO_PARA_PUBLICAR: "bg-emerald-100 text-emerald-800",
  PUBLICANDO: "bg-sky-100 text-sky-800",
  PUBLICADO: "bg-blue-100 text-blue-700",
  ERROR: "bg-red-100 text-red-700",
};

export function InstagramPublication({
  producto,
  mediaOptions,
}: {
  producto: InstagramPublicationProducto;
  mediaOptions: string[];
}) {
  const qc = useQueryClient();
  const fetchPub = useServerFn(getSocialPublication);
  const savePub = useServerFn(saveSocialPublicationDraft);
  const setStatus = useServerFn(setSocialPublicationStatus);
  const fetchConn = useServerFn(getInstagramConnectionStatus);
  const startConnect = useServerFn(startInstagramConnect);
  const doDisconnect = useServerFn(disconnectInstagram);
  const doPublish = useServerFn(publishInstagramNow);

  const opciones = useMemo(() => [...new Set(mediaOptions.map((u) => u.trim()).filter(esEstable))], [mediaOptions]);

  const key = ["social-publication", producto.source_ref] as const;
  const { data: pub, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchPub({ data: { source_ref: producto.source_ref } }),
    staleTime: 0,
  });

  const connKey = ["instagram-connection"] as const;
  const { data: conn, isLoading: connLoading } = useQuery({
    queryKey: connKey,
    queryFn: () => fetchConn({}),
    staleTime: 30_000,
  });

  const [media, setMedia] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [hidratado, setHidratado] = useState(false);
  const [busy, setBusy] = useState<null | "save" | "status" | "conn" | "publish">(null);

  // Resultado del regreso de OAuth (?instagram=connected|error)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const p = new URLSearchParams(window.location.search);
    const r = p.get("instagram");
    if (!r) return;
    if (r === "connected") toast.success(`Instagram conectado${p.get("ig_user") ? ` como @${p.get("ig_user")}` : ""}.`);
    else toast.error(p.get("ig_msg") || "No se pudo conectar Instagram.");
    p.delete("instagram");
    p.delete("ig_user");
    p.delete("ig_msg");
    const qs = p.toString();
    window.history.replaceState({}, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    qc.invalidateQueries({ queryKey: connKey });
  }, [qc]);

  useEffect(() => {
    if (isLoading || hidratado) return;
    setMedia(pub?.media_url && opciones.includes(pub.media_url) ? pub.media_url : (opciones[0] ?? ""));
    setCaption(pub?.caption ? pub.caption : buildCaptionSuggestion(producto));
    setHashtags(pub?.hashtags ? pub.hashtags : buildHashtagsSuggestion(producto));
    setHidratado(true);
  }, [isLoading, hidratado, pub, opciones, producto]);

  const estado = pub?.status ?? "BORRADOR";
  const listo = estado === "LISTO_PARA_PUBLICAR";
  const publicado = estado === "PUBLICADO";
  const enError = estado === "ERROR";
  const puedePublicar = !!conn?.connected && (listo || enError) && !!pub?.media_url && !!pub?.caption?.trim();

  async function guardar() {
    setBusy("save");
    try {
      const row = await savePub({
        data: {
          source_ref: producto.source_ref,
          source_sku: producto.sku || undefined,
          product_name: [producto.marca, producto.modelo].filter(Boolean).join(" ") || undefined,
          media_url: media || null,
          media_type: "image",
          caption,
          hashtags,
        },
      });
      qc.setQueryData(key, row);
      toast.success("Borrador de publicación guardado.");
      return row;
    } catch (e) {
      toast.error((e as Error).message);
      return null;
    } finally {
      setBusy(null);
    }
  }

  async function marcar(target: "BORRADOR" | "LISTO_PARA_PUBLICAR") {
    if (target === "LISTO_PARA_PUBLICAR") {
      if (!media) { toast.error("Elegí una imagen aprobada del producto."); return; }
      if (!caption.trim()) { toast.error("El texto de la publicación no puede estar vacío."); return; }
    }
    const guardado = await guardar();
    if (!guardado) return;
    setBusy("status");
    try {
      const row = await setStatus({ data: { source_ref: producto.source_ref, status: target } });
      qc.setQueryData(key, row);
      toast.success(target === "LISTO_PARA_PUBLICAR" ? "Marcada como lista para publicar." : "Volvió a borrador.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function conectar() {
    setBusy("conn");
    try {
      const { authorizeUrl } = await startConnect({});
      window.location.href = authorizeUrl;
    } catch (e) {
      toast.error((e as Error).message);
      setBusy(null);
    }
  }

  async function desconectar() {
    if (!window.confirm("¿Desconectar la cuenta de Instagram? Después podés conectar otra cuenta profesional.")) return;
    setBusy("conn");
    try {
      await doDisconnect({});
      await qc.invalidateQueries({ queryKey: connKey });
      toast.success("Cuenta desconectada. Podés conectar otra cuenta profesional.");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function publicarAhora() {
    if (!window.confirm("Se publicará ahora en Instagram con la imagen y el texto guardados. ¿Confirmás?")) return;
    setBusy("publish");
    try {
      await doPublish({ data: { source_ref: producto.source_ref } });
      const row = await fetchPub({ data: { source_ref: producto.source_ref } });
      qc.setQueryData(key, row);
      toast.success("Publicado en Instagram.");
    } catch (e) {
      toast.error((e as Error).message);
      const row = await fetchPub({ data: { source_ref: producto.source_ref } });
      qc.setQueryData(key, row);
    } finally {
      setBusy(null);
    }
  }

  const bloqueadoEdicion = publicado || estado === "PUBLICANDO";

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Instagram className="h-4 w-4 text-pink-600" />
        <p className="text-[13px] font-bold text-neutral-900">Publicación Instagram</p>
        <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${ESTADO_STYLE[estado] ?? "bg-neutral-200 text-neutral-600"}`}>
          {estado.replace(/_/g, " ")}
        </span>
      </div>

      {/* Enlace público del producto: los captions orgánicos de Instagram NO son
          clickeables; el enlace se copia para bio, historias, WhatsApp o Ads. */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
        <p className="min-w-0 break-all text-[11px] text-neutral-500">
          {productUrl({ brand: producto.marca, name: producto.modelo, sku: producto.sku, id: producto.source_ref })}
        </p>
        <button
          type="button"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(
                productUrl({ brand: producto.marca, name: producto.modelo, sku: producto.sku, id: producto.source_ref }),
              );
              toast.success("Enlace del producto copiado.");
            } catch {
              toast.error("No se pudo copiar el enlace.");
            }
          }}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-neutral-300 px-2.5 py-1.5 text-[12px] font-semibold text-neutral-700 hover:bg-neutral-100"
        >
          <Copy className="h-3.5 w-3.5" /> Copiar enlace del producto
        </button>
      </div>

      <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <p className="text-[12px] font-semibold text-amber-800">{INSTAGRAM_PROFESSIONAL_NOTICE}</p>
      </div>

      {/* Estado real de conexión */}
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
        <div className="flex items-start gap-2">
          {conn?.connected ? <PlugZap className="mt-0.5 h-3.5 w-3.5 text-emerald-600" /> : <Plug className="mt-0.5 h-3.5 w-3.5 text-neutral-500" />}
          <div>
            {connLoading ? (
              <p className="text-[12px] font-semibold text-neutral-600">Verificando conexión…</p>
            ) : !conn?.configured ? (
              <>
                <p className="text-[12px] font-semibold text-red-700">Instagram no configurado</p>
                <p className="text-[12px] text-neutral-600">
                  Conectar Instagram queda bloqueado hasta completar estos datos de la app de Meta:
                </p>
                <ul className="mt-1 space-y-1">
                  {(conn?.configItems ?? []).map((it) => (
                    <li key={it.name} className="text-[12px] leading-snug">
                      <span
                        className={`font-bold ${
                          it.state === "ok" ? "text-emerald-700" : it.state === "invalid" ? "text-amber-700" : "text-red-700"
                        }`}
                      >
                        {it.state === "ok" ? "✓" : it.state === "invalid" ? "!" : "✗"} {it.name}
                      </span>{" "}
                      <span className="text-neutral-600">
                        ({it.label}) — {it.state === "missing" ? "falta" : it.state === "invalid" ? "inválido" : "ok"}: {it.detail}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : conn.connected ? (
              <>
                <p className="text-[12px] font-semibold text-emerald-700">
                  Conectado{conn.username ? ` como @${conn.username}` : ""}
                </p>
                <p className="text-[12px] text-neutral-500">
                  ID de cuenta: {conn.externalAccountId}
                  {conn.accountType ? ` · ${conn.accountType}` : ""}
                  {conn.tokenExpiresAt ? ` · vence ${new Date(conn.tokenExpiresAt).toLocaleDateString()}` : ""}
                </p>
              </>
            ) : (
              <>
                <p className="text-[12px] font-semibold text-neutral-800">Configurado · sin cuenta conectada</p>
                <p className="text-[12px] text-neutral-500">Cuenta profesional requerida</p>
              </>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {conn?.configured && !conn.connected && (
            <button type="button" disabled={busy !== null} onClick={conectar}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-pink-600 px-3 text-xs font-semibold text-white hover:bg-pink-700 disabled:opacity-50">
              {busy === "conn" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Instagram className="h-3.5 w-3.5" />} Conectar Instagram
            </button>
          )}
          {conn?.connected && (
            <button type="button" disabled={busy !== null} onClick={desconectar}
              className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 disabled:opacity-50">
              Desconectar
            </button>
          )}
        </div>
      </div>
      {conn?.connected && !conn.remoteRevokeSupported && (
        <p className="mt-1 text-[12px] text-neutral-500">
          Al desconectar se invalida la conexión guardada acá. Para revocar el permiso del lado de Instagram,
          hacelo desde Instagram → Configuración → Apps y sitios web.
        </p>
      )}

      {isLoading ? (
        <div className="mt-3 flex items-center gap-2 text-[12px] text-neutral-500">
          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando publicación…
        </div>
      ) : (
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <div className="space-y-2">
            <div>
              <span className="block text-[12px] font-bold uppercase tracking-wide text-neutral-600">Imagen aprobada</span>
              {opciones.length === 0 ? (
                <p className="mt-1 text-[12px] font-semibold text-red-600">
                  No hay imágenes aprobadas del producto. Cargá o aprobá una imagen antes de preparar la publicación.
                </p>
              ) : (
                <div className="mt-1 flex gap-1.5 overflow-x-auto pb-1">
                  {opciones.map((u) => (
                    <button key={u} type="button" disabled={bloqueadoEdicion} onClick={() => setMedia(u)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white disabled:opacity-60 ${media === u ? "border-pink-500" : "border-neutral-200"}`}>
                      <img src={u} alt="" className="h-full w-full object-contain" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[12px] text-neutral-500">Solo imágenes ya aprobadas (principal o secundarias). Video no disponible en esta etapa.</p>
            </div>

            <label className="block">
              <span className="block text-[12px] font-bold uppercase tracking-wide text-neutral-600">Texto de la publicación</span>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={7} disabled={bloqueadoEdicion}
                className="mt-1 w-full rounded-md border border-neutral-300 px-2.5 py-2 text-sm disabled:bg-neutral-100" />
            </label>

            <label className="block">
              <span className="block text-[12px] font-bold uppercase tracking-wide text-neutral-600">Hashtags</span>
              <input value={hashtags} onChange={(e) => setHashtags(e.target.value)} disabled={bloqueadoEdicion}
                className="mt-1 min-h-[40px] w-full rounded-md border border-neutral-300 px-2.5 py-2 text-sm disabled:bg-neutral-100" />
            </label>

            {publicado ? (
              <div className="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2">
                <p className="text-[12px] font-semibold text-blue-800">
                  Publicado en Instagram{pub?.published_at ? ` el ${new Date(pub.published_at).toLocaleString()}` : ""}.
                </p>
                {pub?.external_post_id && (
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-blue-700">
                    <ExternalLink className="h-3 w-3" /> ID del posteo: {pub.external_post_id}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                <button type="button" onClick={() => { setCaption(buildCaptionSuggestion(producto)); setHashtags(buildHashtagsSuggestion(producto)); }}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-100">
                  <Wand2 className="h-3.5 w-3.5" /> Sugerir texto
                </button>
                <button type="button" disabled={busy !== null} onClick={() => guardar()}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50">
                  {busy === "save" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Guardar borrador
                </button>
                {listo || enError ? (
                  <button type="button" disabled={busy !== null} onClick={() => marcar("BORRADOR")}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-amber-300 bg-amber-50 px-2.5 text-xs font-semibold text-amber-800 hover:bg-amber-100 disabled:opacity-50">
                    <RotateCcw className="h-3.5 w-3.5" /> Volver a borrador
                  </button>
                ) : (
                  <button type="button" disabled={busy !== null || !media || !caption.trim()} onClick={() => marcar("LISTO_PARA_PUBLICAR")}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-emerald-600 px-3 text-xs font-semibold text-white hover:bg-emerald-700 disabled:opacity-50">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Marcar listo para publicar
                  </button>
                )}
                {puedePublicar && (
                  <button type="button" disabled={busy !== null} onClick={publicarAhora}
                    className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md bg-pink-600 px-3 text-xs font-semibold text-white hover:bg-pink-700 disabled:opacity-50">
                    {busy === "publish" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                    {enError ? "Reintentar publicación" : "Publicar ahora"}
                  </button>
                )}
              </div>
            )}
            {pub?.error_message && (
              <p className="rounded-md border border-red-200 bg-red-50 px-2.5 py-1.5 text-[12px] font-semibold text-red-700">
                Instagram: {pub.error_message}
              </p>
            )}
            {listo && !conn?.connected && (
              <p className="text-[12px] text-neutral-500">
                Para publicar desde acá, conectá primero una cuenta profesional de Instagram.
              </p>
            )}
          </div>

          {/* Vista previa: simulación interna del posteo. */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-600">Vista previa (simulación interna)</p>
            <div className="mt-1 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-[11px] font-bold text-white">VD</div>
                <span className="text-[13px] font-semibold text-neutral-900">
                  {conn?.username ? `@${conn.username}` : "Vera Deportes"}
                </span>
              </div>
              <div className="aspect-square w-full bg-neutral-100">
                {media ? <img src={media} alt="" className="h-full w-full object-contain" /> : null}
              </div>
              <div className="space-y-1 px-3 py-2">
                <p className="whitespace-pre-wrap text-[12px] text-neutral-800">{caption}</p>
                <p className="text-[12px] font-semibold text-blue-600">{hashtags}</p>
              </div>
            </div>
            <p className="mt-1 text-[12px] text-neutral-500">
              La publicación real se envía solo cuando presionás “Publicar ahora”. Nada se publica ni se programa automáticamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
