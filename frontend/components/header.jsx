"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import BrandLogo from "./brand-logo";
import ThemeToggle from "./theme-toggle";
import Icon from "./icon";

export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, []);
  return (
    <header className="p-header">
      <a className="p-logo" href="/" aria-label="Manu’s Car World home">
        <BrandLogo />
      </a>
      <nav
        id="public-navigation"
        className={open ? "is-open" : ""}
        aria-label="Main navigation"
      >
        {[
          ["/cars", "Our collection"],
          ["/about", "Our story"],
          ["/visit", "Visit us"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            aria-current={pathname.startsWith(href) ? "page" : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </a>
        ))}
      </nav>
      <div className="p-header-actions">
        <ThemeToggle />
        <a className="p-header-cta" href="/login">
          Sign in
          <Icon name="users" size={16} />
        </a>
        <button
          className="p-menu"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-controls="public-navigation"
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <Icon name={open ? "close" : "menu"} size={24} />
        </button>
      </div>
    </header>
  );
}
