import Image from "next/image";

export default function DeliveryGallery({ photos }) {
  if (!photos?.length) return null;

  return (
    <section className="p-delivery-gallery" aria-labelledby="delivery-gallery-heading">
      <div className="p-container p-delivery-heading">
        <div>
          <p className="p-eyebrow">DELIVERED WITH PRIDE</p>
          <h2 id="delivery-gallery-heading">
            New keys.
            <br />
            New beginnings.
          </h2>
        </div>
        <p>
          A few favourite handover moments from our showroom—shared here as
          each customer starts their next journey.
        </p>
      </div>
      <div className="p-container p-delivery-grid">
        {photos.map((photo, index) => {
          const portrait = photo.height > photo.width;
          return (
            <figure
              className={portrait ? "is-portrait" : "is-landscape"}
              key={photo.id}
            >
              <Image
                src={photo.url}
                alt={photo.caption || `Customer vehicle delivery ${index + 1}`}
                fill
                unoptimized
                sizes={portrait ? "(max-width: 700px) 50vw, 25vw" : "(max-width: 700px) 100vw, 50vw"}
              />
              {photo.caption && <figcaption>{photo.caption}</figcaption>}
            </figure>
          );
        })}
      </div>
    </section>
  );
}
