import BrandLogo from "./brand-logo";
import Icon from "./icon";

export default function Footer() {
  return (
    <footer className="p-footer">
      <div className="p-container">
        <div className="p-footer-top">
          <div className="p-footer-brand">
            <a className="p-logo" href="/" aria-label="Manu’s Car World home">
              <BrandLogo />
            </a>
            <p>
              Great cars. Clear conversations.
              <br />A new chapter on the road.
            </p>
            <span>CERTIFIED PRE-OWNED LUXURY</span>
          </div>
          <div>
            <h3>Find your drive</h3>
            <a href="/cars">Explore the collection</a>
            <a href="/cars?body=Sedan">Sedans</a>
            <a href="/cars?body=SUV">SUVs</a>
            <a href="/cars?budget=30">Cars under ₹30 lakh</a>
          </div>
          <div>
            <h3>Make it yours</h3>
            <a href="/about">Our story</a>
            <a href="/visit">Plan a showroom visit</a>
            <a href="/contact">Contact us</a>
            <a
              href="/visit#contact"
              data-contact-trigger="true"
              data-title="Speak to our showroom team"
              data-interest="Visiting the showroom"
            >
              Speak to our team
            </a>
          </div>
          <div className="p-footer-contact">
            <h3>Let’s talk cars</h3>
            <p>
              Looking for your next luxury car or exploring?
              <br />
              We’re here to help.
            </p>
            <a
              className="p-footer-enquire"
              href="/visit#contact"
              data-contact-trigger="true"
              data-title="Start a conversation with our team"
              data-interest="Visiting the showroom"
            >
              Start a conversation
              <Icon name="northeast" size={18} />
            </a>
          </div>
        </div>
        <div className="p-footer-bottom">
          <span>© {new Date().getFullYear()} Manu’s Car World</span>
          <span>Pre-owned. A whole new possibility.</span>
          <a href="/dashboard">
            Staff workspace
            <Icon name="northeast" size={13} />
          </a>
        </div>
      </div>
    </footer>
  );
}
