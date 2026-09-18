import { useEffect, useMemo, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Check, Image as ImageIcon, Loader2, RefreshCw, Trash2, Wand2 } from "lucide-react";
import { toast } from "sonner";
import {
  DEFAULT_OPTIONS, FONDOS, LIMITES, PRESETS, processImage,
  type PresetId, type FondoId, type ProcessedImage,
} from "@/lib/image-processing";
import { formatBytes } from "@/lib/image-optimize";
import {
  listProductAssets, registerOriginalAsset, saveProcessedAsset, approveAsset, discardAsset,
  type ProductAsset,
} from "@/lib/product-assets.functions";

/**
 * Mesa de trabajo de imágenes (Opción B) — mobile-first.
 *
 * Mejora DETERMINÍSTICA (sin IA): orientación, encuadre por preset, tamaño/peso,
 * brillo/contraste/nitidez moderados. La imagen ORIGINAL nunca se modifica ni se
 * reemplaza: se registra por referencia y queda inmutable.
 *
 * LIMITACIÓN EXPLÍCITA: el recorte automático del producto para dejar fondo
 * blanco real no puede garantizarse con las capacidades determinísticas actuales.
 * El "relleno" solo pinta el área que sobra del encuadre. Para fondo limpio real
 * se usa la variante IA "Catálogo limpio", con aprobación humana.
 */

const ESTADO_STYLE: Record<string, string> = {
  ORIGINAL: "bg-neutral-200 text-neutral-700",
  PROCESADA: "bg-amber-100 text-amber-800",
  APROBADA: "bg-emerald-100 text-emerald-800",
  DESCARTADA: "bg-neutral-100 text-neutral-500",
};

const ROL_LABEL: Record<string, string> = {
  PRINCIPAL: "Principal",
  SECUNDARIA: "Secundaria",
  CATALOGO: "Catálogo",
  INSTAGRAM: "Instagram",
  DETALLE: "Detalle",
  EDITORIAL: "Editorial",
  MODELO_IA: "Modelo IA",
};

export interface ImageWorkbenchProps {
  sourceRef: string;
  sourceSku?: string;
  originalUrl: string;
  onApproveMain: (url: string) => void;
  onApproveSecondary: (url: string) => void;
  /** Avisa al editor de la URL aprobada más reciente (para habilitar Contenido IA). */
  onApprovedChange?: (url: string | null) => void;
}

export function ImageWorkbench({
  sourceRef, sourceSku, originalUrl, onApproveMain, onApproveSecondary, onApprovedChange,
}: ImageWorkbenchProps) {
  const listFn = useServerFn(listProductAssets);
  const registerFn = useServerFn(registerOriginalAsset);
  const saveFn = useServerFn(saveProcessedAsset);
  const approveFn = useServerFn(approveAsset);
  const discardFn = useServerFn(discardAsset);

  const [assets, setAssets] = useState<ProductAsset[]>([]);
  const [cargando, setCargando] = useState(true);
  const [trabajando, setTrabajando] = useState<string | null>(null);
  const [preset, setPreset] = useState<PresetId>(DEFAULT_OPTIONS.preset);
  const [fondo, setFondo] = useState<FondoId>(DEFAULT_OPTIONS.fondo);
  const [brillo, setBrillo] = useState(DEFAULT_OPTIONS.brillo);
  const [contraste, setContraste] = useState(DEFAULT_OPTIONS.contraste);
  const [nitidez, setNitidez] = useState(DEFAULT_OPTIONS.nitidez);
  const [comparar, setComparar] = useState(false);
  const [corte, setCorte] = useState(50);
  const [ultima, setUltima] = useState<{ asset: ProductAsset; procesada: ProcessedImage; base: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const visibles = useMemo(() => assets.filter(a => a.estado !== "DESCARTADA"), [assets]);
  const aprobadas = useMemo(() => visibles.filter(a => a.estado === "APROBADA"), [visibles]);
  const principal = aprobadas.find(a => a.rol === "PRINCIPAL") ?? null;
  const sinOriginal = !originalUrl?.trim();

  async function recargar() {
    try {
      const rows = await listFn({ data: { source_ref: sourceRef } });
      setAssets(rows);
    } catch (e) {
      toast.error(`No se pudieron leer las imágenes: ${(e as Error).message}`);
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => { void recargar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [sourceRef]);

  useEffect(() => {
    onApprovedChange?.(principal?.public_url ?? aprobadas[0]?.public_url ?? null);
    /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [principal?.public_url, aprobadas.length]);

  /** Procesa desde la original (o desde una foto nueva del celular) y guarda la procesada. */
  async function procesar(desde: File | string, rol: "PRINCIPAL" | "SECUNDARIA" | "CATALOGO" | "INSTAGRAM" = "CATALOGO") {
    setTrabajando("procesar");
    try {
      let parentId: string | undefined;
      let base = typeof desde === "string" ? desde : "";
      if (typeof desde === "string") {
        const original = await registerFn({ data: { source_ref: sourceRef, source_sku: sourceSku, url: desde } });
        parentId = original.id;
      }
      const procesada = await processImage(desde, { preset, fondo, brillo, contraste, nitidez });
      if (!base) base = procesada.previewUrl;
      const asset = await saveFn({
        data: {
          source_ref: sourceRef,
          source_sku: sourceSku,
          parent_asset_id: parentId,
          rol,
          mime: procesada.mime,
          dataBase64: procesada.dataBase64,
          width: procesada.width,
          height: procesada.height,
          transform: procesada.transform,
        },
      });
      setUltima({ asset, procesada, base });
      setComparar(true);
      await recargar();
      toast.success("Imagen procesada. Compará y aprobá si te convence.");
    } catch (e) {
      toast.error(`No se pudo procesar: ${(e as Error).message}`);
    } finally {
      setTrabajando(null);
    }
  }

  async function aprobar(asset: ProductAsset, rol: "PRINCIPAL" | "SECUNDARIA" | "INSTAGRAM") {
    setTrabajando(asset.id);
    try {
      const row = await approveFn({ data: { id: asset.id, rol } });
      if (rol === "PRINCIPAL") onApproveMain(row.public_url);
      else onApproveSecondary(row.public_url);
      await recargar();
      toast.success("Imagen aprobada. Guardá los cambios de la ficha para confirmar.");
    } catch (e) {
      toast.error(`No se pudo aprobar: ${(e as Error).message}`);
    } finally {
      setTrabajando(null);
    }
  }

  async function descartar(asset: ProductAsset) {
    setTrabajando(asset.id);
    try {
      await discardFn({ data: { id: asset.id } });
      if (ultima?.asset.id === asset.id) { setUltima(null); setComparar(false); }
      await recargar();
      toast.success("Procesada descartada y archivo eliminado.");
    } catch (e) {
      toast.error(`No se pudo descartar: ${(e as Error).message}`);
    } finally {
      setTrabajando(null);
    }
  }

  async function versionInstagram(asset: ProductAsset) {
    if (asset.estado !== "APROBADA") {
      toast.error("Primero aprobá una imagen base.");
      return;
    }
    setTrabajando(asset.id);
    try {
      const procesada = await processImage(asset.public_url, {
        preset: "instagram_45", fondo, brillo: 0, contraste: 0, nitidez,
      });
      await saveFn({
        data: {
          source_ref: sourceRef, source_sku: sourceSku, parent_asset_id: asset.id,
          rol: "INSTAGRAM", mime: procesada.mime, dataBase64: procesada.dataBase64,
          width: procesada.width, height: procesada.height, transform: procesada.transform,
        },
      });
      await recargar();
      toast.success("Versión Instagram 4:5 creada como procesada.");
    } catch (e) {
      toast.error(`No se pudo crear la versión Instagram: ${(e as Error).message}`);
    } finally {
      setTrabajando(null);
    }
  }

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3">
      <div className="flex flex-wrap items-center gap-2">
        <Wand2 className="h-4 w-4 text-[#FF6200]" />
        <p className="text-[13px] font-bold text-neutral-900">Mejorar fotos</p>
        <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[12px] font-bold text-neutral-600">Sin IA</span>
      </div>
      <p className="mt-1 text-[12px] text-neutral-600">
        Ajustes reales de la foto (giro, encuadre, tamaño, luz y nitidez). La foto original no se toca nunca:
        cada mejora queda como una copia nueva que podés aprobar o descartar.
      </p>
      <p className="mt-1 text-[12px] text-amber-700">
        Límite conocido: no recorta el producto del fondo. El relleno de color solo pinta el borde que sobra del
        encuadre. Para fondo limpio real usá «Contenido IA → Catálogo limpio».
      </p>

      {sinOriginal && (
        <p className="mt-2 text-[12px] font-semibold text-red-600">
          Cargá primero la imagen principal del producto o tomá una foto nueva.
        </p>
      )}

      {/* Controles */}
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block">
          <span className="text-[12px] font-bold uppercase tracking-wide text-neutral-600">Formato</span>
          <select value={preset} onChange={e => setPreset(e.target.value as PresetId)}
            className="mt-1 min-h-[44px] w-full rounded-md border border-neutral-300 bg-white px-2 text-sm">
            {Object.entries(PRESETS).map(([k, p]) => <option key={k} value={k}>{p.label}</option>)}
          </select>
        </label>
        <label className="block">
          <span className="text-[12px] font-bold uppercase tracking-wide text-neutral-600">Fondo del borde</span>
          <select value={fondo} onChange={e => setFondo(e.target.value as FondoId)}
            className="mt-1 min-h-[44px] w-full rounded-md border border-neutral-300 bg-white px-2 text-sm">
            {Object.entries(FONDOS).map(([k, f]) => <option key={k} value={k}>{f.label}</option>)}
          </select>
        </label>
        <Slider label="Brillo" v={brillo} min={-LIMITES.brillo} max={LIMITES.brillo} onC={setBrillo} />
        <Slider label="Contraste" v={contraste} min={-LIMITES.contraste} max={LIMITES.contraste} onC={setContraste} />
        <Slider label="Nitidez" v={nitidez} min={0} max={LIMITES.nitidez} onC={setNitidez} />
      </div>

      <div className="mt-3 flex flex-wrap gap-1.5">
        <button type="button" disabled={sinOriginal || trabajando !== null}
          onClick={() => procesar(originalUrl)}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md bg-[#071B3B] px-3 text-xs font-semibold text-white disabled:opacity-50">
          {trabajando === "procesar" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {ultima ? "Reprocesar" : "Procesar imagen"}
        </button>
        <button type="button" disabled={trabajando !== null}
          onClick={() => fileRef.current?.click()}
          className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-xs font-semibold hover:bg-neutral-50 disabled:opacity-50">
          <ImageIcon className="h-4 w-4" /> Foto del celular
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" className="hidden"
          onChange={e => { const f = e.target.files?.[0]; e.target.value = ""; if (f) void procesar(f); }} />
        {ultima && (
          <button type="button" onClick={() => setComparar(c => !c)}
            className="inline-flex min-h-[44px] items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3 text-xs font-semibold hover:bg-neutral-50">
            {comparar ? "Ocultar comparación" : "Comparar antes/después"}
          </button>
        )}
      </div>

      {/* Comparador */}
      {ultima && comparar && (
        <div className="mt-3">
          <div className="relative overflow-hidden rounded-lg border border-neutral-200 bg-neutral-100">
            <img src={ultima.base} alt="Antes" className="block w-full" />
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${corte}%` }}>
              <img src={ultima.procesada.previewUrl} alt="Después" className="block w-full"
                style={{ width: `${100 / (corte / 100)}%`, maxWidth: "none" }} />
            </div>
            <span className="absolute left-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white">Después</span>
            <span className="absolute right-2 top-2 rounded bg-black/60 px-1.5 py-0.5 text-[11px] font-bold text-white">Antes</span>
          </div>
          <input type="range" min={0} max={100} value={corte} onChange={e => setCorte(Number(e.target.value))}
            className="mt-2 w-full" aria-label="Comparar antes y después" />
          <p className="text-[12px] text-neutral-600">
            {ultima.procesada.width}×{ultima.procesada.height} px · {formatBytes(ultima.procesada.bytes)}
          </p>
        </div>
      )}

      {/* Listado de imágenes del producto */}
      <div className="mt-3">
        <p className="text-[12px] font-bold uppercase tracking-wide text-neutral-600">
          Imágenes de este producto {cargando ? "" : `(${visibles.length})`}
        </p>
        {cargando ? (
          <div className="mt-2 flex items-center gap-2 text-[12px] text-neutral-500">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Cargando…
          </div>
        ) : visibles.length === 0 ? (
          <p className="mt-1 text-[12px] text-neutral-500">Todavía no hay imágenes registradas.</p>
        ) : (
          <div className="mt-2 space-y-2">
            {visibles.map(a => (
              <div key={a.id} className="flex gap-2 rounded-lg border border-neutral-200 p-2">
                <img src={a.public_url} alt="" loading="lazy"
                  className="h-20 w-20 shrink-0 rounded border border-neutral-200 bg-neutral-50 object-contain" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${ESTADO_STYLE[a.estado] ?? ""}`}>{a.estado}</span>
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] font-semibold text-neutral-700">{ROL_LABEL[a.rol] ?? a.rol}</span>
                    {a.width && <span className="text-[11px] text-neutral-500">{a.width}×{a.height}</span>}
                    {a.bytes && <span className="text-[11px] text-neutral-500">{formatBytes(a.bytes)}</span>}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {a.estado !== "ORIGINAL" && (
                      <>
                        <button type="button" disabled={trabajando !== null} onClick={() => aprobar(a, "PRINCIPAL")}
                          className="inline-flex min-h-[40px] items-center gap-1 rounded-md border border-emerald-300 bg-emerald-50 px-2 text-[12px] font-semibold text-emerald-700 disabled:opacity-50">
                          <Check className="h-3.5 w-3.5" /> Principal
                        </button>
                        <button type="button" disabled={trabajando !== null} onClick={() => aprobar(a, "SECUNDARIA")}
                          className="inline-flex min-h-[40px] items-center gap-1 rounded-md border border-emerald-300 bg-white px-2 text-[12px] font-semibold text-emerald-700 disabled:opacity-50">
                          <Check className="h-3.5 w-3.5" /> Secundaria
                        </button>
                      </>
                    )}
                    {a.estado === "PROCESADA" && (
                      <button type="button" disabled={trabajando !== null} onClick={() => descartar(a)}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-md border border-neutral-300 bg-white px-2 text-[12px] disabled:opacity-50">
                        <Trash2 className="h-3.5 w-3.5" /> Descartar
                      </button>
                    )}
                    {a.estado === "APROBADA" && (
                      <button type="button" disabled={trabajando !== null} onClick={() => versionInstagram(a)}
                        className="inline-flex min-h-[40px] items-center gap-1 rounded-md border border-[#FF6200]/40 bg-[#FF6200]/10 px-2 text-[12px] font-semibold text-[#c24d00] disabled:opacity-50">
                        Versión Instagram 4:5
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Slider({ label, v, min, max, onC }: { label: string; v: number; min: number; max: number; onC: (n: number) => void }) {
  return (
    <label className="block">
      <span className="text-[12px] font-bold uppercase tracking-wide text-neutral-600">{label} <span className="font-normal text-neutral-500">({v})</span></span>
      <input type="range" min={min} max={max} value={v} onChange={e => onC(Number(e.target.value))} className="mt-2 w-full" />
    </label>
  );
}
