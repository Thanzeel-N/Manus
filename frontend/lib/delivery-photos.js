const apiBase = process.env.DJANGO_API_URL?.replace(/\/$/, "");

export async function getDeliveryPhotos() {
  if (!apiBase) return [];

  try {
    const response = await fetch(`${apiBase}/api/cars/deliveries/`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) return [];
    const photos = await response.json();
    return Array.isArray(photos) ? photos.slice(0, 12) : [];
  } catch {
    return [];
  }
}
