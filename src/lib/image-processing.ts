// Motor de procesamiento DETERMINÍSTICO de imágenes (corre en el navegador/celular).
//
// Por qué en el cliente: el runtime del servidor de este proyecto no incluye
// librerías de procesamiento de píxeles (sharp/canvas no están disponibles), así
// que el procesado se hace con Canvas en el dispositivo y solo el resultado se
// sube. Es inmediato para el usuario y no agrega dependencias al servidor.
//
// Este módulo NO usa IA: no inventa ni agrega nada al producto. Solo corrige
// orientación, encuadra, redimensiona, recomprime y ajusta brillo/contraste/
// nitidez dentro de límites moderados y acotados.

import { optimizeImage } from "./image-optimize";

export type PresetId = "catalogo" | "instagram_45" | "instagram_11";

export const PRESETS: Record<
  PresetId,
  { label: string; ratio: number; size: number; descripcion: string }
> = {
  catalogo: { label: "Catálogo 1:1", ratio: 1, size: 1200, descripcion: "Cuadrada para la ficha del catálogo." },
  instagram_45: { label: "Instagram 4:5", ratio: 4 / 5, size: 1080, descripcion: "Vertical para el feed de Instagram." },
  instagram_11: { label: "Instagram 1:1", ratio: 1, size: 1080, descripcion: "Cuadrada para el feed de Instagram." },
};

export type FondoId = "conservar" | "blanco" | "gris";

export const FONDOS: Record<FondoId, { label: string; color: string | null }> = {
  conservar: { label: "Conservar fondo original", color: null },
  blanco: { label: "Relleno blanco", color: "#ffffff" },
  gris: { label: "Relleno gris (#e5e7eb)", color: "#e5e7eb" },
};

export interface ProcessOptions {
  preset: PresetId;
  fondo: FondoId;
  /** 0 = sin cambios. Rango acotado -20..20 (porcentaje). */
  brillo: number;
  /** 0 = sin cambios. Rango acotado -20..20 (porcentaje). */
  contraste: number;
  /** 0 = sin cambios. Rango acotado 0..30 (intensidad de nitidez). */
  nitidez: number;
}

export const DEFAULT_OPTIONS: ProcessOptions = {
  preset: "catalogo",
  fondo: "conservar",
  brillo: 0,
  contraste: 0,
  nitidez: 10,
};

export const LIMITES = { brillo: 20, contraste: 20, nitidez: 30 } as const;

export interface ProcessedImage {
  blob: Blob;
  dataBase64: string;
  mime: "image/jpeg";
  previewUrl: string;
  width: number;
  height: number;
  bytes: number;
  transform: Record<string, unknown>;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

async function loadBitmap(src: string | Blob): Promise<ImageBitmap> {
  if (typeof src !== "string") return createImageBitmap(src);
  // Descarga con CORS para poder leer los píxeles del canvas.
  const res = await fetch(src, { mode: "cors" });
  if (!res.ok) throw new Error(`No se pudo leer la imagen original (${res.status})`);
  const blob = await res.blob();
  if (!/^image\//.test(blob.type)) throw new Error("El archivo de origen no es una imagen");
  return createImageBitmap(blob);
}

/** Brillo y contraste sobre los datos del canvas, con límites moderados. */
function aplicarAjustes(data: Uint8ClampedArray, brillo: number, contraste: number) {
  const b = (clamp(brillo, -LIMITES.brillo, LIMITES.brillo) / 100) * 255;
  const c = 1 + clamp(contraste, -LIMITES.contraste, LIMITES.contraste) / 100;
  if (b === 0 && c === 1) return;
  for (let i = 0; i < data.length; i += 4) {
    for (let k = 0; k < 3; k++) {
      const v = data[i + k] as number;
      data[i + k] = clamp((v - 128) * c + 128 + b, 0, 255);
    }
  }
}

/** Unsharp mask liviano: realza bordes sin desplazar el color medio. */
function aplicarNitidez(src: Uint8ClampedArray, w: number, h: number, intensidad: number) {
  const amount = clamp(intensidad, 0, LIMITES.nitidez) / 100;
  if (amount <= 0) return;
  const copy = new Uint8ClampedArray(src);
  const idx = (x: number, y: number) => (y * w + x) * 4;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const o = idx(x, y);
      for (let k = 0; k < 3; k++) {
        const centro = copy[o + k] as number;
        const prom =
          ((copy[idx(x - 1, y) + k] as number) +
            (copy[idx(x + 1, y) + k] as number) +
            (copy[idx(x, y - 1) + k] as number) +
            (copy[idx(x, y + 1) + k] as number)) /
          4;
        src[o + k] = clamp(centro + (centro - prom) * amount * 2, 0, 255);
      }
    }
  }
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onerror = () => reject(new Error("No se pudo codificar la imagen procesada"));
    fr.onload = () => {
      const r = String(fr.result);
      resolve(r.slice(r.indexOf(",") + 1));
    };
    fr.readAsDataURL(blob);
  });
}

/**
 * Procesa una imagen (archivo local o URL pública) aplicando encuadre por preset,
 * fondo opcional y ajustes moderados. Devuelve el resultado listo para subir.
 * Nunca modifica el origen.
 */
export async function processImage(
  source: string | File,
  opts: ProcessOptions,
): Promise<ProcessedImage> {
  // Los archivos locales pasan primero por el optimizador existente (EXIF + tamaño).
  const entrada: string | Blob = source instanceof File ? (await optimizeImage(source)).file : source;
  const bitmap = await loadBitmap(entrada);

  const preset = PRESETS[opts.preset];
  const outH = preset.ratio >= 1 ? Math.round(preset.size / preset.ratio) : preset.size;
  const outW = preset.ratio >= 1 ? preset.size : Math.round(preset.size * preset.ratio);
  const targetW = preset.ratio <= 1 ? Math.round(preset.size * preset.ratio) : preset.size;
  const targetH = preset.ratio <= 1 ? preset.size : Math.round(preset.size / preset.ratio);
  void outW;
  void outH;

  const canvas = document.createElement("canvas");
  canvas.width = targetW;
  canvas.height = targetH;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) throw new Error("El navegador no permite procesar imágenes");
  ctx.imageSmoothingQuality = "high";

  const fondo = FONDOS[opts.fondo].color;
  // Sin color de relleno usamos blanco técnico solo para el JPG (no admite alfa),
  // que es el fondo neutro del catálogo.
  ctx.fillStyle = fondo ?? "#ffffff";
  ctx.fillRect(0, 0, targetW, targetH);

  // "Contain": el producto entero entra en el encuadre, sin recortes ni deformación.
  const escala = Math.min(targetW / bitmap.width, targetH / bitmap.height);
  const dw = Math.round(bitmap.width * escala);
  const dh = Math.round(bitmap.height * escala);
  ctx.drawImage(bitmap, Math.round((targetW - dw) / 2), Math.round((targetH - dh) / 2), dw, dh);
  bitmap.close?.();

  if (opts.brillo !== 0 || opts.contraste !== 0 || opts.nitidez > 0) {
    const img = ctx.getImageData(0, 0, targetW, targetH);
    aplicarAjustes(img.data, opts.brillo, opts.contraste);
    aplicarNitidez(img.data, targetW, targetH, opts.nitidez);
    ctx.putImageData(img, 0, 0);
  }

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("No se pudo comprimir la imagen"))), "image/jpeg", 0.86);
  });

  return {
    blob,
    dataBase64: await blobToBase64(blob),
    mime: "image/jpeg",
    previewUrl: URL.createObjectURL(blob),
    width: targetW,
    height: targetH,
    bytes: blob.size,
    transform: {
      tipo: "deterministico",
      preset: opts.preset,
      ratio: preset.label,
      fondo: opts.fondo,
      brillo: clamp(opts.brillo, -LIMITES.brillo, LIMITES.brillo),
      contraste: clamp(opts.contraste, -LIMITES.contraste, LIMITES.contraste),
      nitidez: clamp(opts.nitidez, 0, LIMITES.nitidez),
      calidad_jpg: 0.86,
      recorte_de_fondo: false,
    },
  };
}
