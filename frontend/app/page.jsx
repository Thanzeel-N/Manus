import PublicShell from "../components/public-shell";
import Image from "next/image";
import HeroVideo from "../components/hero-video";
import HeroContent from "../components/hero-content";
import GuaranteeCar from "../components/guarantee-car";
import Icon from "../components/icon";
import SiteImage from "../components/site-image";
import DeliveryGallery from "../components/delivery-gallery";
import TestimonialsCarousel from "../components/testimonials-carousel";
import { HomeCarGrid } from "../components/car-inventory";
import { ContactBand, FAQ } from "../components/public-sections";
import { getStock } from "../lib/stock";
import { getDeliveryPhotos } from "../lib/delivery-photos";
import { SHOWROOM } from "../lib/contact-details";
import {
  SiAudi,
  SiBmw,
  SiFord,
  SiHonda,
  SiHyundai,
  SiJeep,
  SiKia,
  SiMahindra,
  SiMg,
  SiMini,
  SiNissan,
  SiPorsche,
  SiRenault,
  SiSkoda,
  SiSuzuki,
  SiTata,
  SiToyota,
  SiVolkswagen,
  SiVolvo,
} from "react-icons/si";
import { TbBrandMercedes } from "react-icons/tb";

const CAR_BRANDS = [
  { name: "Mercedes-Benz", query: "Mercedes-Benz", Logo: TbBrandMercedes, feature: "G-Class AMG", popular: "G-Class · C-Class · E-Class" },
  { name: "BMW", query: "BMW", Logo: SiBmw, feature: "M3", popular: "3 Series · X1 · X5" },
  { name: "Audi", query: "Audi", Logo: SiAudi, feature: "R8", popular: "Q3 · Q5 · A4" },
  { name: "Porsche", query: "Porsche", Logo: SiPorsche, feature: "911", popular: "911 · Cayenne · Macan" },
  { name: "Range Rover", query: "Range Rover", logoText: "RANGE ROVER", feature: "Autobiography", popular: "Defender · Sport · Velar" },
  { name: "Jaguar", query: "Jaguar", logoText: "JAGUAR", feature: "F-Type", popular: "F-Pace · F-Type · XE" },
  { name: "Lexus", query: "Lexus", logoText: "LEXUS", feature: "LFA", popular: "ES · NX · RX" },
  { name: "MINI", query: "MINI", Logo: SiMini, feature: "Cooper S", popular: "Cooper S · Countryman · Aceman" },
  { name: "Volvo", query: "Volvo", Logo: SiVolvo, feature: "XC90", popular: "XC90 · XC60 · S90" },
  { name: "Volkswagen", query: "Volkswagen", Logo: SiVolkswagen, feature: "Golf GTI", popular: "Virtus · Taigun · Tiguan" },
  { name: "Škoda", query: "Skoda", Logo: SiSkoda, feature: "Octavia vRS", popular: "Slavia · Kushaq · Kodiaq" },
  { name: "Toyota", query: "Toyota", Logo: SiToyota, feature: "Fortuner", popular: "Fortuner · Innova · Hyryder" },
  { name: "Jeep", query: "Jeep", Logo: SiJeep, feature: "Wrangler", popular: "Compass · Wrangler · Meridian" },
  { name: "Mahindra", query: "Mahindra", Logo: SiMahindra, feature: "Thar", popular: "Thar · Scorpio-N · XUV700" },
  { name: "Kia", query: "Kia", Logo: SiKia, feature: "Seltos", popular: "Seltos · Sonet · Carens" },
  { name: "Hyundai", query: "Hyundai", Logo: SiHyundai, feature: "Creta", popular: "Creta · Venue · Verna" },
  { name: "Honda", query: "Honda", Logo: SiHonda, feature: "City", popular: "City · Elevate · Amaze" },
  { name: "Ford", query: "Ford", Logo: SiFord, feature: "Mustang", popular: "Endeavour · Mustang · EcoSport" },
  { name: "Nissan", query: "Nissan", Logo: SiNissan, feature: "GT-R", popular: "Magnite · X-Trail · GT-R" },
  { name: "Renault", query: "Renault", Logo: SiRenault, feature: "Duster", popular: "Duster · Kiger · Triber" },
  { name: "Tata", query: "Tata", Logo: SiTata, feature: "Harrier", popular: "Nexon · Harrier · Safari" },
  { name: "MG", query: "MG", Logo: SiMg, feature: "Hector", popular: "Hector · Windsor EV · Gloster" },
  { name: "Maruti Suzuki", query: "Maruti Suzuki", Logo: SiSuzuki, feature: "Swift", popular: "Swift · Brezza · Baleno" },
];

const REVIEWS = [
  {
    name: "techiedoc",
    text: "Mr Manu is a trustworthy man in this business. We were offered a better price than other car shops in the district.",
    source: "Google review",
    detail: "Local Guide · 599 reviews · 5,835 photos",
  },
  {
    name: "Haridas Boneyetex",
    text: "One of the best second-hand car dealers in Malappuram.",
    source: "Google review",
    detail: "3 reviews · 1 photo",
  },
  {
    name: "Mohammed Faisal",
    text: "MANUS CAR WORLD offers top-grade vehicle products that exceed expectations.",
    source: "Justdial review",
    detail: "5.0 rating · 19 February 2024",
  },
];

export const metadata = {
  title: "Manu's Car World — Premium Certified Pre-Owned Cars",
  description:
    "Explore certified pre-owned luxury cars at Manu's Car World. BMW, Mercedes-Benz, Audi and more, with detailed inspections and vehicle-specific support from our Valluvambram team.",
};

export const revalidate = 60;
export default async function HomePage() {
  const [{ cars }, deliveryPhotos] = await Promise.all([
    getStock(),
    getDeliveryPhotos(),
  ]);
  const availableCars = cars.filter((car) => car.status === "available");
  const featuredCars = [...availableCars]
    .sort((a, b) => Number(Boolean(b.is_featured)) - Number(Boolean(a.is_featured)))
    .slice(0, 3);
  const bodyCategories = ["SUV", "Sedan", "Hatchback", "Coupe", "MPV"].map(
    (name) => ({
      name,
      count: availableCars.filter(
        (car) => String(car.body).toLowerCase() === name.toLowerCase(),
      ).length,
    }),
  );
  return (
    <PublicShell>
      <main id="main-content">
        <section className="p-hero">
          <HeroVideo />
          <HeroContent />
        </section>

        <section
          className="p-container p-metrics-bar"
          aria-label="Key showroom metrics"
        >
          {[
            [availableCars.length || "Live", "Cars Available Today"],
            ["150-Point", "Certified Inspection"],
            ["4.5 ★", "Public Customer Rating"],
            ["In-house", "RC Transfer Assistance"],
          ].map(([stat, label], index) => (
            <div key={label} className="p-metric-item">
              <small className="p-metric-index">0{index + 1}</small>
              <strong>{stat}</strong>
              <span>{label}</span>
            </div>
          ))}
        </section>

        <section className="p-home-trust-story" aria-labelledby="home-about-heading">
          <div className="p-container p-home-trust-shell">
            <div className="p-home-trust-copy">
              <p className="p-eyebrow">MANU&apos;S CAR WORLD · SINCE 1999</p>
              <h2 id="home-about-heading">
                Built on trust.
                <br />
                Driven by people.
              </h2>
              <p className="p-home-trust-lead">
                A local pre-owned car destination in Valluvambram, helping
                customers across Malappuram choose with clarity and confidence.
              </p>
              <p>
                Explore practical and luxury vehicles, understand the available
                records, and discuss finance, exchange, paperwork and handover
                with one team from beginning to end.
              </p>
              <a className="p-text-link" href="/about">
                Discover our story
                <Icon name="northeast" size={18} />
              </a>
            </div>

            <div className="p-home-trust-visual">
              <SiteImage
                name="homeTeam"
                alt="The owner and staff of Manu's Car World together at the showroom"
                sizes="(max-width: 900px) 100vw, 50vw"
              />
              <div className="p-home-trust-quote">
                <Icon name="users" size={24} />
                <p>A car should feel right before it becomes yours.</p>
              </div>
            </div>

            <div className="p-home-trust-facts" aria-label="Business highlights">
              {[
                ["01", "1999", "Established in Valluvambram"],
                ["02", "4.5 / 5", "Public customer rating"],
                ["03", "One team", "From shortlist to handover"],
              ].map(([number, fact, detail]) => (
                <article key={number}>
                  <span>{number}</span>
                  <strong>{fact}</strong>
                  <small>{detail}</small>
                </article>
              ))}
            </div>
          </div>
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

        <section
          className="p-container p-section p-home-collection"
          aria-labelledby="home-collection-heading"
        >
          <div className="p-section-heading">
            <div>
              <p className="p-eyebrow">FIND YOUR KIND OF DRIVE</p>
              <h2 id="home-collection-heading">
                Start with the shape.
                <br />
                Discover the right car.
              </h2>
            </div>
            <div>
              <p>
                Browse by body style, then explore a handpicked selection from
                the cars available now.
              </p>
              <a className="p-text-link" href="/cars">
                View the complete collection
                <Icon name="northeast" size={18} />
              </a>
            </div>
          </div>

          <nav className="p-category-row" aria-label="Browse by body style">
            {bodyCategories.map(({ name, count }, index) => (
              <a
                key={name}
                className="p-category-link"
                href={`/cars?body=${encodeURIComponent(name)}`}
              >
                <span className="p-category-index">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <strong>{name}</strong>
                <small>{count ? `${count} available` : "Explore"}</small>
                <Icon name="arrow" size={17} />
              </a>
            ))}
          </nav>

          {featuredCars.length ? (
            <HomeCarGrid cars={featuredCars} />
          ) : (
            <div className="p-empty">
              <Icon name="car" size={32} />
              <h3>Fresh arrivals are on the way.</h3>
              <p>Explore the collection or contact our team for current stock.</p>
            </div>
          )}
        </section>

        <section
          className="p-guarantee-section"
          aria-labelledby="guarantee-heading"
        >
          <GuaranteeCar />
          <div className="p-container p-guarantee-inner">
            <div className="p-guarantee-copy">
              <p className="p-eyebrow">THE MANU'S GUARANTEE</p>
              <h2 id="guarantee-heading">
                Every car.
                <br />
                Fully verified.
              </h2>
              <p>
                Every vehicle in our collection goes through a rigorous
                multi-point certification before it reaches the showroom floor.
                No shortcuts. No surprises.
              </p>
              <a className="p-text-link" href="/about#inspection">
                See how we inspect every car
                <Icon name="northeast" size={18} />
              </a>
            </div>
            <div className="p-guarantee-badges">
              {[
                {
                  icon: "shield",
                  title: "150+ Point Inspection",
                  desc: "Engine, transmission, suspension, electrics, and body fully assessed.",
                },
                {
                  icon: "document",
                  title: "Clean Title Guarantee",
                  desc: "Verified ownership, no flood or structural damage, true odometer.",
                },
                {
                  icon: "check",
                  title: "Vehicle-specific Warranty",
                  desc: "Ask which cover, duration and kilometre limit apply to your chosen car.",
                },
                {
                  icon: "exchange",
                  title: "7-Day Exchange Policy",
                  desc: "Changed your mind? Exchange for another car within 7 days.",
                },
                {
                  icon: "users",
                  title: "Dedicated 1-on-1 Advisor",
                  desc: "A personal specialist for your entire car-buying journey.",
                },
                {
                  icon: "document",
                  title: "RC Transfer Handled",
                  desc: "100% legal documentation and ownership transfer assistance in-house.",
                },
              ].map(({ icon, title, desc }, index) => (
                <div key={title} className="p-guarantee-badge">
                  <span className="p-guarantee-number">0{index + 1}</span>
                  <span className="p-guarantee-icon">
                    <Icon name={icon} size={20} />
                  </span>
                  <div>
                    <strong>{title}</strong>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          className="p-marques-section"
          id="collection"
          aria-labelledby="marques-heading"
        >
          <div className="p-container p-marques-inner">
            <div className="p-marques-copy">
              <p className="p-eyebrow">THE MARQUES</p>
              <h2 id="marques-heading">
                Icons of design.
                <br />
                Chosen with care.
              </h2>
              <p>
                From German engineering to British character and Scandinavian
                restraint, explore the marques we know and understand.
              </p>
              <a className="p-text-link" href="/cars">
                Explore every available car
                <Icon name="northeast" size={18} />
              </a>
            </div>
            <div className="p-marques-grid" aria-label="Browse cars by brand">
              {CAR_BRANDS.map(({ name, query, Logo, logoText, feature, popular }, index) => (
                <a key={name} href={`/cars?make=${encodeURIComponent(query)}`}>
                  <span className="p-marque-flipper">
                    <span className="p-marque-face p-marque-front">
                      <span className="p-marque-index">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {Logo ? (
                        <Logo className="p-marque-logo" aria-hidden="true" />
                      ) : (
                        <span className="p-marque-wordmark" aria-hidden="true">
                          {logoText}
                        </span>
                      )}
                      <strong>{name}</strong>
                      <small>
                        <span>Popular searches</span>
                        {popular}
                      </small>
                    </span>
                    <span className="p-marque-face p-marque-back">
                      <Image
                        src={`/brand-cars/${query.toLowerCase().replace(/\s+/g, "-")}.webp`}
                        alt={`${name} ${feature}`}
                        fill
                        sizes="(max-width: 600px) 50vw, (max-width: 900px) 25vw, 16vw"
                      />
                      <span className="p-marque-back-shade" aria-hidden="true" />
                      <span className="p-marque-back-copy">
                        <small>{name}</small>
                        <strong>{feature}</strong>
                        <span>View collection <Icon name="northeast" size={14} /></span>
                      </span>
                    </span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <section className="p-section p-exchange-feature">
          <div className="p-exchange-image" aria-hidden="true">
            <SiteImage name="visit" alt="" sizes="100vw" />
          </div>
          <div className="p-container p-exchange-content">
            <div>
              <p className="p-eyebrow">EXPERIENCE IT IN PERSON</p>
              <h2>
                A showroom crafted
                <br />
                for passionate drivers.
              </h2>
              <p>
                Step inside our 12,000 sq.ft climate-controlled showroom.
                Explore our handpicked certified pre-owned collection, inspect
                our diagnostic facilities, and enjoy an unhurried consultation.
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
          </div>
        </section>

        <DeliveryGallery photos={deliveryPhotos} />

        {/* CUSTOMER REVIEWS */}
        <section className="p-proof-section" aria-labelledby="reviews-heading">
          <div className="p-container p-section p-reviews-section">
            <div className="p-reviews-header">
              <div>
                <p className="p-eyebrow">CUSTOMER CONFIDENCE</p>
                <h2 id="reviews-heading">
                  A better way
                  <br />
                  to buy your next car.
                </h2>
              </div>
              <div className="p-reviews-rating-block">
                <div className="p-overall-rating">
                  <span className="p-rating-number">4.5</span>
                  <div>
                    <div className="p-stars" aria-label="4.5 out of 5 stars">
                      <span aria-hidden="true">★★★★☆</span>
                    </div>
                    <span className="p-rating-count">
                      4.5 from 55 Justdial ratings
                    </span>
                  </div>
                </div>
                <a
                  href="https://www.justdial.com/Malappuram/MANUS-CAR-WORLD-Near-Urban-Bank-Valluvambram/9999PX483-X483-240120121329-Z4F4_BZDET"
                  className="p-text-link"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Read the public rating on Justdial"
                >
                  Read reviews on Justdial
                  <Icon name="northeast" size={16} />
                </a>
              </div>
            </div>
            <TestimonialsCarousel reviews={REVIEWS} />
          </div>
        </section>

        <FAQ
          items={[
            [
              "Does Manu's Car World provide car accessories?",
              "Accessory availability can vary by vehicle and requirement. Contact our showroom team with the accessory you need, and we will confirm whether we can help.",
            ],
            [
              "How can I contact Manu's Car World?",
              "Call, WhatsApp or send an enquiry through our contact page. The showroom is open Monday to Saturday from 8:00 AM to 8:00 PM and closed on Sunday.",
            ],
            [
              "Do you provide a warranty on pre-owned cars?",
              "Warranty eligibility and coverage can depend on the vehicle. Eligible certified cars may include the cover described on this site; please confirm the exact duration, kilometre limit, covered components and terms before purchase.",
            ],
            [
              "Do I need new insurance when buying a pre-owned car?",
              "A separate new policy is not usually required when the car's existing insurance can be transferred. The policy and ownership details must be updated with the insurer; our team can explain the paperwork for the vehicle you choose.",
            ],
            [
              "Which documents are needed to purchase a pre-owned car?",
              "The process normally includes the vehicle's registration certificate, insurance documents and ownership-transfer forms. Our team will confirm the complete document checklist for your purchase and help coordinate the transfer.",
            ],
          ]}
        />

        <ContactBand />

        <a
          href={`https://wa.me/${SHOWROOM.phoneHref.replace("+", "")}?text=Hi%2C%20I%27m%20interested%20in%20a%20car%20at%20Manu%27s%20Car%20World.`}
          className="p-whatsapp-fab"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with us on WhatsApp"
          title="Chat with a vehicle specialist on WhatsApp"
        >
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          <span>Chat with us</span>
        </a>
      </main>
    </PublicShell>
  );
}
