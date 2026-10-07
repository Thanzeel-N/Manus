import BrandLogo from "../components/brand-logo";
import SiteImage from "../components/site-image";
import Header from "../components/header";
import Footer from "../components/footer";
import Experience from "../components/experience";
import Inventory from "../components/inventory";
import SiteMotion from "../components/site-motion";
import { EnquiryButton, EnquiryProvider } from "../components/enquiry";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  return (
    <EnquiryProvider>
      <SiteMotion />
      <Header />
      <main id="main-content">
        <section className="hero">
          <div className="hero-title">
            <div className="eyebrow">Welcome to Manu’s Car World</div>
            <h1>
              Your next car.
              <br />
              One trusted destination.
            </h1>
          </div>
          <div className="hero-photo">
            <SiteImage
              name="hero"
              alt="Multi-brand dealership showroom with rows of certified pre-owned sedans, hatchbacks, and SUVs"
              priority
            />
          </div>
          <div className="hero-intro">
            <p>
              A curated world of certified pre-owned cars, all under one roof.
              Browse luxury sedans, family SUVs, and city hatchbacks with verified
              service history and transparent pricing.
            </p>
            <div className="hero-actions">
              <a className="button light" href="/cars">
                Explore our cars <span>→</span>
              </a>
              <a className="button dark" href="/about">
                Why Manu’s <span>↗</span>
              </a>
            </div>
          </div>
          <a className="hero-scroll" href="#features">
            Discover Manu’s <span>↓</span>
          </a>
        </section>

        {/* Brand strip */}
        <div className="brand-strip" aria-label="Explore premium car brands">
          <span>BMW</span>
          <i>•</i>
          <span>Mercedes-Benz</span>
          <i>•</i>
          <span>Audi</span>
          <i>•</i>
          <span>Volkswagen</span>
          <i>•</i>
          <span>Toyota</span>
          <i>•</i>
          <span>Porsche</span>
        </div>

        {/* Trust Badges Bar */}
        <section className="trust-strip" id="features">
          <div className="trust-strip-inner">
            <div className="trust-badge">
              <span className="trust-icon">🛡️</span>
              <div>
                <strong>150+ Point Inspection</strong>
                <p>Engine, suspension, electronics, and chassis verified</p>
              </div>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">📄</span>
              <div>
                <strong>Complete Documentation</strong>
                <p>100% verified RTO paperwork and clean service history</p>
              </div>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">🔄</span>
              <div>
                <strong>Instant Car Exchange</strong>
                <p>Best valuation offer and seamless same-day trade-in</p>
              </div>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">✨</span>
              <div>
                <strong>Non-Accidental Guarantee</strong>
                <p>Transparent condition report before you commit</p>
              </div>
            </div>
          </div>
        </section>

        {/* Collection intro */}
        <section className="section collection-intro">
          <div className="eyebrow">Your next chapter starts here</div>
          <h2>A car for every journey.</h2>
          <p>
            Explore our handpicked collection, compare full specifications, and
            book a verified test drive at our showroom.
          </p>
          <div className="collection-links-bar">
            <a className="button light" href="/cars">
              View full catalog ({'>'} 10+ cars) <span>↗</span>
            </a>
            <a className="button dark" href="/exchange">
              Sell or exchange your car <span>→</span>
            </a>
          </div>
        </section>

        {/* Live Inventory Preview */}
        <Inventory />

        {/* Experience carousel */}
        <Experience />

        {/* Journey steps */}
        <section className="story section" id="journey">
          <div className="story-copy">
            <div className="eyebrow">Buying with Manu’s</div>
            <h2>
              From your shortlist
              <br />
              to your showroom drive.
            </h2>
            <p>
              Tell us your budget and what you’re looking for. We’ll help you
              compare suitable cars, understand the available documents, and
              plan a showroom visit to see your favourites in person.
            </p>
            <div className="story-buttons">
              <EnquiryButton
                className="button light"
                title="Let’s find your next car"
              >
                Let’s talk cars <span>→</span>
              </EnquiryButton>
              <a href="/about" className="button dark">
                Read our story <span>↗</span>
              </a>
            </div>
          </div>
          <div className="journey-steps">
            <article>
              <span>01</span>
              <div>
                <h3>Browse and shortlist</h3>
                <p>
                  Filter stock by make, budget, and body style. Save the
                  cars you’d like to compare at the showroom.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Review car & paperwork</h3>
                <p>
                  Examine detailed mechanical inspection reports, ownership
                  records, and certified service history with our specialists.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Visit, test drive, and decide</h3>
                <p>
                  Experience the car on our dedicated drive route, discuss
                  easy financing or trade-in credit, and drive away with confidence.
                </p>
              </div>
            </article>
          </div>
        </section>

        {/* Showroom Visit highlight */}
        <section className="interior" id="visit">
          <SiteImage
            name="visit"
            alt="Dealership team helping customers compare cars in a modern showroom"
          />
          <div className="interior-copy">
            <div className="eyebrow">Come explore the showroom</div>
            <h2>
              Meet the cars.
              <br />
              Meet the team.
            </h2>
            <p>
              Inspect your shortlisted vehicles side by side under optimal lighting,
              enjoy a complimentary espresso in our lounge, and test drive on open roads.
            </p>
            <div className="interior-buttons">
              <a className="button light" href="/visit">
                Plan your showroom visit <span>→</span>
              </a>
              <EnquiryButton
                className="button dark"
                title="Request a showroom appointment"
                car="Visiting the showroom"
              >
                Book VIP Appointment <span>↗</span>
              </EnquiryButton>
            </div>
          </div>
        </section>

        {/* Sell / Exchange Section */}
        <section className="exchange section" id="exchange">
          <div className="exchange-photo">
            <SiteImage
              name="assessment"
              sizes="(max-width: 700px) 90vw, 45vw"
              alt="Vehicle assessor reviewing a car with its owner before an exchange"
            />
          </div>
          <div className="exchange-copy">
            <div className="eyebrow">Sell or exchange</div>
            <h2>
              A premium valuation for
              <br />
              your current vehicle.
            </h2>
            <p>
              Ready to upgrade? We offer transparent market evaluations, quick
              paperwork transfer, and immediate credit towards any car in our collection.
            </p>
            <ul>
              <li>Instant valuation estimate based on current market trends</li>
              <li>Free 20-minute physical inspection at our showroom</li>
              <li>Same-day transfer and zero paperwork headaches</li>
            </ul>
            <div className="exchange-actions">
              <a className="button light" href="/exchange">
                Calculate exchange value <span>→</span>
              </a>
              <EnquiryButton
                className="button dark"
                title="Discuss selling or exchanging"
                car="Selling or exchanging my car"
              >
                Quick enquiry <span>↗</span>
              </EnquiryButton>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq section">
          <div>
            <div className="eyebrow">Frequently asked questions</div>
            <h2>
              Everything you need
              <br />
              to know.
            </h2>
            <p>
              Have a question not listed here? Our showroom advisors are just a
              call or message away.
            </p>
            <a href="/contact" className="text-link" style={{ marginTop: "16px" }}>
              Contact support <span>→</span>
            </a>
          </div>
          <div className="faq-list">
            <details>
              <summary>
                Can I book a test drive online?<span>+</span>
              </summary>
              <p>
                Yes! Simply choose any car from our collection, pick your preferred date
                and time slot, verify your email, and our team will prepare the car for your visit.
              </p>
            </details>
            <details>
              <summary>
                What documentation is provided with each car?<span>+</span>
              </summary>
              <p>
                Every vehicle includes its original Registration Certificate (RC),
                detailed service history records, insurance policy documents, and our
                150-point technical inspection checklist.
              </p>
            </details>
            <details>
              <summary>
                How does the car exchange process work?<span>+</span>
              </summary>
              <p>
                Bring your car for a rapid 20-minute inspection. We provide an instant,
                fair-market valuation that can be deducted immediately from your new purchase,
                handling all RTO ownership transfer on your behalf.
              </p>
            </details>
            <details>
              <summary>
                Are warranty and financing options available?<span>+</span>
              </summary>
              <p>
                Yes, we offer comprehensive warranty packages along with attractive
                financing rates through our leading banking partners, with fast approval times.
              </p>
            </details>
          </div>
        </section>

        {/* Closing banner */}
        <section className="closing section">
          <div className="eyebrow">Manu’s Car World</div>
          <h2>
            Your next car starts
            <br />
            at Manu’s Car World.
          </h2>
          <div className="closing-actions">
            <a href="/cars" className="button light">
              Browse available cars <span>→</span>
            </a>
            <EnquiryButton
              className="button dark"
              title="Talk to the dealership team"
            >
              Talk to our team <span>↗</span>
            </EnquiryButton>
          </div>
        </section>
      </main>

      <Footer />
    </EnquiryProvider>
  );
}
