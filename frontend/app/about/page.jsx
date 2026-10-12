import PublicShell from "../../components/public-shell";
import Icon from "../../components/icon";
import { ContactBand, Process } from "../../components/public-sections";

export const metadata = {
  title: "Our story | Manu’s Car World",
  description:
    "Meet the people behind Manu’s Car World and our personal approach to finding your next car.",
};

export default function AboutPage() {
  return (
    <PublicShell>
      <main id="main-content">
        {/* Editorial Story Header: Who We Are + Centered Quote (No buttons) */}
        <section
          className="p-story-intro-section"
          aria-labelledby="story-heading"
        >
          <div className="p-container">
            <div className="p-breadcrumb">
              <a href="/">Home</a>
              <Icon name="chevron" size={12} />
              <span>Our story</span>
            </div>

            <div className="p-story-intro-content">
              <p className="p-eyebrow">OUR STORY</p>
              <h1 id="story-heading">Who we are</h1>
              <blockquote className="p-story-quote">
                “A showroom is more than the cars on its floor. It’s the people who
                welcome you, listen to what you need and help you find your next
                drive.”
              </blockquote>
            </div>
          </div>
        </section>

        {/* Full-width team photography showcase */}
        <section
          className="p-story-photo-showcase"
          aria-label="Our showroom team"
        >
          <div className="p-story-photo-frame">
            <img
              src="/images/team-optimized.webp"
              alt="The owner and staff of Manu’s Car World together at the showroom"
              width={1920}
              height={1080}
              loading="eager"
            />
            <div className="p-story-photo-caption">
              <span className="p-story-photo-tag">MANU’S CAR WORLD</span>
              <span className="p-story-photo-meta">
                Our Owner &amp; Showroom Team
              </span>
            </div>
          </div>
        </section>

        <section
          className="p-container p-section p-about-statement"
          id="our-people"
        >
          <p className="p-eyebrow">THE PEOPLE BEHIND MANU’S</p>
          <div>
            <h2>
              A shared passion for cars.
              <br />A personal approach to people.
            </h2>
            <p>
              A showroom is more than the cars on its floor. It’s the people who
              welcome you, listen to what you need and take the time to talk
              through your options. That’s the experience we want you to have at
              Manu’s Car World.
            </p>
            <p>
              Meet our owner and staff, tell us about your everyday drive, and
              ask the questions that matter to you. From comparing cars and
              arranging a test drive to discussing paperwork and handover, our
              team is here to help you understand the next step.
            </p>
          </div>
        </section>

        <section className="p-story-section" id="inspection">
          <div className="p-container p-section">
            <div className="p-section-heading">
              <div>
                <p className="p-eyebrow">DETAILS THAT MATTER</p>
                <h2>
                  Look closer.
                  <br />
                  Choose with clarity.
                </h2>
              </div>
              <p>
                Make time for the things
                <br />
                that matter beyond the first impression.
              </p>
            </div>
            <div className="p-value-grid">
              {[
                [
                  "document",
                  "Understand the history",
                  "Review the available service, registration and ownership records with the team.",
                ],
                [
                  "settings",
                  "Explore the condition",
                  "Ask about the engine, tyres, interiors and any work the vehicle may need.",
                ],
                [
                  "wheel",
                  "Get behind the wheel",
                  "Book a test drive. Feel the comfort, response and visibility for yourself.",
                ],
                [
                  "users",
                  "Ask every question",
                  "Discuss the price, paperwork and next steps before you make a commitment.",
                ],
              ].map(([icon, title, text]) => (
                <article key={title}>
                  <Icon name={icon} size={32} />
                  <h3>{title}</h3>
                  <p>{text}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="p-container p-section">
          <p className="p-eyebrow">FROM DISCOVERY TO DRIVE</p>
          <h2>
            A thoughtful journey.
            <br />
            Every step of the way.
          </h2>
          <Process
            steps={[
              [
                "Find your shortlist",
                "Explore cars by budget, brand and body style. Save the ones you’d like to get to know.",
              ],
              [
                "Make it personal",
                "Meet the team, explore the car and arrange a test drive that works for you.",
              ],
              [
                "Know the next steps",
                "Review the final details, available documents and agreed handover arrangements.",
              ],
            ]}
          />
        </section>
        <ContactBand />
      </main>
    </PublicShell>
  );
}
