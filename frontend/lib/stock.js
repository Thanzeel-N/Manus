export const demoCars = [
  {
    id: "bmw",
    brand: "BMW",
    name: "BMW 3 Series",
    variant: "320d Luxury Line",
    year: 2021,
    km: "32,000",
    fuel: "Diesel",
    body: "Sedan",
    price: 32.5,
  },
  {
    id: "mercedes",
    brand: "Mercedes-Benz",
    name: "Mercedes-Benz C-Class",
    variant: "C 220d Progressive",
    year: 2020,
    km: "41,000",
    fuel: "Diesel",
    body: "Sedan",
    price: 29.9,
  },
  {
    id: "audi",
    brand: "Audi",
    name: "Audi Q5",
    variant: "45 TFSI Premium Plus",
    year: 2022,
    km: "24,000",
    fuel: "Petrol",
    body: "SUV",
    price: 46.5,
  },
].map((car) => ({
  ...car,
  image: `/site-media/assets/${car.id}.jpg`,
  images: [{ url: `/site-media/assets/${car.id}.jpg`, caption: "Illustrative photo" }],
  transmission: "Automatic",
  condition: "Used",
  status: "available",
  is_sample: true,
  is_featured: true,
  features: [],
  description:
    "A sample from our pre-owned collection. Contact the showroom to confirm the actual vehicle, specifications, condition and service records.",
}));

export async function getStock() {
  if (!process.env.DJANGO_API_URL) return { cars: demoCars, preview: true };
  try {
    const response = await fetch(`${process.env.DJANGO_API_URL}/api/cars/`, {
      cache: "no-store",
      signal: AbortSignal.timeout(5000),
    });
    if (!response.ok) throw new Error("Stock unavailable");
    return { cars: await response.json(), preview: false };
  } catch {
    return { cars: [], preview: false, unavailable: true };
  }
}
