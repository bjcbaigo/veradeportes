export type Product = {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  price: string;
  priceOld?: string;
  image: string;
  images?: string[];
  badge?: string;
  description?: string;
  idealFor?: string;
  features?: string;
};
