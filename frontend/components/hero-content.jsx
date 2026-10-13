"use client";

import { useEffect, useState } from "react";
import Icon from "./icon";

const HERO_REVEAL_DELAY = 8000;

export default function HeroContent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setVisible(true), HERO_REVEAL_DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div
      className={`p-container p-hero-content${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
      inert={visible ? undefined : true}
    >
      <p className="p-eyebrow"><span /> PRE-OWNED. RECONSIDERED.</p>
      <h1>Great cars.<br />New possibilities.</h1>
      <p>The confidence to choose your next car.</p>
      <div className="p-actions">
        <a className="p-button" href="/cars">Explore our collection <Icon name="northeast" size={18} /></a>
        <a className="p-hero-link" href="/visit">Visit the showroom <Icon name="arrow" size={19} /></a>
      </div>
    </div>
  );
}
