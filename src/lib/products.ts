import zapAdidas1 from "@/assets/p-zap-adidas1.png";
import zapAdidas2 from "@/assets/p-zap-adidas2.png";
import zapFresh from "@/assets/p-zap-freshfoam.png";
import zapNagoya from "@/assets/p-zap-nagoya.png";
import rem1 from "@/assets/p-remera-1.jpg";
import rem2 from "@/assets/p-remera-2.jpg";
import sho1 from "@/assets/p-short-1.jpg";
import buz1 from "@/assets/p-buzo-1.jpg";
import buz2 from "@/assets/p-buzo-2.jpg";
import acc1 from "@/assets/p-acc-1.jpg";

export type Product = {
  id: string;
  name: string;
  category: string;
  price: string;
  image: string;
  badge?: string;
};

export const PRODUCTS: Product[] = [
  { id: "1", name: "Adidas Runfalcon Negra", category: "Zapatillas", price: "$98.900", image: zapAdidas1, badge: "Nuevo" },
  { id: "2", name: "Adidas Runfalcon Azul", category: "Zapatillas", price: "$98.900", image: zapAdidas2 },
  { id: "3", name: "New Balance Fresh Foam", category: "Zapatillas", price: "$129.900", image: zapFresh, badge: "Top" },
  { id: "4", name: "Asics Gel-Nagoya 7", category: "Zapatillas", price: "$134.500", image: zapNagoya },
  { id: "5", name: "Remera Sport Negra", category: "Remeras", price: "$18.500", image: rem1 },
  { id: "6", name: "Remera Dry-Fit Blanca", category: "Remeras", price: "$19.900", image: rem2 },
  { id: "7", name: "Short Training", category: "Shorts", price: "$22.000", image: sho1 },
  { id: "8", name: "Buzo Hoodie Gris", category: "Buzos", price: "$42.000", image: buz1, badge: "Promo" },
  { id: "9", name: "Campera Hoodie Negra", category: "Buzos", price: "$54.900", image: buz2 },
  { id: "10", name: "Set Gorra + Bolso", category: "Accesorios", price: "$24.500", image: acc1 },
];
