import images from "../public/assets/optimized/manifest.json";
import { siteMedia } from "../lib/site-media";

// Pre-generated sizes avoid image processing on the first forwarded request.
export default function SiteImage({
  name,
  alt,
  sizes = "100vw",
  priority = false,
  className,
}) {
  const image = images[name];
  const src = siteMedia(image.src);
  const srcSet = image.srcSet
    .split(",")
    .map((candidate) => {
      const [url, width] = candidate.trim().split(/\s+/);
      return `${siteMedia(url)} ${width}`;
    })
    .join(", ");
  return (
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
