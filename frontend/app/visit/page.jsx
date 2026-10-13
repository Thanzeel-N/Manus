"use client";

import PublicShell from "../../components/public-shell";
import Icon from "../../components/icon";
import SiteImage from "../../components/site-image";
import { ContactButton } from "../../components/contact-modal";
import { SHOWROOM } from "../../lib/contact-details";

export default function VisitPage() {
  return (
    <PublicShell>
      <main id="main-content" className="p-visit-page">
        {/* ====================================================================
            1. HERO SECTION: EXPERIENCE IT IN PERSON + SHOWROOM EXTERIOR PHOTO
            ==================================================================== */}
        <section
          className="p-visit-hero-section"
          aria-labelledby="visit-hero-heading"
        >
          <div className="p-container">
            <div className="p-breadcrumb">
              <a href="/">Home</a>
              <Icon name="chevron" size={12} />
              <span>Visit us</span>
            </div>

            <div className="p-visit-hero-grid">
              {/* Left Column: Title & Text */}
              <div className="p-visit-hero-copy">
                <p className="p-eyebrow">EXPERIENCE IT IN PERSON</p>
                <h1 id="visit-hero-heading" className="p-visit-hero-title">
                  Experience it in person
                </h1>
                <p className="p-visit-hero-desc">
                  Step into our showroom and explore our curated collection of
                  certified vehicles. Meet our specialists, receive unhurried
                  advice, and find the perfect car for your journey.
                </p>

                <div className="p-visit-hero-actions">
                  <ContactButton
                    className="p-button"
                    title="Plan your showroom visit"
                    interest="Visiting the showroom"
                  >
                    Book a Showroom Visit
                    <Icon name="arrow" size={16} />
                  </ContactButton>

                  <a
                    href="#location"
                    className="p-button p-button-ghost"
                  >
                    Showroom location
                    <Icon name="northeast" size={16} />
                  </a>
                </div>
              </div>

              {/* Right Column: Showroom Exterior Architecture Photo */}
              <div className="p-visit-hero-media">
                <div className="p-visit-photo-frame">
                  <img
                    src="/site-media/images/story-showroom-exterior.jpg"
                    alt="Manu’s Car World showroom exterior"
                    className="p-visit-exterior-img"
                    width={1280}
                    height={720}
                    loading="eager"
                  />
                  <div className="p-visit-media-badge">
                    <span>MANU’S CAR WORLD</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3-Column Logistics Strip Below Hero (Matches Home Page assurances: no cards, identical size) */}
            <div className="p-visit-info-strip" role="list" aria-label="Showroom Logistics">
              {/* Item 1: Our Location */}
              <div className="p-visit-info-col" role="listitem">
                <Icon name="pin" size={29} />
                <div>
                  <h3>Our Location</h3>
                  <address>
                    {SHOWROOM.addressLines[0]}
                    <br />
                    {SHOWROOM.addressLines[1]}
                  </address>
                </div>
              </div>

              {/* Item 2: Showroom Hours */}
              <div className="p-visit-info-col" role="listitem">
                <Icon name="clock" size={29} />
                <div>
                  <h3>Showroom Hours</h3>
                  <p>
                    {SHOWROOM.hours.openDays}: {SHOWROOM.hours.openTime}
                    <br />
                    {SHOWROOM.hours.closedDay}: {SHOWROOM.hours.closedText}
                  </p>
                </div>
              </div>

              {/* Item 3: Contact Us */}
              <div className="p-visit-info-col" role="listitem">
                <Icon name="phone" size={29} />
                <div>
                  <h3>Contact Us</h3>
                  <p>
                    <a href={`tel:${SHOWROOM.phoneHref}`}>
                      {SHOWROOM.phoneDisplay}
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            2. GRAND PANORAMIC SHOWROOM INTERIOR FEATURE
            ==================================================================== */}
        <section
          className="p-visit-panoramic-section"
          aria-label="Inside Our Flagship Showroom"
        >
          <div className="p-container">
            <div className="p-visit-panoramic-frame">
              <img
                src="/site-media/images/story-cars-lineup.jpg"
                alt="Panoramic view inside Manu’s Car World showroom floor"
                className="p-visit-panoramic-img"
                width={1920}
                height={960}
                loading="lazy"
              />
              <div className="p-visit-panoramic-overlay" aria-hidden="true" />
              <div className="p-visit-panoramic-badge">
                <span className="p-panoramic-tag">FLAGSHIP EXPERIENCE</span>
                <span className="p-panoramic-title">
                  Main Presentation Bay &amp; Client Lounge
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            3. "COME MEET US" & DARK STYLIZED MAP
            ==================================================================== */}
        <section
          className="p-visit-map-section"
          id="location"
          aria-labelledby="map-heading"
        >
          <div className="p-container">
            <div className="p-visit-map-grid">
              {/* Left Column: Come Meet Us Copy */}
              <div className="p-visit-map-copy">
                <p className="p-eyebrow">LOCATION &amp; DIRECTIONS</p>
                <h2 id="map-heading" className="p-visit-section-title">
                  Come Meet Us
                </h2>
                <p className="p-visit-map-desc">
                  Find us on the Valluvambram–Mongam Bypass. Visit the showroom
                  to explore our cars up close, arrange a test drive, and get
                  personal help from our team.
                </p>

                <div className="p-visit-map-actions">
                  <a
                    href={SHOWROOM.directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-button p-button-ghost"
                  >
                    Get Directions
                    <Icon name="northeast" size={16} />
                  </a>
                </div>
              </div>

              {/* Right Column: Stylized Dark Mode Map */}
              <div className="p-visit-map-card">
                <div className="p-dark-map-shell">
                  {/* Stylized SVG Map Graphics */}
                  <svg
                    className="p-dark-map-svg"
                    viewBox="0 0 600 400"
                    preserveAspectRatio="xMidYMid slice"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="mapWater" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#0a1016" />
                        <stop offset="100%" stopColor="#060c12" />
                      </linearGradient>
                      <linearGradient id="mapLand" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#141419" />
                        <stop offset="100%" stopColor="#0f0f13" />
                      </linearGradient>
                    </defs>

                    {/* Dark Landmass */}
                    <rect width="600" height="400" fill="url(#mapLand)" />

                    {/* Coastline / Water Body on Left */}
                    <path
                      d="M0,0 L140,0 C120,80 160,150 130,220 C100,290 140,350 120,400 L0,400 Z"
                      fill="url(#mapWater)"
                      opacity="0.9"
                    />
                    <path
                      d="M140,0 C120,80 160,150 130,220 C100,290 140,350 120,400"
                      fill="none"
                      stroke="#1e3040"
                      strokeWidth="1.5"
                    />

                    {/* Minor Roads Grid */}
                    <path
                      d="
                        M130,100 L600,120
                        M140,180 L600,160
                        M120,260 L600,270
                        M130,340 L600,330
                        M260,0 L240,400
                        M390,0 L420,400
                        M510,0 L490,400
                      "
                      stroke="#22222a"
                      strokeWidth="1.2"
                      strokeDasharray="4 4"
                    />

                    {/* Major Arterial Roads / Highways */}
                    <path
                      d="M135,140 Q 250,130 380,180 T 600,220"
                      fill="none"
                      stroke="#32323c"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M200,400 Q 280,260 360,140 T 480,0"
                      fill="none"
                      stroke="#32323c"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />
                    <path
                      d="M380,180 L360,140"
                      fill="none"
                      stroke="#42424e"
                      strokeWidth="4"
                    />

                    {/* Highway Accent Highlight */}
                    <path
                      d="M135,140 Q 250,130 380,180 T 600,220"
                      fill="none"
                      stroke="#3a3a46"
                      strokeWidth="1.5"
                    />

                    {/* Geographic Landmark Labels */}
                    <text
                      x="28"
                      y="210"
                      fill="#50667a"
                      fontSize="11"
                      fontFamily="'Inter Tight', Arial, sans-serif"
                      fontWeight="500"
                      letterSpacing="0.5"
                    >
                      Valluvambram
                    </text>
                    <circle cx="98" cy="207" r="2.5" fill="#50667a" />

                    <text
                      x="340"
                      y="235"
                      fill="#5e5e6c"
                      fontSize="10"
                      fontFamily="'Inter Tight', Arial, sans-serif"
                    >
                      Mongam Bypass
                    </text>

                    <text
                      x="430"
                      y="350"
                      fill="#5e5e6c"
                      fontSize="10"
                      fontFamily="'Inter Tight', Arial, sans-serif"
                    >
                      Showroom Road
                    </text>
                  </svg>

                  {/* Showroom Pin Marker */}
                  <div className="p-map-pin-anchor">
                    <div className="p-pin-pulse" aria-hidden="true" />
                    <div className="p-pin-marker">
                      <svg viewBox="0 0 24 24" fill="currentColor" stroke="#ffffff" strokeWidth="1.2">
                        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                        <circle cx="12" cy="10" r="3" fill="#ffffff" />
                      </svg>
                    </div>

                    {/* Floating Info Card */}
                    <div className="p-map-tooltip-card">
                      <div className="p-tooltip-badge">
                        <span className="p-tooltip-dot" />
                        <strong>Manu’s Car World</strong>
                      </div>
                      <p>
                        {SHOWROOM.addressLines[0]}
                        <br />
                        {SHOWROOM.addressLines[1]}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================================
            4. 4-PHOTO SHOWCASE GALLERY GRID
            ==================================================================== */}
        <section
          className="p-visit-gallery-section"
          aria-label="Showroom Gallery"
        >
          <div className="p-container">
            <div className="p-visit-gallery-grid">
              {/* Photo 1: Showroom Exterior Night */}
              <div className="p-gallery-card">
                <img
                  src="/site-media/images/story-showroom-exterior.jpg"
                  alt="Manu’s Car World showroom exterior"
                  width={600}
                  height={400}
                  loading="eager"
                />
                <div className="p-gallery-caption">
                  <span>Exterior Facade</span>
                </div>
              </div>

              {/* Photo 2: Luxury Sports Cars on Showroom Floor */}
              <div className="p-gallery-card">
                <SiteImage
                  name="visit"
                  alt="A Manu's Car World advisor discussing vehicle options with a customer"
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
                <div className="p-gallery-caption">
                  <span>Personal Consultation</span>
                </div>
              </div>

              {/* Photo 3: VIP Client Consultation Lounge */}
              <div className="p-gallery-card">
                <SiteImage
                  name="advice"
                  alt="Manu's Car World team members reviewing car details in the showroom"
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
                <div className="p-gallery-caption">
                  <span>Personal Guidance</span>
                </div>
              </div>

              {/* Photo 4: Performance Car Red Glowing OLED Taillight */}
              <div className="p-gallery-card">
                <SiteImage
                  name="assessment"
                  alt="Manu's Car World specialists assessing a vehicle"
                  sizes="(max-width: 700px) 100vw, 50vw"
                />
                <div className="p-gallery-caption">
                  <span>Vehicle Assessment</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
