import zapFresh from "@/assets/p-zap-freshfoam.png";
import zapAdidas1 from "@/assets/p-zap-adidas1.png";

export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  priceOld?: string;
  image: string;
  badge?: string;
  description?: string;
};

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

export const PRODUCTS: Product[] = [
  {
    id: "1",
    sku: "NB-FF-001",
    name: "New Balance Fresh Foam",
    brand: "New Balance",
    category: "Zapatillas",
    price: fmt(159990),
    priceOld: fmt(189990),
    image: zapFresh,
    badge: "Oferta",
    description: "Amortiguación Fresh Foam, ideal running.",
  },
  {
    id: "2",
    sku: "NK-AM-002",
    name: "Nike Air Max",
    brand: "Nike",
    category: "Zapatillas",
    price: fmt(179990),
    image: zapAdidas1,
    badge: "Destacado",
    description: "Clásico urbano con cámara de aire.",
  },
];
