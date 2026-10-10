import PublicShell from "../../components/public-shell";
import Icon from "../../components/icon";
import ContactForm from "../../components/contact-form";
import ShowroomSpaces from "../../components/showroom-spaces";

export const metadata = {
  title: "Visit Our Showroom | Manu’s Car World",
  description:
    "Visit our flagship showroom on Outer Ring Road, Bangalore. Explore certified luxury cars, our client lounge, diagnostic studio, and test-drive routes.",
};

export default function VisitPage() {
  return (
    <PublicShell>
      <main id="main-content">
        {/* Simple Page Header (No dark hero section) */}
        <section className="p-visit-intro-section" aria-labelledby="visit-heading">
          <div className="p-container">
            <div className="p-breadcrumb">
              <a href="/">Home</a>
              <Icon name="chevron" size={12} />
              <span>Visit our showroom</span>
            </div>

            <div className="p-visit-intro-content">
              <p className="p-eyebrow">FLAGSHIP SHOWROOM · BANGALORE</p>
              <h1 id="visit-heading">Visit our showroom</h1>
              <p className="p-visit-lead">
                Step inside Manu’s Car World. Explore our 12,000 sq.ft climate-controlled showroom, review certified luxury cars in daylight bays, or meet our vehicle specialists for an unhurried consultation.
              </p>

              <div className="p-visit-intro-actions">
                <button
                  type="button"
                  className="p-button"
                  data-contact-trigger="true"
                  data-title="Plan your showroom visit"
                  data-interest="Visiting the showroom"
                >
                  Plan your showroom visit
                  <Icon name="calendar" size={17} />
                </button>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-button p-button-ghost"
                >
                  Get directions on Maps
                  <Icon name="northeast" size={15} />
                </a>

                <a href="tel:+919876543210" className="p-visit-phone-link">
                  <Icon name="phone" size={15} />
                  <span>+91 98765 43210</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Showroom Photos Section */}
        <section className="p-container p-section" id="showroom-spaces" aria-labelledby="spaces-heading">
          <div className="p-section-heading">
            <div>
              <p className="p-eyebrow">THE SHOWROOM SPACES</p>
              <h2 id="spaces-heading">
                Take a look inside.
                <br />
                Our facility spaces.
              </h2>
            </div>
            <p>
              Take an interactive look around our presentation bays, client suites, and technical facilities.
            </p>
          </div>

          <ShowroomSpaces />
        </section>

        {/* Showroom Location & Timings Section */}
        <section className="p-container p-section p-visit-logistics" id="location" aria-labelledby="location-heading">
          <div className="p-section-heading">
            <div>
              <p className="p-eyebrow">LOCATION &amp; TIMINGS</p>
              <h2 id="location-heading">
                How to find us.
                <br />
                Hours &amp; directions.
              </h2>
            </div>
            <p>
              Situated conveniently on Outer Ring Road, Bangalore with complimentary guest valet and fast charging.
            </p>
          </div>

          <div className="p-logistics-grid">
            {/* Showroom Location & Directions */}
            <article className="p-logistics-card">
              <div className="p-logistics-card-header">
                <Icon name="pin" size={18} />
                <h3>Showroom Location</h3>
              </div>
              <p className="p-address-text">
                <strong>Manu’s Car World Flagship</strong>
                <br />
                Plot 42, Prestige Auto Boulevard, Sector 4,
                <br />
                Outer Ring Road (Opposite Horizon Tower),
                <br />
                Bangalore, Karnataka 560100
              </p>
              <div className="p-transit-notes">
                <p>Complimentary guest valet parking &amp; 150kW DC fast chargers on premises.</p>
                <p>5-minute walk from Prestige Central Metro; Outer Ring Road Exit 8.</p>
              </div>
              <div className="p-location-card-actions">
                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-text-link"
                >
                  Open in Google Maps
                  <Icon name="northeast" size={15} />
                </a>
              </div>
            </article>

            {/* Operating Hours */}
            <article className="p-logistics-card">
              <div className="p-logistics-card-header">
                <Icon name="clock" size={18} />
                <h3>Operating Hours</h3>
              </div>
              <ul className="p-hours-list">
                <li>
                  <span>Monday – Friday</span>
                  <strong>9:30 AM – 8:00 PM</strong>
                </li>
                <li>
                  <span>Saturday</span>
                  <strong>9:30 AM – 8:00 PM</strong>
                </li>
                <li>
                  <span>Sunday</span>
                  <strong>10:00 AM – 6:30 PM</strong>
                </li>
              </ul>
              <p className="p-logistics-subtext">
                Weekdays between 11:00 AM and 3:00 PM offer our quietest, most unhurried browsing atmosphere.
              </p>
            </article>

            {/* What to Bring */}
            <article className="p-logistics-card">
              <div className="p-logistics-card-header">
                <Icon name="document" size={18} />
                <h3>Visitor Information</h3>
              </div>
              <ul className="p-checklist">
                <li>
                  <Icon name="check" size={14} />
                  <span>
                    <strong>Valid Driving License</strong>
                    Mandatory for all circuit test-drive participants.
                  </span>
                </li>
                <li>
                  <Icon name="check" size={14} />
                  <span>
                    <strong>Vehicle Registration Documents</strong>
                    If you would like an on-the-spot valuation for your current car.
                  </span>
                </li>
                <li>
                  <Icon name="check" size={14} />
                  <span>
                    <strong>Government ID</strong>
                    For same-day reservations or financing eligibility check.
                  </span>
                </li>
              </ul>
            </article>
          </div>
        </section>

        {/* Contact & Appointment Section */}
        <section
          className="p-form-section"
          id="contact"
          aria-labelledby="contact-heading"
        >
          <span id="plan-visit" />
          <div className="p-container p-contact-grid">
            <div>
              <p className="p-eyebrow">VISIT US · CONTACT US</p>
              <h2 id="contact-heading">
                Come say hello.
                <br />
                Or start right here.
              </h2>
              <p>
                Plan a visit, request a specific vehicle walkaround, or talk to our concierge team. Settle on a preferred date below and our concierge will confirm your slot.
              </p>

              {/* Appointment Pop-up Trigger Card */}
              <div className="p-popup-trigger-card">
                <span className="p-trigger-tag">SCHEDULED PRIVATE APPOINTMENT</span>
                <h3>Reserve a 1-on-1 Showroom Advisor</h3>
                <p>
                  Book through our interactive appointment system to choose your preferred morning, afternoon, or evening slot.
                </p>
                <button
                  type="button"
                  className="p-button"
                  data-contact-trigger="true"
                  data-title="Schedule a showroom appointment"
                  data-interest="Visiting the showroom"
                >
                  Open Appointment Pop-up
                  <Icon name="northeast" size={18} />
                </button>
              </div>
            </div>

            <ContactForm title="Send us a message" button="Send my enquiry" interest="Visiting the showroom" />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
