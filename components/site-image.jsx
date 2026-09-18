import images from "../public/assets/optimized/manifest.json";

// Pre-generated sizes avoid image processing on the first forwarded request.
export default function SiteImage({
  name,
  alt,
  sizes = "100vw",
  priority = false,
}) {
  const image = images[name];
  return (
    <img
      src={image.src}
      srcSet={image.srcSet}
      sizes={sizes}
      width={image.width}
      height={image.height}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
    />
  );
}
