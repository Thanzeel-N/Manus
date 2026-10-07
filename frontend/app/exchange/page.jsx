import Header from "../../components/header";
import Footer from "../../components/footer";
import SiteImage from "../../components/site-image";
import ValuationCalculator from "../../components/valuation-calculator";
import { EnquiryButton, EnquiryProvider } from "../../components/enquiry";
import SiteMotion from "../../components/site-motion";

export const metadata = {
  title: "Sell or Exchange Your Car — Instant Valuation | Manu’s Car World",
  description:
    "Sell your car or trade it in for a certified pre-owned upgrade at Manu’s Car World Bengaluru. Free instant valuation, fair market pricing, and immediate RTO transfer.",
};

const exchangeSteps = [
  {
    step: "01",
    title: "Instant Online Estimate",
    text: "Use our interactive valuation tool to receive an immediate market range based on your car’s make, model, year, and condition.",
  },
  {
    step: "02",
    title: "Free 20-Min Physical Inspection",
    text: "Drive into our showroom or schedule an inspection. Our master assessors test OBD diagnostics, paint gauge, and mechanical health with total transparency.",
  },
  {
    step: "03",
    title: "Transparent Price Offer",
    text: "Receive an upfront, written offer with zero hidden deductions. Our offers are valid for 7 days so you never feel pressured.",
  },
  {
    step: "04",
    title: "Immediate Payment or Trade-In Credit",
    text: "Choose instant bank payment or apply the valuation directly towards any car in our collection with special loyalty exchange bonus.",
  },
];

const checklistItems = [
  { icon: "📄", title: "Original RC Book / Smart Card", note: "Vehicle registration certificate" },
  { icon: "🛡️", title: "Valid Comprehensive Insurance", note: "Policy copy showing active coverage" },
  { icon: "🔑", title: "Original Spare Keys", note: "Both sets of manufacturer keys" },
  { icon: "📘", title: "Service Booklet & Records", note: "Authorized workshop service history" },
  { icon: "🪪", title: "Owner KYC Documents", note: "Aadhaar / PAN card of registered owner" },
  { icon: "🏦", title: "Bank Loan NOC (If Applicable)", note: "Foreclosure or clearance letter" },
];

export default function ExchangePage() {
  return (
    <EnquiryProvider>
      <SiteMotion />
      <Header />
      <main id="main-content">
        {/* Hero Section */}
        <section className="exchange-hero section">
          <div className="eyebrow">Trade-In & Direct Purchase</div>
          <h1>
            A better valuation for
            <br />
            your current car.
          </h1>
          <p className="exchange-lead">
            Whether you want to trade in your current vehicle for an upgrade from
            our collection or sell outright for instant payment, Manu’s Car World
            ensures fair market prices with zero middleman hassle.
          </p>
          <div className="exchange-hero-buttons">
            <a href="#valuation" className="button light">
              Calculate valuation <span>↓</span>
            </a>
            <EnquiryButton
              className="button dark"
              title="Schedule an assessment at the showroom"
              car="Selling or exchanging my car"
            >
              Book an assessment <span>→</span>
            </EnquiryButton>
          </div>
        </section>

        {/* Interactive Valuation Tool */}
        <section className="section" style={{ paddingTop: 0 }}>
          <ValuationCalculator />
        </section>

        {/* 4-Step Process Section */}
        <section className="section exchange-process">
          <div className="section-top">
            <div>
              <div className="eyebrow">How It Works</div>
              <h2>Simple, fast, and transparent.</h2>
            </div>
            <p>
              From your first online estimate to driving away in your upgrade,
              we have eliminated dealership friction.
            </p>
          </div>

          <div className="steps-grid">
            {exchangeSteps.map((s) => (
              <div className="step-card" key={s.step}>
                <span className="step-num">{s.step}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Photo + Value Proposition */}
        <section className="section exchange-story">
          <div className="exchange-photo-panel">
            <SiteImage
              name="assessment"
              sizes="(max-width: 900px) 100vw, 45vw"
              alt="Assessor inspecting a car before trade-in at Manu’s Car World"
            />
          </div>
          <div className="exchange-story-copy">
            <div className="eyebrow">Why Sell to Manu’s</div>
            <h2>No strangers calling. No payment risks.</h2>
            <p>
              Selling privately on classifieds means dealing with low-ball offers,
              strangers showing up at your doorstep, and the lingering legal risk of
              untransferred RTO registration.
            </p>
            <ul className="benefit-list">
              <li>
                <strong>Immediate Bank Transfer:</strong> 100% of the funds
                transferred directly to your account before you hand over keys.
              </li>
              <li>
                <strong>Full Legal Indemnity:</strong> We issue a legal delivery
                receipt immediately, freeing you from liability from day one.
              </li>
              <li>
                <strong>Complimentary RTO Transfer:</strong> Our dedicated RTO team
                manages all paperwork and sends you the updated RC copy upon completion.
              </li>
              <li>
                <strong>Exchange Bonus Credit:</strong> Enjoy up to ₹50,000 extra
                credit when exchanging for any car in our showroom stock.
              </li>
            </ul>
            <EnquiryButton
              className="button light"
              title="Speak to our valuation assessor"
              car="Selling or exchanging my car"
            >
              Speak to an assessor <span>→</span>
            </EnquiryButton>
          </div>
        </section>

        {/* Checklist Section */}
        <section className="section checklist-section">
          <div className="center-heading">
            <div className="eyebrow">What to Bring</div>
            <h2>Documents for a quick handover.</h2>
            <p>
              Bring these items when visiting our showroom for an inspection to enable
              same-day settlement and transfer.
            </p>
          </div>

          <div className="checklist-grid">
            {checklistItems.map((item) => (
              <div className="checklist-card" key={item.title}>
                <span className="check-icon">{item.icon}</span>
                <h4>{item.title}</h4>
                <p>{item.note}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ Section */}
        <section className="section faq-compact">
          <div className="center-heading">
            <div className="eyebrow">Exchange FAQs</div>
            <h2>Common questions answered.</h2>
          </div>
          <div className="faq-list" style={{ maxWidth: "800px", margin: "40px auto 0" }}>
            <details>
              <summary>
                Can I exchange my car if it still has an active loan?<span>+</span>
              </summary>
              <p>
                Yes! We will contact your lender to obtain the loan foreclosure amount.
                We settle the outstanding loan directly with your bank and pay you the
                remaining balance, or apply it toward your next car.
              </p>
            </details>
            <details>
              <summary>
                How long is my valuation quote valid?<span>+</span>
              </summary>
              <p>
                Our written physical assessment quote is valid for 7 days or 250 additional
                kilometers, giving you complete peace of mind to make your decision.
              </p>
            </details>
            <details>
              <summary>
                Do you accept out-of-state registered vehicles?<span>+</span>
              </summary>
              <p>
                Yes, subject to clean documentation and valid RTO clearance from the
                originating state. Our team can assist with Karnataka road tax calculation
                and NOC processing.
              </p>
            </details>
          </div>
        </section>

        {/* Closing CTA */}
        <section className="closing section">
          <div className="eyebrow">Ready for an upgrade?</div>
          <h2>
            Find out what your car
            <br />
            is worth today.
          </h2>
          <div className="closing-actions">
            <a href="#valuation" className="button light">
              Calculate value now <span>→</span>
            </a>
            <a href="/cars" className="button dark">
              Browse cars to exchange for <span>↗</span>
            </a>
          </div>
        </section>
      </main>

      <Footer />
    </EnquiryProvider>
  );
}
