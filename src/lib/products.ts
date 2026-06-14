import zapFresh from "@/assets/p-zap-freshfoam.png";
import zapAdidas1 from "@/assets/p-zap-adidas1.png";
import galaxy7 from "@/assets/p-adidas-galaxy7.png";
import downshifter13 from "@/assets/p-nike-downshifter13.png";
import nbArishi4 from "@/assets/p-nb-arishi4.png";
import nb520Beige from "@/assets/p-nb-520-beige.png";
import asicsGame from "@/assets/p-asics-gamefF.png";
import asicsTask4 from "@/assets/p-asics-task4.png";
import asicsSonoma7 from "@/assets/p-asics-sonoma7.png";
import asicsExcite10 from "@/assets/p-asics-excite10.png";

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
    description: "Amortiguación Fresh Foam y diseño versátil para correr, caminar o usar todos los días.",
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
  {
    id: "3",
    sku: "AD-GAL7-W",
    name: "Adidas Galaxy 7 W",
    brand: "Adidas",
    category: "Zapatillas",
    price: fmt(119000),
    image: galaxy7,
    description: "Comodidad y amortiguación suave para running recreativo, caminatas y uso diario.",
  },
  {
    id: "4",
    sku: "NK-DS13",
    name: "Nike Downshifter 13",
    brand: "Nike",
    category: "Zapatillas",
    price: fmt(159000),
    image: downshifter13,
    description: "Ligera, respirable y segura para entrenamientos urbanos y actividades cotidianas.",
  },
  {
    id: "5",
    sku: "NB-MARIS4",
    name: "New Balance Maris 4",
    brand: "New Balance",
    category: "Zapatillas",
    price: fmt(119000),
    image: nbArishi4,
    description: "Amortiguación Fresh Foam y diseño versátil para correr, caminar o usar todos los días.",
  },
  {
    id: "6",
    sku: "NB-520-BEIGE",
    name: "New Balance 520 Beige",
    brand: "New Balance",
    category: "Zapatillas",
    price: fmt(129000),
    image: nb520Beige,
    description: "Confort deportivo y estilo urbano en una zapatilla suave, flexible y combinable.",
  },
  {
    id: "7",
    sku: "AS-GAME-FF",
    name: "Asics Gel-Game FF",
    brand: "Asics",
    category: "Zapatillas",
    price: fmt(219000),
    image: asicsGame,
    description: "Estabilidad y agilidad para movimientos rápidos y cambios de dirección en la cancha.",
  },
  {
    id: "8",
    sku: "AS-TASK4",
    name: "Asics Gel-Task 4",
    brand: "Asics",
    category: "Zapatillas",
    price: fmt(219000),
    image: asicsTask4,
    description: "Amortiguación y soporte para vóley, handball y deportes en superficies interiores.",
  },
  {
    id: "9",
    sku: "AS-SONOMA7",
    name: "Asics Gel-Sonoma 7",
    brand: "Asics",
    category: "Zapatillas",
    price: fmt(119000),
    priceOld: fmt(179000),
    image: asicsSonoma7,
    badge: "Oferta",
    description: "Agarre, protección y comodidad para senderos y terrenos irregulares.",
  },
  {
    id: "10",
    sku: "AS-EXCITE10",
    name: "Asics Gel-Excite 10",
    brand: "Asics",
    category: "Zapatillas",
    price: fmt(159000),
    priceOld: fmt(199000),
    image: asicsExcite10,
    badge: "Oferta",
    description: "Pisada cómoda y fluida para running, caminatas y entrenamientos diarios.",
  },
];
