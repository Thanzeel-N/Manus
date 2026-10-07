"use client";

import BrandLogo from "./brand-logo";
import ThemeToggle from "./theme-toggle";
import { useState } from "react";
import { usePathname } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return (
    <header className="header">
      <a className="brand" href="/" aria-label="Manu's Car World home">
        <BrandLogo />
      </a>
      <nav
        id="navigation"
        className={open ? "open" : ""}
        aria-label="Main navigation"
      >
        {[
          ["/", "Home"],
          ["/cars", "Our cars"],
          ["/about", "Why Manu’s"],
          ["/exchange", "Sell & exchange"],
          ["/visit", "Visit showroom"],
          ["/contact", "Contact"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className={
              (href === "/" ? pathname === "/" : pathname.startsWith(href))
                ? "active"
                : ""
            }
            aria-current={href === pathname ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
        <div className="mobile-nav-footer">
          <a
            href="/cars"
            className="button light mobile-cta-btn"
            onClick={() => setOpen(false)}
          >
            Book a test drive <span>↗</span>
          </a>
          <div className="mobile-nav-contact">
            <a href="tel:+919876543210">📞 +91 98765 43210</a>
            <span>Mon – Sat: 9 AM – 7 PM</span>
          </div>
        </div>
      </nav>
      <a href="/cars" className="button light nav-cta">
        Book a test drive <span>↗</span>
      </a>
      <ThemeToggle />
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
