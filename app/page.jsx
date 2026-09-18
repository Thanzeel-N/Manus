import SiteImage from "../components/site-image";
import Header from "../components/header";
import Inventory from "../components/inventory";
import Experience from "../components/experience";
import { readSiteConfig } from "../lib/site-config.mjs";
import { EnquiryButton, EnquiryProvider } from "../components/enquiry";

export default function HomePage() {
  const { email } = readSiteConfig();
  return (
    <EnquiryProvider email={email}>
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
              alt="Illustrative multi-brand dealership showroom with rows of pre-owned sedans, hatchbacks, and SUVs"
              priority
            />
          </div>
          <div className="hero-intro">
            <p>
              A world of pre-owned cars, all in one place. Browse sedans, SUVs,
              and hatchbacks, compare your favourites, and let our team help you
              find the right fit.
            </p>
            <a className="button light" href="#inventory">
              Explore our cars <span>→</span>
            </a>
          </div>
          <a className="hero-scroll" href="#about">
            Discover Manu’s <span>↓</span>
          </a>
        </section>
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
        </div>
        <Experience />
        <Inventory />
        <section className="story section" id="journey">
          <div className="story-copy">
            <div className="eyebrow">Buying with Manu’s</div>
            <h2>
              From your shortlist
              <br />
              to your showroom visit.
            </h2>
            <p>
              Tell us your budget and what you’re looking for. We’ll help you
              compare suitable cars, understand the available documents, and
              plan a visit to see your favourites in person.
            </p>
            <EnquiryButton
              className="button light"
              title="Let’s find your next car"
            >
              Let’s talk cars <span>→</span>
            </EnquiryButton>
          </div>
          <div className="journey-steps">
            <article>
              <span>01</span>
              <div>
                <h3>Browse and shortlist</h3>
                <p>
                  Filter the stock by make, budget, and body style. Save the
                  cars you’d like to compare at the showroom.
                </p>
              </div>
            </article>
            <article>
              <span>02</span>
              <div>
                <h3>Review the car and paperwork</h3>
                <p>
                  Discuss condition, ownership, and service history with our
                  team.
                </p>
              </div>
            </article>
            <article>
              <span>03</span>
              <div>
                <h3>Visit, test drive, and decide</h3>
                <p>
                  Arrange a visit with our team, try your shortlisted car, and
                  discuss the next steps when you’re ready.
                </p>
              </div>
            </article>
          </div>
        </section>
        <section className="interior" id="visit">
          <SiteImage
            name="visit"
            alt="Illustrative dealership team helping customers compare cars in a showroom"
          />
          <div className="interior-copy">
            <div className="eyebrow">Come explore the showroom</div>
            <h2>
              Meet the cars.
              <br />
              Meet the people.
            </h2>
            <p>
              See your shortlist side by side, ask your questions, and talk
              through your options with our team. Let’s plan a visit that works
              for you.
            </p>
            <EnquiryButton
              className="button light"
              title="Plan your showroom visit"
              car="Visiting the showroom"
            >
              Plan a showroom visit <span>→</span>
            </EnquiryButton>
          </div>
        </section>
        <section className="exchange section" id="exchange">
          <div className="exchange-photo">
            <SiteImage
              name="assessment"
              sizes="(max-width: 700px) 90vw, 45vw"
              alt="Illustrative vehicle assessor reviewing a car with its owner before an exchange"
            />
          </div>
          <div className="exchange-copy">
            <div className="eyebrow">Sell or exchange</div>
            <h2>
              A new plan for
              <br />
              your current car.
            </h2>
            <p>
              Looking to upgrade or ready to sell? Start by sharing a few
              details. Our team can discuss your vehicle and whether a purchase
              or exchange is possible after assessment.
            </p>
            <ul>
              <li>Tell us the make, model, year, and mileage.</li>
              <li>Discuss condition and available vehicle records.</li>
              <li>Arrange an assessment and explore your options.</li>
            </ul>
            <EnquiryButton
              className="button light"
              title="Discuss selling or exchanging"
              car="Selling or exchanging my car"
            >
              Tell us about your car <span>→</span>
            </EnquiryButton>
          </div>
        </section>
        <section className="faq section">
          <div>
            <div className="eyebrow">Dealership questions</div>
            <h2>
              Before you
              <br />
              visit us.
            </h2>
          </div>
          <div className="faq-list">
            <details>
              <summary>
                Can I book a test drive?<span>+</span>
              </summary>
              <p>
                Choose a car and prepare an enquiry with your preferred date.
                Our team will need to confirm availability before your visit.
                {email
                  ? " Open your email app to send your enquiry to our team."
                  : " This preview downloads your enquiry as a local draft."}
              </p>
            </details>
            <details>
              <summary>
                What vehicle details can I review?<span>+</span>
              </summary>
              <p>
                Ask our team about ownership, service records, insurance, and
                condition. Review the available documentation and arrange an
                inspection before deciding.
              </p>
            </details>
            <details>
              <summary>
                Can I sell or exchange my current car?<span>+</span>
              </summary>
              <p>
                Share your make, model, year, and mileage in an enquiry. The
                team can discuss exchange possibilities after reviewing your
                vehicle.
              </p>
            </details>
            <details>
              <summary>
                Are the cars shown currently available?<span>+</span>
              </summary>
              <p>
                This preview contains sample listings, illustrative prices, and
                illustrative showroom scenes. Actual stock and dealership
                contact details will be added before launch.
              </p>
            </details>
          </div>
        </section>
        <section className="closing section">
          <div className="eyebrow">Manu’s Car World</div>
          <h2>
            Your next car starts
            <br />
            at Manu’s Car World.
          </h2>
          <EnquiryButton
            className="button light"
            title="Talk to the dealership team"
          >
            Talk to our team <span>→</span>
          </EnquiryButton>
        </section>
      </main>
      <footer>
        <div className="footer-top">
          <a className="brand" href="#">
            <span>
              manu’s<span className="brand-sub">CAR WORLD</span>
            </span>
          </a>
          <p>Your destination for pre-owned cars.</p>
          <div>
            <a href="#inventory">Our cars</a>
            <a href="#about">Our approach</a>
            <a href="#visit">Visit the showroom</a>
            <a href="#exchange">Sell or exchange</a>
            <a href="/privacy">Privacy</a>
            {email && (
              <a href={`mailto:${encodeURIComponent(email)}`}>Email our team</a>
            )}
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Manu’s Car World</span>
          <span>Buy. Sell. Exchange.</span>
        </div>
      </footer>
    </EnquiryProvider>
  );
}
