import BrandLogo from "./brand-logo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-main">
        <div className="footer-brand-col">
          <a className="brand" href="/" aria-label="Manu’s Car World home">
            <BrandLogo />
          </a>
          <p className="footer-tagline">
            Bengaluru’s premier destination for certified pre-owned cars.
            Curated luxury sedans, family SUVs, and trusted everyday drives
            with complete service history and verified paperwork.
          </p>
          <div className="footer-assurances">
            <span className="assurance-tag">✓ 150-Point Inspected</span>
            <span className="assurance-tag">✓ Verified RTO Papers</span>
            <span className="assurance-tag">✓ Transparent Pricing</span>
          </div>
        </div>

        <div className="footer-links-grid">
          <div className="footer-col">
            <h4>Collection</h4>
            <ul>
              <li><a href="/cars">All Available Stock</a></li>
              <li><a href="/cars?body=Sedan">Luxury Sedans</a></li>
              <li><a href="/cars?body=SUV">Premium SUVs</a></li>
              <li><a href="/cars?budget=30">Under ₹30 Lakh</a></li>
              <li><a href="/cars?sort=newest">Latest Arrivals</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Dealership</h4>
            <ul>
              <li><a href="/about">Why Manu’s</a></li>
              <li><a href="/about#inspection">150-Point Inspection</a></li>
              <li><a href="/about#team">Showroom Team</a></li>
              <li><a href="/about#reviews">Customer Reviews</a></li>
              <li><a href="/visit">Showroom Tour</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Services</h4>
            <ul>
              <li><a href="/exchange">Sell Your Car</a></li>
              <li><a href="/exchange#valuation">Instant Car Valuation</a></li>
              <li><a href="/cars">Book a Test Drive</a></li>
              <li><a href="/contact">Financing Guidance</a></li>
              <li><a href="/visit">Showroom Appointment</a></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>Visit Us</h4>
            <address className="footer-address">
              <p>123 Motor Street, Showroom District</p>
              <p>Bengaluru, Karnataka 560001</p>
              <p className="footer-timing">Mon – Sat: 9:00 AM – 7:00 PM</p>
              <p className="footer-timing">Sunday: By appointment</p>
              <div className="footer-contact-links">
                <a href="tel:+919876543210">📞 +91 98765 43210</a>
                <a href="mailto:hello@manuscarworld.in">✉️ hello@manuscarworld.in</a>
              </div>
            </address>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-legal">
          <span>© {currentYear} Manu’s Car World. All rights reserved.</span>
          <span>Certified Pre-owned Dealership · Buy · Sell · Exchange</span>
        </div>
        <div className="footer-bottom-links">
          <a href="/contact">Showroom Map</a>
          <a href="/dashboard" className="staff-link">Staff Workspace ↗</a>
        </div>
      </div>
    </footer>
  );
}
