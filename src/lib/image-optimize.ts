// Optimización de imágenes en cliente antes de subir.
// - Corrige orientación EXIF
// - Redimensiona a máx 1600px del lado largo
// - Re-comprime a JPG calidad 0.82

const MAX_SIDE = 1600;
const QUALITY = 0.82;

// Lee el tag EXIF Orientation (1..8) desde un JPG. Devuelve 1 si no hay o no aplica.
async function readExifOrientation(file: File): Promise<number> {
  if (!/jpe?g$/i.test(file.type)) return 1;
  try {
    const buf = await file.slice(0, 128 * 1024).arrayBuffer();
    const view = new DataView(buf);
    if (view.getUint16(0) !== 0xffd8) return 1;
    let offset = 2;
    const len = view.byteLength;
    while (offset < len) {
      const marker = view.getUint16(offset);
      offset += 2;
      if (marker === 0xffe1) {
        if (view.getUint32(offset + 2) !== 0x45786966) return 1; // "Exif"
        const tiff = offset + 8;
        const little = view.getUint16(tiff) === 0x4949;
        const get16 = (o: number) => view.getUint16(o, little);
        const get32 = (o: number) => view.getUint32(o, little);
        const first = tiff + get32(tiff + 4);
        const tags = get16(first);
        for (let i = 0; i < tags; i++) {
          const entry = first + 2 + i * 12;
          if (get16(entry) === 0x0112) return get16(entry + 8);
        }
        return 1;
      } else if ((marker & 0xff00) !== 0xff00) {
        return 1;
      } else {
        offset += view.getUint16(offset);
      }
    }
  } catch {
    /* ignore */
  }
  return 1;
}

function applyOrientation(
  ctx: CanvasRenderingContext2D,
  orientation: number,
  w: number,
  h: number,
) {
  switch (orientation) {
    case 2: ctx.transform(-1, 0, 0, 1, w, 0); break;
    case 3: ctx.transform(-1, 0, 0, -1, w, h); break;
    case 4: ctx.transform(1, 0, 0, -1, 0, h); break;
    case 5: ctx.transform(0, 1, 1, 0, 0, 0); break;
    case 6: ctx.transform(0, 1, -1, 0, h, 0); break;
    case 7: ctx.transform(0, -1, -1, 0, h, w); break;
    case 8: ctx.transform(0, -1, 1, 0, 0, w); break;
    default: break;
  }
}

export type OptimizedImage = {
  file: File;
  previewUrl: string;
  originalBytes: number;
  optimizedBytes: number;
  width: number;
  height: number;
};

export async function optimizeImage(input: File): Promise<OptimizedImage> {
  const orientation = await readExifOrientation(input);
  const bitmap = await createImageBitmap(input);

  const swap = orientation >= 5 && orientation <= 8;
  const srcW = swap ? bitmap.height : bitmap.width;
  const srcH = swap ? bitmap.width : bitmap.height;

  const scale = Math.min(1, MAX_SIDE / Math.max(srcW, srcH));
  const outW = Math.round(srcW * scale);
  const outH = Math.round(srcH * scale);

  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas no disponible");
  ctx.imageSmoothingQuality = "high";

  // Aplicamos transform sobre las dimensiones de salida (ya escaladas).
  applyOrientation(ctx, orientation, outW, outH);
  // Dibujamos el bitmap original escalado a las dimensiones "pre-rotación".
  const drawW = swap ? outH : outW;
  const drawH = swap ? outW : outH;
  ctx.drawImage(bitmap, 0, 0, drawW, drawH);
  bitmap.close?.();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("No se pudo comprimir"))),
      "image/jpeg",
      QUALITY,
    );
  });

  const baseName = (input.name || "foto").replace(/\.[^.]+$/, "");
  const file = new File([blob], `${baseName}.jpg`, {
    type: "image/jpeg",
    lastModified: Date.now(),
  });

  return {
    file,
    previewUrl: URL.createObjectURL(file),
    originalBytes: input.size,
    optimizedBytes: file.size,
    width: outW,
    height: outH,
  };
}

export function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}
