import { useEffect, useMemo, useState } from "react";
import type { Product } from "@/lib/products";

export type CartItem = {
  id: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  image: string;
  qty: number;
};

export const CART_KEY = "vera-cart";
export const CART_EVENT = "vera:cart-change";

function readCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(CART_EVENT));
}

export function addCartItem(item: CartItem) {
  if (typeof window === "undefined") return;
  const items = readCart();
  const existing = items.find((current) => current.id === item.id);
  if (existing) existing.qty += item.qty;
  else items.push(item);
  writeCart(items);
}

export function addToCart(product: Product) {
  if (typeof window === "undefined") return;
  addCartItem({
    id: product.id,
    name: product.name,
    brand: product.brand,
    category: product.category,
    price: product.price,
    image: product.image,
    qty: 1,
  });
}

export function updateCartQty(id: string, qty: number) {
  if (typeof window === "undefined") return;
  const next = readCart()
    .map((item) => (item.id === id ? { ...item, qty } : item))
    .filter((item) => item.qty > 0);
  writeCart(next);
}

export function removeFromCart(id: string) {
  if (typeof window === "undefined") return;
  writeCart(readCart().filter((item) => item.id !== id));
}

export function clearCart() {
  if (typeof window === "undefined") return;
  writeCart([]);
}

export function parsePrice(price: string) {
  return Number(price.replace(/[^\d.-]/g, "")) || 0;
}

export function formatPrice(value: number) {
  return "$" + value.toLocaleString("es-AR", { maximumFractionDigits: 0 });
}

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  useEffect(() => {
    const sync = () => setItems(readCart());
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + parsePrice(item.price) * item.qty, 0),
    [items],
  );

  return { items, count, subtotal };
}
