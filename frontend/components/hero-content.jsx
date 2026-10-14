"use client";

import Icon from "./icon";

export default function HeroContent() {
  return (
    <div className="p-container p-hero-content is-visible">
      <p className="p-eyebrow">
        <span /> PRE-OWNED. RECONSIDERED.
      </p>
      <h1>
        Great cars.
        <br />
        New possibilities.
      </h1>
      <p>The confidence to choose your next car.</p>
      <div className="p-actions">
        <a className="p-button" href="/cars">
          Explore our collection <Icon name="northeast" size={18} />
        </a>
        <a className="p-hero-link" href="/visit">
          Visit the showroom <Icon name="arrow" size={19} />
        </a>
      </div>
    </div>
  );
}
