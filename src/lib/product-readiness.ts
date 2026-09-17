// Criterio derivado de "listo para publicar".
// 100% función pura: NO escribe datos, NO agrega columnas, NO toca Sheets.
// Evalúa la ficha tal como existe hoy en PRODUCTOS_ADMIN.

export type ReadinessLevel = "listo" | "advertencias";

export interface ReadinessItem {
  key: string;
  label: string;
  ok: boolean;
  /** true = requisito ya obligatorio hoy en el flujo de publicación. */
  critico: boolean;
}

export interface ReadinessResult {
  items: ReadinessItem[];
  faltantes: ReadinessItem[];
  faltantesCriticos: ReadinessItem[];
  level: ReadinessLevel;
  listo: boolean;
}

export interface ReadinessInput {
  url_imagen?: string;
  categoria?: string;
  modelo?: string;
  validacion_modelo?: string;
  /** Solo se evalúan en el diálogo de publicación. */
  precio?: string;
  talles?: string;
}

function has(v?: string): boolean {
  return Boolean((v ?? "").trim());
}

/**
 * @param scope "ficha" = requisitos base; "publicacion" = base + precio y talles.
 */
export function evaluateReadiness(
  p: ReadinessInput,
  scope: "ficha" | "publicacion" = "ficha",
): ReadinessResult {
  const validacion = (p.validacion_modelo ?? "").trim().toUpperCase();

  const items: ReadinessItem[] = [
    {
      key: "imagen",
      label: "Imagen principal",
      ok: has(p.url_imagen),
      critico: true,
    },
    {
      key: "categoria",
      label: "Categoría",
      ok: has(p.categoria),
      critico: true,
    },
    {
      key: "modelo",
      label: "Modelo identificado (o validación no rechazada)",
      ok: has(p.modelo) || (validacion !== "" && validacion !== "RECHAZADO"),
      critico: false,
    },
  ];

  if (scope === "publicacion") {
    items.push(
      { key: "precio", label: "Precio", ok: has(p.precio), critico: true },
      // Histórico: muchas fichas no tienen talles cargados → advertencia, no bloqueo.
      { key: "talles", label: "Talles", ok: has(p.talles), critico: false },
    );
  }

  const faltantes = items.filter((i) => !i.ok);
  const faltantesCriticos = faltantes.filter((i) => i.critico);

  return {
    items,
    faltantes,
    faltantesCriticos,
    level: faltantes.length === 0 ? "listo" : "advertencias",
    listo: faltantes.length === 0,
  };
}
