import PublicShell from "../../components/public-shell";
import Icon from "../../components/icon";
import ContactForm from "../../components/contact-form";

export const metadata = {
  title: "Contact Showroom Concierge | Manu’s Car World",
  description:
    "Get in touch with the showroom concierge at Manu’s Car World. Arrange a personal appointment, test drive, or discuss certified luxury vehicles.",
};

export default function ContactPage() {
  return (
    <PublicShell>
      <main id="main-content">
        <section className="p-contact-intro-section" aria-labelledby="contact-heading">
          <div className="p-container">
            <div className="p-breadcrumb">
              <a href="/">Home</a>
              <Icon name="chevron" size={12} />
              <span>Contact us</span>
            </div>

            <div className="p-contact-intro-content">
              <p className="p-eyebrow">SHOWROOM CONCIERGE &amp; CLIENT ADVISORY</p>
              <h1 id="contact-heading">Contact our team</h1>
              <p className="p-contact-lead">
                Whether you’re planning a showroom visit, looking for a specific certified vehicle, or seeking an unhurried consultation, our dedicated concierge team is at your service.
              </p>
            </div>
          </div>
        </section>

        {/* Quick Contact Cards */}
        <section className="p-container p-contact-channels" aria-label="Direct contact channels">
          <div className="p-channels-grid">
            <article className="p-channel-card">
              <div className="p-channel-icon">
                <Icon name="phone" size={24} />
              </div>
              <p className="p-channel-label">DIRECT CONCIERGE LINE</p>
              <h3>+91 98765 43210</h3>
              <p>Daily 9:30 AM – 8:00 PM for private bookings and general enquiries.</p>
              <a href="tel:+919876543210" className="p-text-link">
                Call showroom concierge
                <Icon name="arrow" size={16} />
              </a>
            </article>

            <article className="p-channel-card">
              <div className="p-channel-icon">
                <Icon name="pin" size={24} />
              </div>
              <p className="p-channel-label">SHOWROOM LOCATION</p>
              <h3>Prestige Luxury Mile</h3>
              <p>Plot 42, Prestige Auto Boulevard, Sector 4, Outer Ring Road, Bangalore.</p>
              <a href="/visit" className="p-text-link">
                View showroom directions
                <Icon name="northeast" size={16} />
              </a>
            </article>

            <article className="p-channel-card">
              <div className="p-channel-icon">
                <Icon name="mail" size={24} />
              </div>
              <p className="p-channel-label">DIGITAL CORRESPONDENCE</p>
              <h3>concierge@manuscarworld.com</h3>
              <p>Send documentation, service history or specific vehicle requests.</p>
              <a href="mailto:concierge@manuscarworld.com" className="p-text-link">
                Email the team
                <Icon name="arrow" size={16} />
              </a>
            </article>
          </div>
        </section>

        {/* Contact Form Section */}
        <section className="p-form-section" id="contact" aria-labelledby="form-heading">
          <div className="p-container p-contact-grid">
            <div>
              <p className="p-eyebrow">A PERSONAL CONVERSATION</p>
              <h2 id="form-heading">
                Come say hello.
                <br />
                Or start right here.
              </h2>
              <p>
                Leave your details and preferred time below. Our client advisor will prepare your vehicle files and contact you before your visit.
              </p>

              <div className="p-info-card">
                <Icon name="wheel" size={26} />
                <div>
                  <h3>Planning a test drive?</h3>
                  <p>Browse our live collection to select your vehicle and book available slots.</p>
                  <a className="p-text-link" href="/cars">
                    Find a car to test drive
                    <Icon name="arrow" size={17} />
                  </a>
                </div>
              </div>

              <div className="p-info-card" style={{ marginTop: "16px" }}>
                <Icon name="clock" size={26} />
                <div>
                  <h3>Showroom Visiting Hours</h3>
                  <p>Mon – Sat: 9:30 AM – 8:00 PM<br />Sun: 10:00 AM – 6:30 PM (By Appointment)</p>
                  <a className="p-text-link" href="/visit">
                    Explore showroom facilities
                    <Icon name="northeast" size={17} />
                  </a>
                </div>
              </div>
            </div>

            <ContactForm title="Send us a message" button="Send my enquiry" />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
