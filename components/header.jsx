"use client";

import { useState } from "react";
import { EnquiryButton } from "./enquiry";

export default function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header
      className="header"
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) {
          setOpen(false);
          event.currentTarget.querySelector(".menu-button")?.focus();
        }
      }}
    >
      <a className="brand" href="#" aria-label="Manu’s Car World home">
        <svg viewBox="0 0 48 35" aria-hidden="true">
          <path d="M3 29V7l11 13L24 7v22M24 29V7l11 13L45 7v22" />
        </svg>
        <span>
          manu’s<span className="brand-sub">CAR WORLD</span>
        </span>
      </a>
      <nav
        id="navigation"
        className={open ? "open" : ""}
        aria-label="Main navigation"
      >
        {[
          ["#", "Home"],
          ["#inventory", "Our cars"],
          ["#about", "Why Manu’s"],
          ["#visit", "Visit us"],
          ["#exchange", "Sell or exchange"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className={href === "#" ? "active" : ""}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
      <EnquiryButton className="button dark nav-cta">
        Book a test drive <span>↗</span>
      </EnquiryButton>
      <button
        className="menu-button"
        aria-label={open ? "Close navigation" : "Open navigation"}
        aria-expanded={open}
        aria-controls="navigation"
        onClick={() => setOpen(!open)}
      >
        {open ? "×" : "☰"}
      </button>
    </header>
  );
}
