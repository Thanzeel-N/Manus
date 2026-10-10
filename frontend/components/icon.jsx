export default function Icon({
  name = "arrow",
  size = 20,
  className = "",
  filled = false,
}) {
  const paths = {
    arrow: "M4 12h16m-6-6 6 6-6 6",
    northeast: "M6 18 18 6M6 6h12v12",
    down: "M12 4v16m-6-6 6 6 6-6",
    chevron: "m9 5 7 7-7 7",
    plus: "M12 5v14M5 12h14",
    close: "m6 6 12 12M6 18 18 6",
    menu: "M4 7h16M4 12h16M4 17h16",
    check: "m5 12 4 4L19 6",
    shield: "m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-4 9 3 3 5-6",
    document: "M6 3h8l4 4v14H6V3Zm8 0v5h4M9 12h6M9 16h6",
    exchange: "M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4",
    car: "m4 9 3-5h10l3 5 1 2v7H3v-7l1-2ZM4 10h16M6 14h2m8 0h2M6 18v3m12-3v3",
    wheel:
      "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM14 12a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM3 11h7m4 0h7m-9 3v7",
    gauge: "M4 18a10 10 0 1 1 16 0M12 13l5-6M8 18h8",
    fuel: "M4 21V3h9v18M4 10h9M2 21h13M16 6l3 3v9a2 2 0 0 1-4 0v-5h-2",
    settings: "M5 4v16m7-16v16m7-16v16M2 8h6m1 8h6m1-9h6",
    calendar: "M4 5h16v16H4zM8 3v4m8-4v4M4 10h16m-12 5h2m4 0h2",
    pin: "M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0ZM14 10a2 2 0 1 1-4 0 2 2 0 0 1 4 0Z",
    mail: "M3 5h18v14H3zM3 6l9 7 9-7",
    phone: "m7 3 3 5-3 3a15 15 0 0 0 6 6l3-3 5 3-2 4C9 22 2 15 3 5l4-2Z",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 7v5l3 2",
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
    play: "m9 5 11 7-11 7V5Z",
    pause: "M8 5v14M16 5v14",
    search: "M17 10.5a6.5 6.5 0 1 1-13 0 6.5 6.5 0 0 1 13 0ZM16 16l5 5",
    users:
      "M12 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM3 21v-3a6 6 0 0 1 12 0v3m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 4v2",
    maximize:
      "M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3",
  };
  return (
    <svg
      className={`p-icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={paths[name] || paths.arrow} />
    </svg>
  );
}
