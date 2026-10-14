import PublicShell from "../components/public-shell";
import Image from "next/image";
import HeroVideo from "../components/hero-video";
import HeroContent from "../components/hero-content";
import Icon from "../components/icon";
import SiteImage from "../components/site-image";
import { ContactBand, FAQ } from "../components/public-sections";
import { getStock } from "../lib/stock";
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

export const metadata = {
  title: "Manu's Car World — Premium Certified Pre-Owned Cars",
  description:
    "Explore certified pre-owned luxury cars at Manu's Car World. BMW, Mercedes-Benz, Audi and more. 150-point inspection. 6-month warranty. Kerala's trusted pre-owned luxury dealership.",
};

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const { cars } = await getStock();
  const availableCars = cars.filter((car) => car.status === "available");
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
            ["4.4 ★", "Public Customer Rating"],
            ["In-house", "RC Transfer Assistance"],
          ].map(([stat, label], index) => (
            <div key={label} className="p-metric-item">
              <small className="p-metric-index">0{index + 1}</small>
              <strong>{stat}</strong>
              <span>{label}</span>
            </div>
          ))}
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
          className="p-guarantee-section"
          aria-labelledby="guarantee-heading"
        >
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
                  title: "6-Month / 10,000 km Warranty",
                  desc: "Peace of mind covering critical mechanical components post-purchase.",
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
                A car is a personal choice. It should feel right in the driver's
                seat, on your daily commute, and in your plans for what comes
                next.
              </p>
              <p>
                At Manu's Car World, we make space for that decision. Explore
                the details, ask your questions and get to know your next car
                before you make it yours.
              </p>
              <a className="p-text-link" href="/about">
                Get to know Manu's
                <Icon name="northeast" size={18} />
              </a>
              <div className="p-editorial-signature">
                <span>YOUR NEXT CHAPTER</span>
                <strong>Starts with a better conversation.</strong>
              </div>
            </div>
          </div>
        </section>

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
                  <span className="p-rating-number">4.4</span>
                  <div>
                    <div className="p-stars" aria-label="4.4 out of 5 stars">
                      <span aria-hidden="true">★★★★☆</span>
                    </div>
                    <span className="p-rating-count">
                      4.4 from 53 public ratings
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
                  View public rating
                  <Icon name="northeast" size={16} />
                </a>
              </div>
            </div>
            <div className="p-reviews-grid">
              {[
                {
                  name: "Transparent guidance",
                  text: "Review the car, its available records, and the paperwork with a dedicated advisor before deciding.",
                  icon: "document",
                },
                {
                  name: "Unhurried experience",
                  text: "Shortlist vehicles online, arrange a visit, and take the time you need to compare them in person.",
                  icon: "car",
                },
                {
                  name: "End-to-end support",
                  text: "From valuation and finance discussions to handover and ownership transfer, our team stays involved.",
                  icon: "users",
                },
              ].map(({ name, text, icon }, index) => (
                <article key={name} className="p-review-card">
                  <div className="p-review-card-top" aria-hidden="true">
                    <span>0{index + 1}</span>
                    <Icon name={icon} size={20} />
                  </div>
                  <p className="p-review-text">{text}</p>
                  <div className="p-review-author">
                    <div>
                      <strong>{name}</strong>
                      <span>What to expect at Manu&apos;s Car World</span>
                    </div>
                  </div>
                </article>
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
              alt="Manu's Car World team helping customers inspect a vehicle"
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
              "Can I review the vehicle's history?",
              "Ask our team for available service, ownership and registration records for the car you're considering. Review the documents and inspect the car on our hoist before making your decision.",
            ],
            [
              "Do you offer any warranty on pre-owned cars?",
              "Yes. Every certified vehicle at Manu's Car World comes with a 6-month / 10,000 km warranty covering critical mechanical components. Ask our team for full details.",
            ],
            [
              "Can I sell or exchange my current car?",
              "Absolutely. Use our instant valuation tool on the Exchange page or speak to our team directly. We provide fair, transparent market-rate offers with no obligation.",
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
