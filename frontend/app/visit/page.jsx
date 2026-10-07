import Header from "../../components/header";
import Footer from "../../components/footer";
import SiteImage from "../../components/site-image";
import { EnquiryButton, EnquiryProvider } from "../../components/enquiry";
import SiteMotion from "../../components/site-motion";

export const metadata = {
  title: "Visit Our Showroom — Manu’s Car World Bengaluru",
  description:
    "Plan your visit to Manu’s Car World showroom in Bengaluru. Indoor viewing bays, dedicated test drive route, espresso lounge, and on-site vehicle inspection.",
};

const showroomFeatures = [
  {
    icon: "🏢",
    title: "Climate-Controlled Viewing Bays",
    description:
      "Inspect every vehicle in pristine studio lighting, protected from weather, road dust, and glare.",
  },
  {
    icon: "🛣️",
    title: "Dedicated Test Drive Circuit",
    description:
      "Experience acceleration, high-speed stability, and tight city cornering on our curated 12-minute test route.",
  },
  {
    icon: "🔧",
    title: "On-Site Lift & Inspection Bay",
    description:
      "Put the car on our hydraulic lift. Our technicians will walk you through the underbody, chassis, and suspension.",
  },
  {
    icon: "☕",
    title: "Private Consultation Lounge",
    description:
      "Enjoy complimentary artisanal espresso while discussing paperwork, title documents, and financing options in privacy.",
  },
  {
    icon: "🅿️",
    title: "Complimentary Valet Parking",
    description:
      "Seamless arrival with secure, covered valet parking for all our showroom guests.",
  },
  {
    icon: "🤝",
    title: "Non-Commissioned Specialists",
    description:
      "Take your time. Our vehicle advisors are automotive enthusiasts dedicated to matching you with the right car.",
  },
];

const visitChecklist = [
  {
    icon: "🪪",
    title: "Valid Driving License",
    description: "Original physical driving license required for test drives.",
  },
  {
    icon: "📄",
    title: "Trade-in Documents (Optional)",
    description:
      "Bring your current car’s RC and insurance copy if you’d like an instant exchange valuation.",
  },
  {
    icon: "👥",
    title: "Family & Decision Makers",
    description:
      "Bring along your family or trusted mechanic to test rear-seat comfort and ride quality.",
  },
];

export default function VisitPage() {
  return (
    <EnquiryProvider>
      <SiteMotion />
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <section className="visit-hero section">
          <div className="eyebrow">The Showroom Experience</div>
          <h1>
            Meet the cars.
            <br />
            Feel the drive.
          </h1>
          <p className="visit-lead">
            Nothing compares to stepping inside a car, feeling the leather,
            listening to the engine idle, and taking it out on the open road.
            Welcome to Bengaluru’s premier automotive showroom experience.
          </p>
          <div className="visit-hero-actions">
            <EnquiryButton
              className="button light"
              title="Plan your showroom visit"
              car="Visiting the showroom"
            >
              Book a showroom visit <span>→</span>
            </EnquiryButton>
            <a href="/cars" className="button dark">
              Shortlist cars first <span>↗</span>
            </a>
          </div>
        </section>

        {/* Feature Image Banner */}
        <section className="visit-banner-section">
          <div className="visit-banner-wrap">
            <SiteImage
              name="visit"
              alt="Manu’s Car World climate-controlled indoor showroom with pre-owned cars"
              priority
            />
          </div>
        </section>

        {/* Showroom Amenities Grid */}
        <section className="section showroom-amenities">
          <div className="center-heading">
            <div className="eyebrow">Designed For You</div>
            <h2>What to expect when you visit.</h2>
            <p>
              We designed our facility to make evaluating, testing, and choosing
              your next car an enjoyable, relaxed experience.
            </p>
          </div>

          <div className="amenities-grid">
            {showroomFeatures.map((f) => (
              <div className="amenity-card" key={f.title}>
                <span className="amenity-icon">{f.icon}</span>
                <h3>{f.title}</h3>
                <p>{f.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Hours & Directions Section */}
        <section className="section visit-details-section">
          <div className="visit-details-grid">
            <div className="visit-schedule-card">
              <div className="eyebrow">Hours & Access</div>
              <h2>Operating hours.</h2>
              <ul className="schedule-list">
                <li>
                  <div>
                    <strong>Monday – Friday</strong>
                    <span>Full sales, inspection & financing team</span>
                  </div>
                  <b>9:00 AM – 7:00 PM</b>
                </li>
                <li>
                  <div>
                    <strong>Saturday</strong>
                    <span>Peak test drive day · Valet active</span>
                  </div>
                  <b>10:00 AM – 6:00 PM</b>
                </li>
                <li>
                  <div>
                    <strong>Sunday</strong>
                    <span>VIP viewings by prior appointment</span>
                  </div>
                  <b>Appointment Only</b>
                </li>
              </ul>
              <div className="schedule-tip">
                💡 <em>Pro-Tip:</em> Weekdays between 11:00 AM and 4:00 PM offer the
                fastest road conditions for extensive test drives.
              </div>
            </div>

            <div className="visit-location-card">
              <div className="eyebrow">Location</div>
              <h2>Finding us.</h2>
              <address className="location-info">
                <strong>Manu’s Car World Showroom</strong>
                <p>123 Motor Street, Showroom District</p>
                <p>Bengaluru, Karnataka 560001</p>
                <p>Near Central Ring Road Junction</p>
              </address>
              <div className="location-points">
                <span>📍 15 mins from Indiranagar</span>
                <span>📍 20 mins from MG Road</span>
                <span>🅿️ Free guest valet parking on premises</span>
              </div>
              <div className="location-actions">
                <a
                  className="button light"
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Get directions on Maps <span>↗</span>
                </a>
                <a href="tel:+919876543210" className="button dark">
                  Call reception <span>📞</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* What to bring */}
        <section className="section checklist-section">
          <div className="center-heading">
            <div className="eyebrow">Preparation</div>
            <h2>What to bring for your visit.</h2>
            <p>
              A few simple items will ensure you can test drive and review documents
              without delays.
            </p>
          </div>

          <div className="checklist-grid" style={{ maxWidth: "900px", margin: "40px auto 0" }}>
            {visitChecklist.map((item) => (
              <div className="checklist-card" key={item.title}>
                <span className="check-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Closing CTA */}
        <section className="closing section">
          <div className="eyebrow">We look forward to welcoming you</div>
          <h2>
            Plan your showroom visit
            <br />
            today.
          </h2>
          <div className="closing-actions">
            <EnquiryButton
              className="button light"
              title="Plan your showroom visit"
              car="Visiting the showroom"
            >
              Book an appointment slot <span>→</span>
            </EnquiryButton>
            <a href="/cars" className="button dark">
              Explore inventory <span>↗</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </EnquiryProvider>
  );
}
