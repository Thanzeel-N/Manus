"use client";

import { useSyncExternalStore } from "react";

const key = "manus-theme";
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  window.dispatchEvent(new Event("manus-theme-change"));
}
function subscribe(notify) {
  const media = window.matchMedia("(prefers-color-scheme: dark)");
  const sync = () => {
    let saved;
    try { saved = localStorage.getItem(key); } catch {}
    applyTheme(saved === "light" || saved === "dark" ? saved : media.matches ? "dark" : "light");
  };
  const storage = event => { if (event.key === key || event.key === null) sync(); };
  window.addEventListener("manus-theme-change", notify);
  window.addEventListener("storage", storage);
  media.addEventListener("change", sync);
  // Catch a system-preference change that happened before hydration subscribed.
  sync();
  return () => {
    window.removeEventListener("manus-theme-change", notify);
    window.removeEventListener("storage", storage);
    media.removeEventListener("change", sync);
  };
}
const snapshot = () => document.documentElement.dataset.theme || "dark";
const serverSnapshot = () => "dark";

export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    try { localStorage.setItem(key, next); } catch {}
    applyTheme(next);
  }
  return <button type="button" className="theme-toggle" onClick={toggle} aria-label="Dark mode" aria-pressed={theme === "dark"} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
    <svg className="theme-sun" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>
    <svg className="theme-moon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true"><path d="M20.5 14a8.5 8.5 0 0 1-10.5-10.5A8.5 8.5 0 1 0 20.5 14Z"/></svg>
  </button>;
}
