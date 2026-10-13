import PublicShell from "../../components/public-shell";
import Icon from "../../components/icon";
import ContactForm from "../../components/contact-form";
import { SHOWROOM } from "../../lib/contact-details";

export const metadata = {
  title: "Contact Us | Manu’s Car World",
  description:
    "Contact Manu’s Car World in Valluvambram, Malappuram. Call the showroom, get directions, check opening hours, or send a general enquiry.",
};

export default function ContactPage() {
  return (
    <PublicShell>
      <main id="main-content" className="p-contact-page">
        <section
          className="p-contact-intro-section"
          aria-labelledby="contact-heading"
        >
          <div className="p-container">
            <div className="p-breadcrumb">
              <a href="/">Home</a>
              <Icon name="chevron" size={12} />
              <span>Contact us</span>
            </div>

            <div className="p-contact-intro-content">
              <p className="p-eyebrow">LET’S TALK CARS</p>
              <h1 id="contact-heading">Contact us</h1>
              <p className="p-contact-lead">
                Tell us what you’re looking for, ask about a vehicle, or plan a
                visit. Our team is ready to help you take the next step with
                clarity.
              </p>
            </div>
          </div>
        </section>

        <section
          className="p-container p-contact-channels"
          aria-label="Showroom contact information"
        >
          <div className="p-channels-grid">
            <article className="p-channel-card">
              <div className="p-channel-icon">
                <Icon name="phone" size={24} />
              </div>
              <p className="p-channel-label">CALL THE SHOWROOM</p>
              <h2>{SHOWROOM.phoneDisplay}</h2>
              <p>
                Speak directly with our team about available cars, visits, and
                general enquiries.
              </p>
              <a
                href={`tel:${SHOWROOM.phoneHref}`}
                className="p-text-link"
                aria-label={`Call Manu’s Car World on ${SHOWROOM.phoneDisplay}`}
              >
                Call now
                <Icon name="arrow" size={16} />
              </a>
            </article>

            <article className="p-channel-card">
              <div className="p-channel-icon">
                <Icon name="pin" size={24} />
              </div>
              <p className="p-channel-label">VISIT THE SHOWROOM</p>
              <h2>Valluvambram</h2>
              <address className="p-contact-address">
                {SHOWROOM.addressLines.map((line) => (
                  <span key={line}>{line}</span>
                ))}
              </address>
              <a
                href={SHOWROOM.directionsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-text-link"
              >
                Get directions
                <Icon name="northeast" size={16} />
              </a>
            </article>

            <article className="p-channel-card p-channel-hours">
              <div className="p-channel-icon">
                <Icon name="clock" size={24} />
              </div>
              <p className="p-channel-label">WORKING HOURS</p>
              <h2>Open six days</h2>
              <dl className="p-contact-hours">
                <div>
                  <dt>{SHOWROOM.hours.openDays}</dt>
                  <dd>{SHOWROOM.hours.openTime}</dd>
                </div>
                <div>
                  <dt>{SHOWROOM.hours.closedDay}</dt>
                  <dd>{SHOWROOM.hours.closedText}</dd>
                </div>
              </dl>
            </article>
          </div>
        </section>

        <section
          className="p-form-section"
          id="enquiry"
          aria-labelledby="enquiry-heading"
        >
          <div className="p-container p-contact-grid">
            <div className="p-contact-form-copy">
              <p className="p-eyebrow">GENERAL ENQUIRIES</p>
              <h2 id="enquiry-heading">
                Start a
                <br />
                conversation.
              </h2>
              <p>
                Share your question or the kind of car you have in mind. Your
                enquiry goes directly to the same showroom system used across
                this website.
              </p>

              <div className="p-contact-direct">
                <Icon name="phone" size={24} />
                <div>
                  <span>Prefer to speak now?</span>
                  <a href={`tel:${SHOWROOM.phoneHref}`}>
                    {SHOWROOM.phoneDisplay}
                  </a>
                </div>
              </div>

              <p className="p-contact-response-note">
                <Icon name="clock" size={18} />
                Appointments and vehicle availability are confirmed separately
                by the showroom team.
              </p>
            </div>

            <ContactForm
              title="Send us a message"
              button="Send my enquiry"
              interest="General enquiry"
              requireMessage
            />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
