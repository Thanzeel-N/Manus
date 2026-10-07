import Header from "../../components/header";
import Footer from "../../components/footer";
import { EnquiryButton, EnquiryProvider } from "../../components/enquiry";
import SiteMotion from "../../components/site-motion";

export const metadata = {
  title: "Contact Showroom & Team — Manu’s Car World",
  description:
    "Get in touch with Manu’s Car World Bengaluru. Visit our climate-controlled showroom, call our team, or send an enquiry for car purchase, test drive, or exchange.",
};

export default function ContactPage() {
  return (
    <EnquiryProvider>
      <SiteMotion />
      <Header />
      <main id="main-content">
        {/* Hero */}
        <section className="contact-hero section">
          <div className="eyebrow">Get in touch</div>
          <h1>
            We’d love to
            <br />
            hear from you.
          </h1>
          <p className="contact-lead">
            Whether you want to inspect a car in person, arrange a test drive,
            or explore an exchange valuation for your current vehicle — our
            dealership team is at your service.
          </p>
        </section>

        {/* Contact details + CTA */}
        <section className="contact-grid section">
          <div className="contact-details">
            <div className="contact-card">
              <div className="contact-icon">📍</div>
              <h2>Visit our showroom</h2>
              <p>
                123 Motor Street, Showroom District
                <br />
                Bengaluru, Karnataka 560001
                <br />
                India
              </p>
              <a
                href="/visit"
                className="text-link"
                style={{ marginTop: "12px", display: "inline-flex" }}
              >
                Showroom visitor guide <span>→</span>
              </a>
            </div>

            <div className="contact-card">
              <div className="contact-icon">📞</div>
              <h2>Call our advisors</h2>
              <p>
                <a href="tel:+919876543210">+91 98765 43210</a>
                <br />
                Direct desk: +91 80 4567 8900
                <br />
                Monday to Saturday, 9:00 am to 7:00 pm IST
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">✉️</div>
              <h2>Email our team</h2>
              <p>
                <a href="mailto:hello@manuscarworld.in">
                  hello@manuscarworld.in
                </a>
                <br />
                Valuation team: <a href="mailto:exchange@manuscarworld.in">exchange@manuscarworld.in</a>
                <br />
                We reply within one business day.
              </p>
            </div>

            <div className="contact-card">
              <div className="contact-icon">🕐</div>
              <h2>Opening hours</h2>
              <ul className="hours-list">
                <li>
                  <span>Monday to Friday</span>
                  <span>9:00 am – 7:00 pm</span>
                </li>
                <li>
                  <span>Saturday</span>
                  <span>10:00 am – 6:00 pm</span>
                </li>
                <li>
                  <span>Sunday</span>
                  <span>By prior appointment only</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="contact-cta-panel">
            <div className="eyebrow">Direct enquiry</div>
            <h2>Talk to our team.</h2>
            <p>
              Tell us what you are looking for. Whether it is finding a specific
              model, planning an in-depth mechanical review, or trading in your
              vehicle, we will reach out promptly.
            </p>
            <div className="contact-cta-buttons">
              <EnquiryButton className="button light" title="Contact the team">
                Send an enquiry <span>→</span>
              </EnquiryButton>
              <a href="/cars" className="button dark">
                Explore available cars <span>↗</span>
              </a>
            </div>
            <div className="contact-trust-points">
              <span>✓ Guaranteed 2-Hour Response Time</span>
              <span>✓ No Obligation Consultation</span>
              <span>✓ Friendly & Non-Pushy Advisors</span>
            </div>
          </div>
        </section>

        {/* Map Section */}
        <section className="contact-map-section section">
          <div className="eyebrow">Showroom location</div>
          <h2>Come see us in person.</h2>
          <div className="contact-map">
            <div className="map-placeholder" aria-label="Showroom location map">
              <div className="map-pin">📍</div>
              <p className="map-title">Manu’s Car World Showroom</p>
              <p className="map-address">
                123 Motor Street, Showroom District, Bengaluru, Karnataka
              </p>
              <p className="map-tip">Free valet parking available for all visitors.</p>
              <div className="map-actions">
                <a
                  className="button light"
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open in Google Maps <span>↗</span>
                </a>
                <a className="button dark" href="/visit">
                  Visiting directions & amenities <span>→</span>
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="closing section">
          <div className="eyebrow">Manu’s Car World</div>
          <h2>
            Your next car starts
            <br />
            at Manu’s Car World.
          </h2>
          <div className="closing-actions">
            <EnquiryButton
              className="button light"
              title="Talk to the dealership team"
            >
              Talk to our team <span>→</span>
            </EnquiryButton>
            <a href="/cars" className="button dark">
              Browse car inventory <span>↗</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </EnquiryProvider>
  );
}
