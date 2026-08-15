import promoImage from "@/assets/promo.jpg";
import heroImage from "@/assets/hero.jpg";
import athletesImage from "@/assets/hero-athletes.png";
import comingKit from "@/assets/coming-kit.jpg";

export type HomePromotion = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  href: string;
  active: boolean;
  order: number;
  startsAt?: string;
  endsAt?: string;
};

export const HOME_PROMOTIONS: HomePromotion[] = [
  {
    id: "ofertas-semana",
    title: "Hasta 40% OFF",
    subtitle: "Ofertas de la semana",
    image: promoImage,
    ctaText: "Ver ofertas",
    href: "/ofertas",
    active: true,
    order: 1,
  },
  {
    id: "nueva-coleccion",
    title: "Lo ultimo",
    subtitle: "Nueva coleccion deportiva",
    image: heroImage,
    ctaText: "Ver coleccion",
    href: "#productos",
    active: true,
    order: 2,
  },
  {
    id: "envios",
    title: "Envios al pais",
    subtitle: "Compra por WhatsApp",
    image: athletesImage,
    ctaText: "Conocer mas",
    href: "#whatsapp",
    active: true,
    order: 3,
  },
  {
    id: "training",
    title: "Modo training",
    subtitle: "Calzado e indumentaria",
    image: comingKit,
    ctaText: "Explorar",
    href: "#categorias",
    active: true,
    order: 4,
  },
];

export function getActivePromotions(now = new Date()) {
  const time = now.getTime();
  return HOME_PROMOTIONS.filter((promotion) => {
    if (!promotion.active) return false;
    const starts = promotion.startsAt ? new Date(promotion.startsAt).getTime() : undefined;
    const ends = promotion.endsAt ? new Date(promotion.endsAt).getTime() : undefined;
    return (!starts || starts <= time) && (!ends || ends >= time);
  }).sort((a, b) => a.order - b.order);
}
