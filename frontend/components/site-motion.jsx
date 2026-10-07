"use client";

import { useEffect } from "react";

// Progressive enhancement: the server-rendered page is always readable.
export default function SiteMotion() {
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const selector = [
      ".brand-strip > span",
      ".center-heading > *",
      ".experience-image",
      ".section-top > *",
      ".filters",
      ".collection-bar",
      ".car-card",
      ".story-copy > *",
      ".journey-steps article",
      ".interior-copy > *",
      ".exchange-photo",
      ".exchange-copy > *",
      ".faq > div:first-child > *",
      ".faq-list details",
      ".closing > *",
      ".footer-top > *",
    ].join(",");
    let observer;
    let mutations;
    const pending = new Set();

    function reveal(element) {
      element.classList.remove("motion-pending");
      element.classList.add("motion-visible");
      pending.delete(element);
      observer?.unobserve(element);
    }

    function stop() {
      observer?.disconnect();
      mutations?.disconnect();
      pending.forEach((element) => element.classList.remove("motion-pending"));
      pending.clear();
    }

    function start() {
      stop();
      if (preference.matches || !("IntersectionObserver" in window)) return;
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(({ target, isIntersecting }) => {
            if (isIntersecting) reveal(target);
          });
        },
        { threshold: 0.08, rootMargin: "0px 0px -24px 0px" },
      );

      function register() {
        document.querySelectorAll(selector).forEach((element) => {
          if (
            pending.has(element) ||
            element.classList.contains("motion-visible")
          )
            return;
          const siblings = [...element.parentElement.children].filter((child) =>
            child.matches(selector),
          );
          element.style.setProperty(
            "--reveal-delay",
            `${Math.min(siblings.indexOf(element), 3) * 85}ms`,
          );
          // Don't hide content already in view during hydration or hash navigation.
          if (element.getBoundingClientRect().top < window.innerHeight) {
            element.classList.add("motion-visible");
            return;
          }
          pending.add(element);
          element.classList.add("motion-pending");
          observer.observe(element);
        });
        pending.forEach((element) => {
          if (!element.isConnected) {
            observer.unobserve(element);
            pending.delete(element);
          }
        });
      }
      register();
      mutations = new MutationObserver(register);
      mutations.observe(document.getElementById("main-content"), {
        childList: true,
        subtree: true,
      });
    }
    function onFocus(event) {
      const target = event.target.closest(".motion-pending");
      if (target) reveal(target);
    }
    start();
    preference.addEventListener("change", start);
    document.addEventListener("focusin", onFocus);
    return () => {
      stop();
      preference.removeEventListener("change", start);
      document.removeEventListener("focusin", onFocus);
    };
  }, []);
  return null;
}
