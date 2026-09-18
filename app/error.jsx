"use client";
export default function ErrorPage({ reset }) {
  return (
    <main id="main-content" className="section">
      <h1>Something went wrong</h1>
      <p>Please try again.</p>
      <button className="button light" onClick={reset}>
        Try again
      </button>
      <a href="/">Return home</a>
    </main>
  );
}
