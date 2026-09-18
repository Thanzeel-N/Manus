"use client";

import SiteImage from "./site-image";
import { useState } from "react";
import { EnquiryButton } from "./enquiry";

const slides = [
  {
    title: "More choice, under one roof.",
    text: "Browse different makes and body styles together. Compare your shortlist, explore the details, and find a pre-owned car that suits your budget and everyday needs.",
    image: "choice",
    alt: "Illustrative sedan, hatchback, and SUV available to compare on a dealership forecourt",
    link: "Browse our stock",
  },
  {
    title: "People to help you choose.",
    text: "Tell our team what you need from your next car. We’ll help you compare options and discuss the available ownership and service records before you decide.",
    image: "advice",
    alt: "Illustrative advisor showing a car interior to customers",
    link: "Talk to our team",
    interest: "Help me choose",
  },
  {
    title: "Thinking of selling or exchanging?",
    text: "Share your current car’s make, model, year, and mileage. Speak to our team about an assessment and explore your options for moving to your next car.",
    image: "exchange",
    alt: "Illustrative car owner handing over keys to discuss an exchange",
    link: "Discuss my car",
    interest: "Selling or exchanging my car",
  },
];

export default function Experience() {
  const [index, setIndex] = useState(0);
  const slide = slides[index];
  return (
    <section className="experience section" id="about">
      <div className="center-heading">
        <div className="eyebrow">The Manu’s experience</div>
        <h2>
          A dealership built around you.
          <br />
          Choice, advice, and a personal touch.
        </h2>
        <p>
          Whether you’re buying your first car, upgrading, or exploring an
          exchange, start with a conversation at Manu’s Car World.
        </p>
      </div>
      <div className="experience-image">
        <SiteImage
          key={slide.image}
          name={slide.image}
          alt={slide.alt}
          sizes="(max-width: 700px) 90vw, 82vw"
        />
      </div>
      <div className="experience-caption" aria-live="polite">
        <svg
          width="28"
          height="28"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="9" />
          <path d="M3 10h18M12 21v-7M4 11l8 3 8-3" />
        </svg>
        <h3>{slide.title}</h3>
        <p>{slide.text}</p>
        {slide.interest ? (
          <EnquiryButton
            className="text-link"
            title={slide.link}
            car={slide.interest}
          >
            {slide.link} <span>→</span>
          </EnquiryButton>
        ) : (
          <a className="text-link" href="#inventory">
            {slide.link} <span>→</span>
          </a>
        )}
      </div>
      <div
        className="slide-dots"
        role="group"
        aria-label="Explore the Manu’s experience"
      >
        {slides.map((item, i) => (
          <button
            key={item.title}
            aria-label={`Show ${item.title}`}
            aria-pressed={i === index}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </section>
  );
}
