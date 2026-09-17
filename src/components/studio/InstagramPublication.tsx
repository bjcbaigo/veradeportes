import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, Instagram, Loader2, Plug, RotateCcw, Save, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  getSocialPublication,
  saveSocialPublicationDraft,
  setSocialPublicationStatus,
} from "@/lib/social-publications.functions";
import { instagramPublisherStub, INSTAGRAM_NOT_CONNECTED_MESSAGE } from "@/lib/social-publisher";

/**
 * Publicación Instagram — ETAPA 1: preparación interna.
 * No hay conexión con Meta ni publicación externa. Solo BORRADOR y LISTO_PARA_PUBLICAR,
 * siempre con acción manual del operador (aprobación humana obligatoria).
 * Solo se ofrecen como media imágenes YA aprobadas del producto (principal o secundarias);
 * nunca borradores IA privados ni URLs firmadas temporales.
 * Video: el catálogo no soporta video hoy, así que queda fuera de esta etapa.
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

  const opciones = useMemo(() => [...new Set(mediaOptions.map((u) => u.trim()).filter(esEstable))], [mediaOptions]);
  const conexion = useMemo(() => instagramPublisherStub, []);
  const [conn, setConn] = useState<{ connected: boolean; detail: string }>({ connected: false, detail: "Cuenta profesional requerida" });

  const key = ["social-publication", producto.source_ref] as const;
  const { data: pub, isLoading } = useQuery({
    queryKey: key,
    queryFn: () => fetchPub({ data: { source_ref: producto.source_ref } }),
    staleTime: 0,
  });

  const [media, setMedia] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [hidratado, setHidratado] = useState(false);
  const [busy, setBusy] = useState<null | "save" | "status">(null);

  useEffect(() => {
    conexion.getConnection().then((c) => setConn({ connected: c.connected, detail: c.detail }));
  }, [conexion]);

  useEffect(() => {
    if (isLoading || hidratado) return;
    setMedia(pub?.media_url && opciones.includes(pub.media_url) ? pub.media_url : (opciones[0] ?? ""));
    setCaption(pub?.caption ? pub.caption : buildCaptionSuggestion(producto));
    setHashtags(pub?.hashtags ? pub.hashtags : buildHashtagsSuggestion(producto));
    setHidratado(true);
  }, [isLoading, hidratado, pub, opciones, producto]);

  const estado = pub?.status ?? "BORRADOR";
  const listo = estado === "LISTO_PARA_PUBLICAR";

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

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Instagram className="h-4 w-4 text-pink-600" />
        <p className="text-[13px] font-bold text-neutral-900">Publicación Instagram</p>
        <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${ESTADO_STYLE[estado] ?? "bg-neutral-200 text-neutral-600"}`}>
          {estado.replace(/_/g, " ")}
        </span>
      </div>

      <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <p className="text-[12px] font-semibold text-amber-800">{INSTAGRAM_NOT_CONNECTED_MESSAGE}</p>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-neutral-200 bg-white px-3 py-2">
        <div className="flex items-center gap-2">
          <Plug className="h-3.5 w-3.5 text-neutral-500" />
          <div>
            <p className="text-[12px] font-semibold text-neutral-800">Conexión Instagram · {conn.connected ? "Conectado" : "No conectado"}</p>
            <p className="text-[12px] text-neutral-500">{conn.detail}</p>
          </div>
        </div>
        <button type="button" disabled title="Disponible en la Etapa 2"
          className="min-h-[36px] cursor-not-allowed rounded-md border border-neutral-300 bg-neutral-100 px-2.5 text-xs font-semibold text-neutral-500">
          Conectar Instagram — Próximamente (Etapa 2)
        </button>
      </div>

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
                    <button key={u} type="button" onClick={() => setMedia(u)}
                      className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-white ${media === u ? "border-pink-500" : "border-neutral-200"}`}>
                      <img src={u} alt="" className="h-full w-full object-contain" loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
              <p className="mt-1 text-[12px] text-neutral-500">Solo imágenes ya aprobadas (principal o secundarias). Video no disponible en esta etapa.</p>
            </div>

            <label className="block">
              <span className="block text-[12px] font-bold uppercase tracking-wide text-neutral-600">Texto de la publicación</span>
              <textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={7}
                className="mt-1 w-full rounded-md border border-neutral-300 px-2.5 py-2 text-sm" />
            </label>

            <label className="block">
              <span className="block text-[12px] font-bold uppercase tracking-wide text-neutral-600">Hashtags</span>
              <input value={hashtags} onChange={(e) => setHashtags(e.target.value)}
                className="mt-1 min-h-[40px] w-full rounded-md border border-neutral-300 px-2.5 py-2 text-sm" />
            </label>

            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => { setCaption(buildCaptionSuggestion(producto)); setHashtags(buildHashtagsSuggestion(producto)); }}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-2.5 text-xs font-semibold text-violet-700 hover:bg-violet-100">
                <Wand2 className="h-3.5 w-3.5" /> Sugerir texto
              </button>
              <button type="button" disabled={busy !== null} onClick={() => guardar()}
                className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50">
                {busy === "save" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Guardar borrador
              </button>
              {listo ? (
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
            </div>
            {pub?.error_message && <p className="text-[12px] text-red-600">{pub.error_message}</p>}
          </div>

          {/* Vista previa: simulación interna, no es Instagram real. */}
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-600">Vista previa (simulación interna)</p>
            <div className="mt-1 overflow-hidden rounded-xl border border-neutral-200 bg-white">
              <div className="flex items-center gap-2 px-3 py-2">
                <div className="grid h-7 w-7 place-items-center rounded-full bg-gradient-to-br from-pink-500 to-orange-400 text-[11px] font-bold text-white">VD</div>
                <span className="text-[13px] font-semibold text-neutral-900">Vera Deportes</span>
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
              Simulación interna del posteo. No se envía nada a Instagram, Facebook ni WhatsApp.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
