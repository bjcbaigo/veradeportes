import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, Check, Loader2, RefreshCw, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  CONTENT_VARIANTS, CONTENT_VARIANT_LABELS,
  generateProductContentDraft, deleteProductContentDraft, promoteProductContentDraft,
  type ContentVariantId,
} from "@/lib/product-content-ai.functions";

/**
 * Contenido IA — Fase 2.
 * TRAZABILIDAD: el estado de los borradores (variante, timestamp, estado) es
 * TEMPORAL POR SESIÓN (estado de React). No hay tabla ni columnas nuevas en esta
 * fase; el archivo del borrador vive en el bucket PRIVADO "ai-drafts" y solo se
 * previsualiza con signed URLs temporales.
 * La foto original cargada es siempre la fuente de verdad y nunca se reemplaza
 * automáticamente. Al aprobar, el archivo se copia a un almacenamiento estable y
 * se usa una URL que no expira; recién se persiste al presionar "Guardar cambios".
 * La IA INTENTA preservar el producto: no hay garantía de fidelidad.
 */

type DraftEstado = "GENERANDO" | "BORRADOR" | "APROBADO PARA USO" | "DESCARTADO";

interface Draft {
  variant: ContentVariantId;
  estado: DraftEstado;
  /** Signed URL temporal, solo preview. Nunca se guarda en imagenes_extra. */
  previewUrl?: string;
  /** Ruta en el bucket privado; permite borrar o promover. */
  path?: string;
  createdAt?: string;
  error?: string;
}

export interface AiContentProducto {
  imagen_url: string;
  marca?: string;
  modelo?: string;
  categoria?: string;
  color?: string;
  descripcion?: string;
}

const ESTADO_STYLE: Record<DraftEstado, string> = {
  GENERANDO: "bg-blue-100 text-blue-700",
  BORRADOR: "bg-amber-100 text-amber-800",
  "APROBADO PARA USO": "bg-emerald-100 text-emerald-800",
  DESCARTADO: "bg-neutral-200 text-neutral-600",
};

function fmt(iso?: string) {
  if (!iso) return "";
  return new Intl.DateTimeFormat("es-AR", {
    timeZone: "America/Argentina/Buenos_Aires",
    day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
  }).format(new Date(iso));
}

export function AiContentStudio({
  producto,
  onUseAsSecondary,
  baseAprobada,
}: {
  producto: AiContentProducto;
  onUseAsSecondary: (url: string) => void;
  /** URL de la imagen base APROBADA en la mesa de trabajo. Sin esto no se genera. */
  baseAprobada?: string | null;
}) {
  const generate = useServerFn(generateProductContentDraft);
  const removeDraft = useServerFn(deleteProductContentDraft);
  const promote = useServerFn(promoteProductContentDraft);
  const [drafts, setDrafts] = useState<Partial<Record<ContentVariantId, Draft>>>({});
  const [confirmar, setConfirmar] = useState<ContentVariantId | null>(null);
  const [ocupado, setOcupado] = useState<ContentVariantId | null>(null);

  const base = (baseAprobada ?? "").trim();
  const sinOriginal = !base && !producto.imagen_url?.trim();
  const sinBase = !base;

  async function run(variant: ContentVariantId) {
    const anterior = drafts[variant];
    setDrafts(s => ({ ...s, [variant]: { variant, estado: "GENERANDO" } }));
    try {
      const r = await generate({
        data: {
          variant,
          imagen_url: base || producto.imagen_url,
          marca: producto.marca || undefined,
          modelo: producto.modelo || undefined,
          categoria: producto.categoria || undefined,
          color: producto.color || undefined,
          descripcion: producto.descripcion || undefined,
        },
      });
      setDrafts(s => ({
        ...s,
        [variant]: { variant, estado: "BORRADOR", previewUrl: r.previewUrl, path: r.path, createdAt: r.createdAt },
      }));
      // Recién con el nuevo borrador a salvo eliminamos el anterior: así un fallo
      // de generación nunca hace perder el borrador previo. No se borra si ya fue
      // aprobado (en ese caso el archivo se movió al almacenamiento estable).
      if (anterior?.path && anterior.estado !== "APROBADO PARA USO") {
        try {
          await removeDraft({ data: { path: anterior.path } });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "error desconocido";
          toast.error(`No se pudo eliminar el borrador anterior: ${msg}`);
        }
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Error desconocido";
      // Ante cualquier fallo del modelo/gateway no se altera nada de la ficha
      // y se conserva el borrador anterior si existía.
      setDrafts(s => ({ ...s, [variant]: anterior ? { ...anterior, error: msg } : { variant, estado: "DESCARTADO", error: msg } }));
      toast.error(`No se pudo generar «${CONTENT_VARIANT_LABELS[variant]}»: ${msg}`);
    }
  }

  async function descartar(variant: ContentVariantId) {
    const d = drafts[variant];
    setOcupado(variant);
    try {
      if (d?.path && d.estado !== "APROBADO PARA USO") {
        await removeDraft({ data: { path: d.path } });
      }
      setDrafts(s => ({ ...s, [variant]: { variant, estado: "DESCARTADO" } }));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error desconocido";
      toast.error(`No se pudo eliminar el archivo del borrador: ${msg}`);
    } finally {
      setOcupado(null);
    }
  }

  async function usar(variant: ContentVariantId) {
    const d = drafts[variant];
    if (!d?.path) return;
    setOcupado(variant);
    try {
      // Promovemos a almacenamiento estable: la URL guardada no expira.
      const { url } = await promote({ data: { path: d.path } });
      onUseAsSecondary(url);
      setDrafts(s => ({ ...s, [variant]: { ...d, estado: "APROBADO PARA USO" } }));
      setConfirmar(null);
      toast.success("Agregada como imagen secundaria. Guardá los cambios para confirmar.");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "error desconocido";
      toast.error(`No se pudo usar el borrador: ${msg}`);
    } finally {
      setOcupado(null);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles className="h-4 w-4 text-violet-600" />
        <p className="text-[13px] font-bold text-neutral-900">Contenido IA</p>
        <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[12px] font-bold text-violet-700">Borradores</span>
      </div>
      <p className="mt-1 text-[12px] text-neutral-600">
        La foto original cargada es la fuente de verdad y nunca se reemplaza automáticamente. Los borradores
        no se publican ni se guardan en el catálogo hasta que los uses y presiones <span className="font-semibold">Guardar cambios</span>.
      </p>
      <div className="mt-2 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
        <div>
          <p className="text-[12px] font-semibold text-amber-800">Imagen generada con IA — revisar fidelidad antes de usar.</p>
          <p className="text-[12px] font-semibold text-amber-800">
            La IA puede alterar detalles del producto. Compará siempre con la foto original antes de aprobar.
          </p>
          <p className="mt-0.5 text-[12px] text-amber-700">
            El modelo intenta preservar forma, color y logos, pero no lo garantiza. La aprobación siempre es manual.
          </p>
        </div>
      </div>
      {!sinOriginal && sinBase && (
        <p className="mt-2 text-[12px] font-semibold text-amber-700">
          Primero aprobá una imagen base en «Mejorar fotos». Las variantes IA siempre parten de una imagen aprobada.
        </p>
      )}
      {sinOriginal && (
        <p className="mt-2 text-[12px] font-semibold text-red-600">
          Cargá primero la imagen principal del producto para poder generar borradores.
        </p>
      )}
      <p className="mt-2 text-[12px] text-neutral-500">
        Historial temporal de esta sesión: al cerrar el editor se pierde el listado de borradores y las vistas
        previas dejan de estar disponibles.
      </p>

      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {CONTENT_VARIANTS.map((variant) => {
          const d = drafts[variant];
          const estado: DraftEstado = d?.estado ?? "DESCARTADO";
          const generando = estado === "GENERANDO";
          const trabajando = ocupado === variant;
          return (
            <div key={variant} className="rounded-lg border border-neutral-200 bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[13px] font-semibold text-neutral-800">{CONTENT_VARIANT_LABELS[variant]}</span>
                <span className={`rounded-full px-2 py-0.5 text-[12px] font-bold ${d ? ESTADO_STYLE[estado] : "bg-neutral-100 text-neutral-500"}`}>
                  {d ? estado : "No generado"}
                </span>
              </div>

              {d?.previewUrl && (
                <div className="mt-2 overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
                  <img src={d.previewUrl} alt={`Borrador ${CONTENT_VARIANT_LABELS[variant]}`} className="aspect-square w-full object-cover" />
                </div>
              )}
              {generando && (
                <div className="mt-2 grid aspect-square w-full place-items-center rounded-lg border border-dashed border-neutral-300 bg-neutral-50">
                  <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
                </div>
              )}
              {d?.error && <p className="mt-2 text-[12px] text-red-600">{d.error}</p>}
              {d?.createdAt && (
                <p className="mt-1 text-[12px] text-neutral-500">
                  {CONTENT_VARIANT_LABELS[variant]} · {fmt(d.createdAt)}
                </p>
              )}

              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  disabled={generando || sinOriginal || sinBase || trabajando}
                  onClick={() => run(variant)}
                  className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-violet-300 bg-violet-50 px-2.5 py-1.5 text-xs font-semibold text-violet-700 hover:bg-violet-100 disabled:opacity-50"
                >
                  {generando ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                  {d?.previewUrl ? "Regenerar" : "Generar borrador"}
                </button>
                {d?.previewUrl && (
                  <>
                    <button
                      type="button"
                      disabled={trabajando}
                      onClick={() => descartar(variant)}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-2.5 py-1.5 text-xs hover:bg-neutral-50 disabled:opacity-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Descartar
                    </button>
                    <button
                      type="button"
                      disabled={trabajando || estado === "APROBADO PARA USO"}
                      onClick={() => setConfirmar(variant)}
                      className="inline-flex min-h-[36px] items-center gap-1.5 rounded-md border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> Usar como secundaria
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {confirmar && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-black/50 p-3" onClick={() => setConfirmar(null)}>
          <div onClick={e => e.stopPropagation()} className="w-full max-w-sm space-y-3 rounded-2xl bg-white p-5 shadow-xl">
            <h3 className="text-base font-bold">Usar como imagen secundaria</h3>
            <p className="text-xs text-neutral-600">
              Se agrega el borrador de <span className="font-semibold">{CONTENT_VARIANT_LABELS[confirmar]}</span> a las
              imágenes secundarias del formulario. La imagen principal no cambia y nada se guarda hasta que presiones
              «Guardar cambios».
            </p>
            <p className="text-xs font-semibold text-amber-700">
              Verificá antes que el borrador coincida con la foto original: la IA puede alterar detalles.
            </p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setConfirmar(null)} className="min-h-[40px] rounded-md border border-neutral-300 bg-white px-3 text-sm hover:bg-neutral-50">Cancelar</button>
              <button
                disabled={ocupado === confirmar}
                onClick={() => usar(confirmar)}
                className="min-h-[40px] rounded-md bg-emerald-600 px-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-50"
              >
                {ocupado === confirmar ? "Procesando…" : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
