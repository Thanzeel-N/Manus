const configuredBase = process.env.NEXT_PUBLIC_SITE_MEDIA_URL?.trim();

const siteMediaBase = configuredBase
  ? configuredBase.replace(/\/+$/, "")
  : "/site-media";

export function siteMedia(path) {
  if (!path) return "";
  if (/^https?:\/\//i.test(path)) return path;

  const normalizedPath = String(path)
    .replace(/^\/+/, "")
    .replace(/^site-media\//, "");

  return `${siteMediaBase}/${normalizedPath}`;
}
