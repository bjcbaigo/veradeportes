// Datos reales de Vera Deportes (cargados desde plantilla).
export const SITE = {
  name: "VERA DEPORTES",
  city: "Vera, Santa Fe",
  address: "Corrientes 1635",
  hours: "Lun a Sáb · 9 a 13 y 17 a 21 hs",
  whatsappNumber: "5493483640559", // 3483 640559
  instagram: "https://www.instagram.com/vera_deportes/",
  email: "ventas@veradeportes.com",
  maps: "https://maps.google.com/?q=Corrientes+1635+Vera+Santa+Fe",
  heroTitle: "VERA DEPORTES",
  heroSubtitle: "Indumentaria y calzado deportivo",
  shipping: "Envíos a todo el país",
};

export function waLink(message: string) {
  const base = `Hola! Quiero consultar por: ${message}`;
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(base)}`;
}
