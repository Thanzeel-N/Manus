"use client";

// Run synchronously while parsing the server HTML. On client renders the script
// is inert; ThemeToggle keeps the preference in sync after hydration.
export default function ThemeInit() {
  return <script
    type={typeof window === "undefined" ? "text/javascript" : "text/plain"}
    suppressHydrationWarning
    dangerouslySetInnerHTML={{ __html: `(function(){var t;try{t=localStorage.getItem('manus-theme')}catch(e){}document.documentElement.dataset.theme=t==='light'||t==='dark'?t:matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'})()` }}
  />;
}
