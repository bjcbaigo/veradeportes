// Reemplazá estos placeholders con los datos reales de Vera Deportes.
export const SITE = {
  name: "Vera Deportes",
  city: "Vera, Santa Fe",
  address: "Av. Principal 123, Vera, Santa Fe",
  hours: "Lun a Sáb · 9 a 13 y 17 a 21 hs",
  whatsappNumber: "5493400000000", // formato internacional sin +
  instagram: "https://www.instagram.com/vera_deportes/",
  maps: "https://maps.google.com/?q=Vera+Santa+Fe",
};

export function waLink(message: string) {
  return `https://wa.me/${SITE.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
