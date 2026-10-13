import PublicShell from "../components/public-shell";
import HeroVideo from "../components/hero-video";
import HeroContent from "../components/hero-content";
import VehicleImage from "../components/vehicle-image";
import Icon from "../components/icon";
import SiteImage from "../components/site-image";
import { ContactBand, FAQ } from "../components/public-sections";
import { getStock } from "../lib/stock";
import { SHOWROOM } from "../lib/contact-details";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const { cars, unavailable } = await getStock();
  const availableCars = cars.filter((car) => car.status === "available");
  const explicitlyFeatured = availableCars.filter((car) => car.is_featured);
  const featured = (explicitlyFeatured.length ? explicitlyFeatured : availableCars).slice(0, 3);
  return (
    <PublicShell>
      <main id="main-content">
        <section className="p-hero">
          <HeroVideo />
          <HeroContent />
        </section>
        <section className="p-container p-assurances" aria-label="Our approach">
          {[
            [
              "shield",
              "Confidence in the details",
              "Explore condition, specifications and available records.",
            ],
            [
              "users",
              "Advice that starts with you",
              "Your needs, your budget, your next chapter.",
            ],
            [
              "exchange",
              "Buy. Sell. Move forward.",
              "Explore a straightforward route to your next car.",
            ],
          ].map(([icon, title, text]) => (
            <div key={title}>
              <Icon name={icon} size={29} />
              <div>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            </div>
          ))}
        </section>
        <section className="p-container p-section" id="collection">
          <div className="p-section-heading">
            <div>
              <p className="p-eyebrow">THE COLLECTION</p>
              <h2>
                Something exceptional.
                <br />
                Something for you.
              </h2>
            </div>
            <div>
              <p>
                City streets or open roads.
                <br />
                Find the car for wherever life takes you.
              </p>
              <a className="p-text-link" href="/cars">
                View the full collection
                <Icon name="northeast" size={18} />
              </a>
            </div>
          </div>
          <div className="p-featured-grid">
            {featured.map((car) => (
              <article className="p-car" key={car.id}>
                <a
                  className="p-car-image"
                  href={`/cars/${car.id}`}
                  aria-label={`View ${car.name}`}
                >
                  {car.image ? (
                    <VehicleImage
                      sampleId={car.is_sample ? car.id : undefined}
                      src={car.image}
                      alt={car.name}
                      loading="lazy"
                      width="800"
                      height="560"
                    />
                  ) : (
                    <span>
                      <Icon name="car" size={55} />
                    </span>
                  )}
                  <span className="p-car-tag">
                    {car.is_sample ? "Sample listing" : car.body}
                  </span>
                  <span className="p-car-arrow">
                    <Icon name="northeast" />
                  </span>
                </a>
                <div className="p-car-copy">
                  <p>
                    {car.year} / {car.brand}
                  </p>
                  <h3>
                    <a href={`/cars/${car.id}`}>{car.name}</a>
                  </h3>
                  <span>{car.variant}</span>
                  <div className="p-car-specs">
                    <span>
                      <Icon name="gauge" size={15} />
                      {car.km} km
                    </span>
                    <span>
                      <Icon name="fuel" size={15} />
                      {car.fuel}
                    </span>
                    <span>
                      <Icon name="settings" size={15} />
                      {car.transmission}
                    </span>
                  </div>
                  <div className="p-car-price">
                    <strong>
                      ₹{Number(car.price).toFixed(2)} <small>lakh</small>
                    </strong>
                    <a href={`/cars/${car.id}`}>
                      Explore car
                      <Icon name="arrow" size={17} />
                    </a>
                  </div>
                  {car.is_sample && (
                    <small className="p-sample">
                      Illustrative vehicle and price
                    </small>
                  )}
                </div>
              </article>
            ))}
          </div>
          {!featured.length && (
            <div className="p-empty">
              <Icon name="car" size={32} />
              <h3>
                {unavailable
                  ? "The collection is taking a short pause."
                  : "Your next car could be on its way."}
              </h3>
              <p>
                {unavailable
                  ? "We couldn’t load current inventory. Please try again shortly or speak to our team."
                  : "Ask our team about upcoming vehicles and your preferences."}
              </p>
              <a
                className="p-text-link"
                href="/visit#contact"
                data-contact-trigger="true"
                data-title="Speak with our showroom team"
                data-interest="Visiting the showroom"
              >
                Talk to us
                <Icon name="arrow" />
              </a>
            </div>
          )}
        </section>
        <section className="p-story-section">
          <div className="p-container p-split">
            <div className="p-editorial-image">
              <SiteImage
                name="visit"
                alt="A spacious modern dealership showroom"
              />
              <span className="p-image-caption">
                A SPACE TO EXPLORE. ROOM TO DECIDE.
              </span>
            </div>
            <div className="p-editorial-copy">
              <p className="p-eyebrow">MORE THAN A CAR DEALERSHIP</p>
              <h2>
                The right car.
                <br />
                The right way.
              </h2>
              <p>
                A car is a personal choice. It should feel right in the driver’s
                seat, on your daily commute, and in your plans for what comes
                next.
              </p>
              <p>
                At Manu’s Car World, we make space for that decision. Explore
                the details, ask your questions and get to know your next car
                before you make it yours.
              </p>
              <a className="p-text-link" href="/about">
                Get to know Manu’s
                <Icon name="northeast" size={18} />
              </a>
              <div className="p-editorial-signature">
                <span>YOUR NEXT CHAPTER</span>
                <strong>Starts with a better conversation.</strong>
              </div>
            </div>
          </div>
        </section>
        <section className="p-container p-section p-exchange-feature">
          <div>
            <p className="p-eyebrow">EXPERIENCE IT IN PERSON</p>
            <h2>
              A showroom crafted
              <br />
              for passionate drivers.
            </h2>
            <p>
              Step inside our 12,000 sq.ft climate-controlled showroom. Explore
              our handpicked certified pre-owned collection, inspect our
              diagnostic facilities, and enjoy an unhurried consultation.
            </p>
            <div className="p-actions">
              <a href="/visit" className="p-button">
                Plan a showroom visit
                <Icon name="northeast" size={18} />
              </a>
            </div>
            <span className="p-subtle-note">
              Climate-controlled bays. Curated test-drive circuit.
            </span>
          </div>
          <div className="p-exchange-image">
            <SiteImage
              name="advice"
              alt="Manu’s Car World team helping customers inspect a vehicle"
            />
            <span>
              <Icon name="pin" size={27} />
              <strong>
                Visit our showroom.<small>{SHOWROOM.addressLines[0]}.</small>
              </strong>
            </span>
          </div>
        </section>
        <FAQ
          items={[
            [
              "How do I book a test drive?",
              "Open a vehicle from our collection, choose an available date and time, and submit your request. Our team will confirm the appointment before your visit.",
            ],
            [
              "Can I arrange a personalized showroom visit?",
              "Yes. Request an appointment through our visit page or contact our concierge. Our team will prepare the vehicles on your shortlist and ensure a specialist is dedicated to your visit.",
            ],
            [
              "Can I review the vehicle’s history?",
              "Ask our team for available service, ownership and registration records for the car you’re considering. Review the documents and inspect the car on our hoist before making your decision.",
            ],
          ]}
        />
        <ContactBand />
      </main>
    </PublicShell>
  );
}
