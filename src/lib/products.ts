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
import asicsChallenger14 from "@/assets/p-asics-challenger14.png";

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
  idealFor?: string;
  features?: string;
};

const fmt = (n: number) =>
  "$" + n.toLocaleString("es-AR", { maximumFractionDigits: 0 });

export const PRODUCTS: Product[] = [
  {
    id: "1",
    sku: "AS-CH14-PADEL",
    name: "Asics Gel-Challenger 14 Padel",
    brand: "Asics",
    category: "Zapatillas",
    price: fmt(159990),
    priceOld: fmt(189990),
    image: asicsChallenger14,
    badge: "Oferta",
    description: "Confort y estabilidad para jugadores de pádel. Tecnología DYNAWING para movimientos laterales seguros, sistema GEL en el talón que absorbe impactos, puntera PGUARD y suela AHARPLUS para mayor durabilidad.",
    idealFor: "Pádel, tenis y deportes de cancha.",
    features: "Tecnología DYNAWING, sistema GEL trasero, puntera PGUARD, suela AHARPLUS, plantilla OrthoLite.",
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
    idealFor: "Running recreativo, caminatas y uso diario.",
    features: "Mediasuela Cloudfoam, capellada textil respirable, ajuste con cordones y suela resistente.",
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
    idealFor: "Running urbano, caminatas, gimnasio y uso diario.",
    features: "Capellada de malla, espuma suave, banda de sujeción en el mediopié y suela de goma durable.",
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
    idealFor: "Running inicial, caminatas, gimnasio y uso cotidiano.",
    features: "Mediasuela Fresh Foam, capellada de malla, ajuste con cordones y diseño flexible.",
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
    idealFor: "Tenis, pádel o deportes de cancha, según la versión.",
    features: "Mediasuela FLYTEFOAM, sistema TRUSSTIC, refuerzos laterales y capellada ventilada.",
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
    idealFor: "Vóley, handball, bádminton y deportes de salón.",
    features: "Tecnología GEL, sistema TRUSSTIC, suela de buen agarre y refuerzo en el talón.",
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
    idealFor: "Trail running, senderismo y actividades al aire libre.",
    features: "Mediasuela AMPLIFOAM, tecnología GEL, suela con tacos y estructura protectora.",
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
    idealFor: "Running sobre asfalto, caminatas y fitness.",
    features: "AMPLIFOAM PLUS, tecnología GEL en el talón, malla técnica y plantilla OrthoLite.",
  },
];
