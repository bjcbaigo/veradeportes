type ProductBadgeProps = {
  label: string;
};

type BadgeKind = "discount" | "new" | "featured" | "default";

function normalizeBadge(label: string) {
  const normalized = label.trim().toUpperCase();
  if (/^-?\d+%$/.test(normalized)) {
    return normalized.startsWith("-") ? normalized : `-${normalized}`;
  }
  if (normalized === "DESTACADO" || normalized === "DESTACADA") return "DESTACADO";
  if (normalized === "NUEVO" || normalized === "NUEVA") return "NUEVO";
  return normalized;
}

function badgeKind(label: string): BadgeKind {
  if (/^-\d+%$/.test(label)) return "discount";
  if (label === "NUEVO") return "new";
  if (label === "DESTACADO") return "featured";
  return "default";
}

const badgeStyles: Record<BadgeKind, string> = {
  discount: "bg-primary text-primary-foreground",
  new: "bg-badge-new text-badge-new-foreground",
  featured: "bg-ink text-ink-foreground",
  default: "bg-ink text-ink-foreground",
};

export function ProductBadge({ label }: ProductBadgeProps) {
  const normalized = normalizeBadge(label);
  if (!normalized) return null;

  return (
    <span
      className={`inline-flex h-6 max-w-[calc(100%-3rem)] items-center truncate rounded-full px-2.5 text-[10px] font-black uppercase leading-none ${badgeStyles[badgeKind(normalized)]}`}
      title={normalized}
    >
      {normalized}
    </span>
  );
}