"use client";

import { useEffect, useState } from "react";

export default function TestimonialsCarousel({ reviews }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (reviews.length < 2) return undefined;
    const mobile = window.matchMedia("(max-width: 700px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer;

    const start = () => {
      window.clearInterval(timer);
      if (mobile.matches && !reducedMotion.matches && !paused) {
        timer = window.setInterval(
          () => setActive((current) => (current + 1) % reviews.length),
          4500,
        );
      }
    };

    start();
    mobile.addEventListener("change", start);
    reducedMotion.addEventListener("change", start);
    return () => {
      window.clearInterval(timer);
      mobile.removeEventListener("change", start);
      reducedMotion.removeEventListener("change", start);
    };
  }, [paused, reviews.length]);

  return (
    <div
      className="p-reviews-carousel"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      aria-roledescription="carousel"
      aria-label="Customer testimonials"
    >
      <div
        className="p-reviews-grid"
        style={{ "--review-index": active }}
        aria-live="polite"
      >
        {reviews.map(({ name, text, source, detail }, index) => (
          <article
            key={name}
            className="p-review-card"
            aria-hidden={index !== active ? undefined : false}
          >
            <div className="p-review-card-top">
              <span>{source}</span>
              <span className="p-review-stars" aria-label="5 out of 5 stars">
                <span aria-hidden="true">★★★★★</span>
              </span>
            </div>
            <p className="p-review-text">{text}</p>
            <div className="p-review-author">
              <div>
                <strong>{name}</strong>
                <span>{detail}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
      <div className="p-review-dots" aria-label="Choose a testimonial">
        {reviews.map((review, index) => (
          <button
            key={review.name}
            type="button"
            className={index === active ? "is-active" : ""}
            aria-label={`Show testimonial ${index + 1}`}
            aria-current={index === active ? "true" : undefined}
            onClick={() => setActive(index)}
          />
        ))}
      </div>
    </div>
  );
}
