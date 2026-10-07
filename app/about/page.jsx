import Header from "../../components/header";
import Footer from "../../components/footer";
import SiteImage from "../../components/site-image";
import { EnquiryButton, EnquiryProvider } from "../../components/enquiry";
import SiteMotion from "../../components/site-motion";

export const metadata = {
  title: "Why Manu’s Car World — Quality, Transparency & Standards",
  description:
    "Learn why car buyers trust Manu’s Car World. Discover our rigorous 150+ point technical inspection, verified legal history, warranty, and customer-first approach.",
};

const inspectionCategories = [
  {
    icon: "⚙️",
    title: "Engine & Powertrain",
    checks: [
      "Compression & cylinder balance testing",
      "Turbocharger and intercooler performance",
      "Transmission shift smoothness & clutch wear",
      "Cooling system & radiator pressure test",
      "Exhaust emissions and catalytic health",
    ],
  },
  {
    icon: "🔌",
    title: "Electrical & Computer Diagnostics",
    checks: [
      "Full manufacturer OBD-II scanner diagnostics",
      "Battery health, charging cycle & alternator load",
      "Airbag and safety restraint system validation",
      "Sensors, radar modules, and driver aids",
      "Infotainment, digital cluster, and sound system",
    ],
  },
  {
    icon: "🛞",
    title: "Chassis, Suspension & Brakes",
    checks: [
      "Brake pads, discs, lines, and ABS actuation",
      "Shock absorbers, bushings, and control arms",
      "Steering rack, tie rods, and electronic power steering",
      "Tyre tread depth, wear pattern, and alloy integrity",
      "Wheel alignment and high-speed road test",
    ],
  },
  {
    icon: "🛡️",
    title: "Frame & Structural Integrity",
    checks: [
      "Digital paint thickness gauge across all panels",
      "Pillar, apron, and chassis weld inspection",
      "100% Non-accidental and non-flood certification",
      "Glass, windshield, and weatherstripping seals",
      "Underbody rust and corrosion inspection",
    ],
  },
  {
    icon: "📄",
    title: "Legal & Documentation Clearance",
    checks: [
      "Complete RTO title and ownership chain verification",
      "Zero pending hypothecation / loan clearance NOC",
      "Genuine odometer verification against service logs",
      "Zero unpaid traffic e-challans or legal encumbrances",
      "Valid comprehensive insurance transfer support",
    ],
  },
  {
    icon: "🧼",
    title: "Interior & Detailing",
    checks: [
      "Leather upholstery deep cleanse & conditioning",
      "Dual-zone / tri-zone AC cabin temperature test",
      "Sunroof track cleaning, lubrication & seal test",
      "All electronic windows, mirrors & seat controls",
      "Complete multi-stage exterior paint correction",
    ],
  },
];

const customerStories = [
  {
    quote:
      "Buying my BMW 320d from Manu’s Car World was the smoothest dealership experience I’ve had. They showed me the complete service history, let my independent mechanic inspect the car, and had the RTO transfer completed in 4 days.",
    author: "Vikram Malhotra",
    location: "Indiranagar, Bengaluru",
    car: "2021 BMW 3 Series 320d",
    rating: "★★★★★",
  },
  {
    quote:
      "I traded in my 2018 Creta for an Audi Q5. Their valuation was higher than other platforms, and the difference amount was adjusted seamlessly with attractive financing. The car felt brand new.",
    author: "Ananya Iyer",
    location: "Koramangala, Bengaluru",
    car: "2022 Audi Q5 45 TFSI",
    rating: "★★★★★",
  },
  {
    quote:
      "No haggling, no misleading listings. What was displayed on the website was exactly what I saw in their showroom. The condition report was honest and thorough.",
    author: "Rajeshwar Rao",
    location: "Whitefield, Bengaluru",
    car: "2020 Mercedes-Benz C-Class",
    rating: "★★★★★",
  },
];

export default function AboutPage() {
  return (
    <EnquiryProvider>
      <SiteMotion />
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <section className="about-hero section">
          <div className="eyebrow">The Manu’s Difference</div>
          <h1>
            Built on transparency.
            <br />
            Driven by passion.
          </h1>
          <p className="about-lead">
            Manu’s Car World was founded with a singular conviction: buying a
            pre-owned car should feel every bit as rewarding, transparent, and
            exciting as driving one straight off the showroom floor.
          </p>
          <div className="about-stats-bar">
            <div className="stat-item">
              <strong>1,200+</strong>
              <span>Cars Delivered</span>
            </div>
            <div className="stat-item">
              <strong>150+</strong>
              <span>Quality Checkpoints</span>
            </div>
            <div className="stat-item">
              <strong>98.4%</strong>
              <span>Customer Satisfaction</span>
            </div>
            <div className="stat-item">
              <strong>100%</strong>
              <span>Verified Title Clearance</span>
            </div>
          </div>
        </section>

        {/* Narrative Section */}
        <section className="section about-narrative">
          <div className="narrative-grid">
            <div className="narrative-copy">
              <div className="eyebrow">Our Philosophy</div>
              <h2>No guesswork. No unpleasant surprises.</h2>
              <p>
                In an industry frequently clouded by uncertain vehicle backgrounds,
                tampered odometers, and undisclosed body repairs, Manu’s Car World
                operates on strict standards.
              </p>
              <p>
                Every car we bring into our showroom undergoes rigorous screening.
                If a vehicle fails any of our structural integrity, engine health,
                or documentation standards, it never enters our inventory.
              </p>
              <div className="narrative-highlights">
                <div className="highlight-box">
                  <h4>Curated Collection</h4>
                  <p>Only the top 10% of inspected cars meet our showroom standards.</p>
                </div>
                <div className="highlight-box">
                  <h4>Transparent Pricing</h4>
                  <p>Upfront pricing with no hidden dealership fees or middleman markups.</p>
                </div>
              </div>
            </div>
            <div className="narrative-image">
              <SiteImage
                name="choice"
                alt="Curated cars on display at Manu’s Car World"
                sizes="(max-width: 900px) 100vw, 45vw"
              />
            </div>
          </div>
        </section>

        {/* 150-Point Inspection Section */}
        <section className="section inspection-section" id="inspection">
          <div className="center-heading">
            <div className="eyebrow">Our Inspection Standard</div>
            <h2>The 150+ Point Verification.</h2>
            <p>
              Before a car is listed, our certified automotive engineers examine
              every mechanical, electrical, and cosmetic component.
            </p>
          </div>

          <div className="inspection-grid">
            {inspectionCategories.map((cat) => (
              <div className="inspection-card" key={cat.title}>
                <span className="card-icon">{cat.icon}</span>
                <h3>{cat.title}</h3>
                <ul>
                  {cat.checks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Customer Reviews Section */}
        <section className="section reviews-section" id="reviews">
          <div className="section-top">
            <div>
              <div className="eyebrow">Verified Experiences</div>
              <h2>What our buyers say.</h2>
            </div>
            <p>
              Real experiences from owners who found their next car at Manu’s Car World.
            </p>
          </div>

          <div className="reviews-grid">
            {customerStories.map((story, index) => (
              <div className="review-card" key={index}>
                <div className="review-stars">{story.rating}</div>
                <p className="review-quote">“{story.quote}”</p>
                <div className="review-author">
                  <strong>{story.author}</strong>
                  <span>{story.location}</span>
                  <small className="review-car">{story.car}</small>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Showroom Team Section */}
        <section className="section team-section" id="team">
          <div className="center-heading">
            <div className="eyebrow">Showroom Specialists</div>
            <h2>People who know and love cars.</h2>
            <p>
              Our advisors are automotive specialists, not commissioned high-pressure
              salespeople. We are here to answer your questions honestly.
            </p>
          </div>

          <div className="team-grid">
            <div className="team-card">
              <div className="team-avatar">MK</div>
              <h3>Manu Kumar</h3>
              <span>Founder & Managing Director</span>
              <p>20+ years of automotive leadership and curation in Bengaluru.</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">RS</div>
              <h3>Rohan Sharma</h3>
              <span>Chief Vehicle Inspector</span>
              <p>Certified master technician specializing in German luxury powertrains.</p>
            </div>
            <div className="team-card">
              <div className="team-avatar">PN</div>
              <h3>Priya Nair</h3>
              <span>Customer Experience & RTO Lead</span>
              <p>Ensures every registration transfer and delivery runs without friction.</p>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="closing section">
          <div className="eyebrow">Experience the difference</div>
          <h2>
            Ready to find your
            <br />
            next car?
          </h2>
          <div className="closing-actions">
            <a href="/cars" className="button light">
              Browse our cars <span>→</span>
            </a>
            <EnquiryButton
              className="button dark"
              title="Schedule a consultation with an advisor"
            >
              Consult with an advisor <span>↗</span>
            </EnquiryButton>
          </div>
        </section>
      </main>

      <Footer />
    </EnquiryProvider>
  );
}
