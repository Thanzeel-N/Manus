"use client";

import { useEffect, useRef } from "react";

const clamp = (value, minimum, maximum) =>
  Math.min(Math.max(value, minimum), maximum);

export default function GuaranteeCar() {
  const carRef = useRef(null);

  useEffect(() => {
    const car = carRef.current;
    const section = car?.closest(".p-guarantee-section");
    if (!car || !section) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = section.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      const carWidth = car.offsetWidth;
      const carHeight = car.offsetHeight;

      if (reducedMotion.matches) {
        car.style.setProperty(
          "--guarantee-car-x",
          `${Math.max(section.clientWidth - carWidth * 0.88, 0)}px`,
        );
        car.style.setProperty(
          "--guarantee-car-y",
          `${Math.max(section.clientHeight - carHeight * 0.88, 0)}px`,
        );
        car.style.setProperty("--guarantee-car-turn", "0deg");
        car.style.opacity = window.innerWidth <= 700 ? "0.2" : "0.34";
        return;
      }

      const progress = clamp(
        (viewportHeight - rect.top) / (viewportHeight + rect.height),
        0,
        1,
      );
      const eased = progress * progress * (3 - 2 * progress);
      const baseX = Math.max(section.clientWidth - carWidth * 0.9, 0);
      const curve = Math.sin(progress * Math.PI) * section.clientWidth * 0.13;
      const x = baseX - curve;
      const startY = -carHeight * 0.82;
      const endY = rect.height - carHeight * 0.3;
      const y = startY + (endY - startY) * eased;
      const visibility = clamp(
        Math.min(progress / 0.16, (1 - progress) / 0.16),
        0,
        1,
      );
      const maximumOpacity = window.innerWidth <= 700 ? 0.24 : window.innerWidth <= 900 ? 0.3 : 0.46;
      const turn = -8 + progress * 16;

      car.style.setProperty("--guarantee-car-x", `${x}px`);
      car.style.setProperty("--guarantee-car-y", `${y}px`);
      car.style.setProperty("--guarantee-car-turn", `${turn}deg`);
      car.style.opacity = `${visibility * maximumOpacity}`;
    };

    const requestUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", requestUpdate, { passive: true });
    window.addEventListener("resize", requestUpdate);
    reducedMotion.addEventListener("change", requestUpdate);
    car.addEventListener("load", requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", requestUpdate);
      window.removeEventListener("resize", requestUpdate);
      reducedMotion.removeEventListener("change", requestUpdate);
      car.removeEventListener("load", requestUpdate);
    };
  }, []);

  return (
    <div className="p-guarantee-car-track" aria-hidden="true">
      <img
        ref={carRef}
        className="p-guarantee-car"
        src="/assets/guarantee-bmw-m3.webp"
        alt=""
        loading="lazy"
        decoding="async"
        draggable="false"
      />
    </div>
  );
}
