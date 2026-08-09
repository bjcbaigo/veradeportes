import type { CartItem } from "@/lib/cart";
import type { Product } from "@/lib/products";

const CUSTOMER_KEY = "vera-customer";
const PENDING_ACTION_KEY = "vera-pending-action";

export type CustomerProfile = {
  nombre: string;
  whatsapp: string;
  registeredAt: string;
};

export type PendingAction =
  | {
      type: "add-to-cart";
      item: CartItem;
    }
  | {
      type: "toggle-favorite";
      productId: string;
    };

export function getFirstPurchaseBenefit() {
  const configured = import.meta.env.VITE_FIRST_PURCHASE_DISCOUNT;
  const discount = typeof configured === "string" && configured.trim() ? configured.trim() : "%";
  return `Tu primera suscripcion tiene un descuento en tu primera compra: ${discount}`;
}

export function readCustomerProfile(): CustomerProfile | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CUSTOMER_KEY);
    return raw ? (JSON.parse(raw) as CustomerProfile) : null;
  } catch {
    return null;
  }
}

export function isCustomerRegistered() {
  return Boolean(readCustomerProfile());
}

export function saveCustomerProfile(nombre: string, whatsapp: string) {
  if (typeof window === "undefined") return;
  const profile: CustomerProfile = {
    nombre,
    whatsapp,
    registeredAt: new Date().toISOString(),
  };
  window.localStorage.setItem(CUSTOMER_KEY, JSON.stringify(profile));
}

export function customerGateUrl(intent: string, returnTo?: string) {
  const target =
    returnTo ??
    (typeof window !== "undefined"
      ? `${window.location.pathname}${window.location.search}${window.location.hash}`
      : "/tienda");
  const params = new URLSearchParams({ intent, returnTo: target });
  return `/registro?${params.toString()}`;
}

export function requireCustomerAccess(
  event: React.MouseEvent<HTMLElement>,
  intent: string,
  returnTo?: string,
) {
  if (isCustomerRegistered()) return true;
  event.preventDefault();
  window.location.href = customerGateUrl(intent, returnTo);
  return false;
}

export function productToCartItem(product: Product): CartItem {
  return {
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    image: product.image,
    qty: 1,
  };
}

function storePendingAction(pending: PendingAction) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PENDING_ACTION_KEY, JSON.stringify(pending));
}

export function storePendingAddToCart(product: Product) {
  storePendingAction({
    type: "add-to-cart",
    item: productToCartItem(product),
  });
}

export function storePendingToggleFavorite(productId: string) {
  storePendingAction({
    type: "toggle-favorite",
    productId,
  });
}

export function takePendingAction(): PendingAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(PENDING_ACTION_KEY);
    window.localStorage.removeItem(PENDING_ACTION_KEY);
    return raw ? (JSON.parse(raw) as PendingAction) : null;
  } catch {
    window.localStorage.removeItem(PENDING_ACTION_KEY);
    return null;
  }
}
