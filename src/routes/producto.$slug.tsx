import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowLeft,
  Check,
  Copy,
  Link2,
  RefreshCcw,
  Share2,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { Header } from "@/components/landing/Header";
import { BottomNav } from "@/components/landing/BottomNav";
import { WhatsAppFab } from "@/components/landing/WhatsAppFab";
import { WhatsAppIcon } from "@/components/WhatsAppIcon";
import { listSheetProducts } from "@/lib/sheet-products.functions";
import { sheetToProduct } from "@/lib/product-data";
import {
  SITE_URL,
  findProductBySlug,
  productSlug,
  productUrl,
} from "@/lib/product-url";
import { waLink } from "@/lib/site";

export const Route = createFileRoute("/producto/$slug")({
  loader: async ({ params, context }) => {
    const rows = await context.queryClient.ensureQueryData({
      queryKey: ["sheet-products"],
      queryFn: () => listSheetProducts(),
      staleTime: 5 * 60_000,
    });
    const catalogo = rows.filter((r) => r.activo && r.nombre).map(sheetToProduct);
    const product = findProductBySlug(catalogo, params.slug);
    if (!product) throw notFound();
    return { product, slug: productSlug(product) };
  },
  head: ({ loaderData }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Producto no disponible - Vera Deportes" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const { product, slug } = loaderData;
    const url = `${SITE_URL}/producto/${slug}`;
    const title = `${product.name} - Vera Deportes`;
    const description =
      product.description?.slice(0, 155) ||
      `${product.brand} ${product.name} ${product.price} en Vera Deportes, Vera, Santa Fe. Consultá por WhatsApp.`;
    const image = /^https:\/\//.test(product.image) ? product.image : undefined;
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "product" },
        { property: "og:url", content: url },
        ...(image
          ? [
              { property: "og:image", content: image },
              { name: "twitter:image", content: image },
            ]
          : []),
        { name: "twitter:card", content: "summary_large_image" },
      ],
      links: [{ rel: "canonical", href: url }],
    };
  },
  notFoundComponent: ProductoNoDisponible,
  component: ProductoPage,
});

function ProductoNoDisponible() {
  return (
    <div className="min-h-screen bg-page pb-[calc(84px+env(safe-area-inset-bottom))] font-sans text-foreground lg:pb-0">
      <Header />
      <main className="mx-auto flex max-w-xl flex-col items-center px-4 py-20 text-center">
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-primary">
          Vera Deportes
        </p>
        <h1 className="mt-2 text-2xl font-black uppercase">Producto no disponible</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Este producto ya no está publicado o el enlace es incorrecto. Mirá el
          catálogo actualizado en la tienda.
        </p>
        <Link
          to="/tienda"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-primary px-6 text-sm font-black text-primary-foreground transition hover:bg-primary/90"
        >
          Ir a la tienda
        </Link>
      </main>
      <BottomNav active="Inicio" />
    </div>
  );
}

function ProductoPage() {
  const { product } = Route.useLoaderData();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const url = productUrl(product);
  const gallery = (
    product.images && product.images.length > 0 ? product.images : [product.image]
  ).filter(Boolean);
  const mainImage = gallery[Math.min(active, gallery.length - 1)];
  const isOffer =
    !!product.priceOld &&
    Number(product.priceOld.replace(/[^\d]/g, "")) >
      Number(product.price.replace(/[^\d]/g, ""));
  const discount = isOffer
    ? Math.round(
        (1 -
          Number(product.price.replace(/[^\d]/g, "")) /
            Number(product.priceOld!.replace(/[^\d]/g, ""))) * 100,
      )
    : 0;
  const purchaseHref = waLink(
    `Hola! Quiero comprar: ${product.name} (${product.price}). ${url}`,
  );

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  }

  async function share() {
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: product.name, text: `${product.name} - Vera Deportes`, url });
        return;
      } catch {
        return; // usuario canceló
      }
    }
    await copyLink();
  }

  return (
    <div className="min-h-screen bg-page pb-[calc(84px+env(safe-area-inset-bottom))] font-sans text-foreground lg:pb-0">
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-4 sm:py-8 xl:max-w-7xl xl:px-6">
        <Link
          to="/tienda"
          className="mb-4 inline-flex min-h-[36px] items-center gap-1.5 text-xs font-bold text-muted-foreground transition hover:text-primary"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Volver a la tienda
        </Link>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-[18px] bg-secondary">
              {mainImage ? (
                <img
                  src={mainImage}
                  alt={product.name}
                  className="h-full w-full object-contain"
                />
              ) : (
                <span className="text-xs text-muted-foreground">Sin imagen</span>
              )}
              {discount > 0 && (
                <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-xs font-black text-primary-foreground">
                  -{discount}%
                </span>
              )}
            </div>
            {gallery.length > 1 && (
              <div className="flex gap-1.5 overflow-x-auto">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Ver foto ${i + 1}`}
                    className={`h-16 w-16 shrink-0 overflow-hidden rounded-md border-2 bg-secondary transition ${
                      i === active ? "border-primary" : "border-transparent hover:border-border"
                    }`}
                  >
                    <img src={src} alt="" className="h-full w-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-col gap-3">
            <div>
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-primary">
                {product.brand}
              </p>
              <h1 className="mt-1 text-2xl font-black leading-tight sm:text-3xl">
                {product.name}
              </h1>
              <p className="mt-1 text-xs text-muted-foreground">
                {product.category}
                {product.color ? ` · Color: ${product.color}` : ""}
                {product.sku ? ` · SKU ${product.sku}` : ""}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <p className="text-3xl font-black text-primary">{product.price}</p>
              {isOffer && (
                <p className="text-sm text-muted-foreground line-through">
                  {product.priceOld}
                </p>
              )}
            </div>

            {product.description && (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            {product.sizes && product.sizes.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-semibold">Talles / variantes</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map((s) => (
                    <span
                      key={s}
                      className="inline-flex h-8 min-w-9 items-center justify-center rounded-lg border border-border bg-white px-2 text-xs font-semibold"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {product.idealFor && (
              <p className="text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Ideal para: </span>
                {product.idealFor}
              </p>
            )}

            {product.seals && product.seals.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {product.seals.map((s) => (
                  <span
                    key={s}
                    className="inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary"
                  >
                    {s}
                  </span>
                ))}
              </div>
            )}

            <div className="grid grid-cols-3 gap-2 text-[10px] text-muted-foreground">
              <div className="flex flex-col items-center gap-1 text-center">
                <Truck className="h-4 w-4 text-primary" /> Envíos a domicilio
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <ShieldCheck className="h-4 w-4 text-primary" /> Producto original
              </div>
              <div className="flex flex-col items-center gap-1 text-center">
                <RefreshCcw className="h-4 w-4 text-primary" /> Cambio de talle
              </div>
            </div>

            <div className="mt-1 flex flex-col gap-2">
              <a
                href={purchaseHref}
                target="_blank"
                rel="noopener"
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary text-sm font-black text-primary-foreground transition hover:bg-primary/90"
              >
                <WhatsAppIcon className="h-4 w-4" /> Comprar por WhatsApp
              </a>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={share}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-ink text-sm font-bold text-ink-foreground transition hover:bg-ink/90"
                >
                  <Share2 className="h-4 w-4" /> Compartir
                </button>
                <button
                  type="button"
                  onClick={copyLink}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-border text-sm font-bold text-foreground transition hover:border-primary hover:text-primary"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-primary" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  {copied ? "¡Copiado!" : "Copiar enlace"}
                </button>
              </div>
              <p className="flex items-center gap-1.5 break-all rounded-lg bg-secondary px-3 py-2 text-[11px] text-muted-foreground">
                <Link2 className="h-3.5 w-3.5 shrink-0" /> {url}
              </p>
            </div>
          </div>
        </div>
      </main>
      <BottomNav active="Inicio" />
      <WhatsAppFab />
    </div>
  );
}
