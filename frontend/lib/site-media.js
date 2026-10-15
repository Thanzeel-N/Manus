export function siteMedia(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = String(path)
    .replace(/^\/+/, "")
    .replace(/^site-media\//, "");

  // Fixed showroom media ships with the frontend. Only customer-managed
  // inventory photos and videos remain on R2 through the Django API.
  return `/${normalizedPath}`;
}
