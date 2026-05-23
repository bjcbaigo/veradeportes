import zap1 from "@/assets/p-zapatillas-1.jpg";
import zap2 from "@/assets/p-zapatillas-2.jpg";
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
  { id: "1", name: "Running Light", category: "Zapatillas", price: "$89.900", image: zap1, badge: "Nuevo" },
  { id: "2", name: "Trainer Pro Naranja", category: "Zapatillas", price: "$104.500", image: zap2, badge: "Top" },
  { id: "3", name: "Remera Sport Negra", category: "Remeras", price: "$18.500", image: rem1 },
  { id: "4", name: "Remera Dry-Fit Blanca", category: "Remeras", price: "$19.900", image: rem2 },
  { id: "5", name: "Short Training", category: "Shorts", price: "$22.000", image: sho1 },
  { id: "6", name: "Buzo Hoodie Gris", category: "Buzos", price: "$42.000", image: buz1, badge: "Promo" },
  { id: "7", name: "Campera Hoodie Negra", category: "Buzos", price: "$54.900", image: buz2 },
  { id: "8", name: "Set Gorra + Bolso", category: "Accesorios", price: "$24.500", image: acc1 },
];
