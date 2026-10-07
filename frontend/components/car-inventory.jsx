"use client";

import { useEffect, useState } from "react";
const defaults = {
  q: "",
  make: "all",
  budget: "all",
  body: "all",
  fuel: "all",
  transmission: "all",
  year: "all",
  sort: "newest",
};

export default function Inventory({
  cars = [],
  preview = false,
  unavailable = false,
}) {
  const [filters, setFilters] = useState(defaults);
  const [category, setCategory] = useState("all");
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    setFilters(
      Object.fromEntries(
        Object.entries(defaults).map(([key, value]) => [
          key,
          query.get(key) || value,
        ]),
      ),
    );
    try {
      const stored = JSON.parse(localStorage.getItem("manus-saved") || "[]");
      if (Array.isArray(stored)) setSaved(stored);
    } catch {}
  }, []);
  function update(key, value) {
    const next = { ...filters, [key]: value };
    setFilters(next);
    const url = new URL(window.location.href);
    Object.entries(next).forEach(([key, value]) =>
      value === defaults[key]
        ? url.searchParams.delete(key)
        : url.searchParams.set(key, value),
    );
    window.history.replaceState(null, "", url);
  }
  function reset() {
    setFilters(defaults);
    setCategory("all");
    const url = new URL(window.location.href);
    Object.keys(defaults).forEach((key) => url.searchParams.delete(key));
    window.history.replaceState(null, "", url);
  }
  function toggleSaved(id) {
    const next = saved.includes(id)
      ? saved.filter((value) => value !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("manus-saved", JSON.stringify(next));
    } catch {}
  }
  const filtered = cars
    .filter(
      (car) =>
        `${car.name} ${car.brand} ${car.variant}`
          .toLowerCase()
          .includes(filters.q.toLowerCase()) &&
        (filters.make === "all" || car.brand === filters.make) &&
        (filters.budget === "all" || car.price < Number(filters.budget)) &&
        (filters.body === "all" || car.body === filters.body) &&
        (filters.fuel === "all" || car.fuel === filters.fuel) &&
        (filters.transmission === "all" ||
          car.transmission === filters.transmission) &&
        (filters.year === "all" || car.year >= Number(filters.year)) &&
        (category === "all" ||
          (category === "saved"
            ? saved.includes(car.id)
            : car.body === category)),
    )
    .sort((a, b) =>
      filters.sort === "price-low"
        ? a.price - b.price
        : filters.sort === "price-high"
          ? b.price - a.price
          : b.year - a.year,
    );
  const select = (key, label, values, all) => (
    <label>
      {label}
      <select
        aria-label={label}
        value={filters[key]}
        onChange={(event) => update(key, event.target.value)}
      >
        <option value="all">{all}</option>
        {values.map((value) => (
          <option key={value} value={value}>
            {value}
          </option>
        ))}
      </select>
    </label>
  );
  return (
    <section className="inventory section" id="inventory">
      <div className="section-top">
        <div>
          <div className="eyebrow">Find your next drive</div>
          <h2>Explore the collection.</h2>
        </div>
        <p>
          Find the right car. Get every detail.
          <br />
          Then take it for a drive.
        </p>
      </div>
      <div className="stock-search">
        <label htmlFor="car-search">Search our cars</label>
        <input
          id="car-search"
          type="search"
          placeholder="Search by brand, model or variant…"
          value={filters.q}
          onChange={(event) => update("q", event.target.value)}
        />
        <span>{filtered.length} cars found</span>
      </div>
      <div className="filters inventory-filters">
        {select(
          "make",
          "Make",
          [...new Set(cars.map((car) => car.brand))],
          "All brands",
        )}
        <label>
          Budget
          <select
            aria-label="Budget"
            value={filters.budget}
            onChange={(event) => update("budget", event.target.value)}
          >
            <option value="all">Any budget</option>
            {[10, 20, 30, 40, 50, 100].map((value) => (
              <option value={value} key={value}>
                Under ₹{value} lakh
              </option>
            ))}
          </select>
        </label>
        {select(
          "body",
          "Body style",
          [...new Set(cars.map((car) => car.body))],
          "All body styles",
        )}
        {select(
          "fuel",
          "Fuel",
          [...new Set(cars.map((car) => car.fuel))],
          "All fuels",
        )}
        {select(
          "transmission",
          "Transmission",
          ["Automatic", "Manual"],
          "Any transmission",
        )}
        {select(
          "year",
          "Year from",
          [...new Set(cars.map((car) => car.year))].sort((a, b) => b - a),
          "Any year",
        )}
      </div>
      <div className="collection-bar">
        <div className="tabs" role="group" aria-label="Car category">
          {[
            ["all", "All cars"],
            ["Sedan", "Sedans"],
            ["SUV", "SUVs"],
            ["saved", `Saved ${saved.length}`],
          ].map(([value, label]) => (
            <button
              key={value}
              className={category === value ? "selected" : ""}
              aria-pressed={category === value}
              onClick={() => setCategory(value)}
            >
              {label}
            </button>
          ))}
        </div>
        <label className="stock-sort">
          Sort by{" "}
          <select
            aria-label="Sort by"
            value={filters.sort}
            onChange={(event) => update("sort", event.target.value)}
          >
            <option value="newest">Newest year</option>
            <option value="price-low">Price: low to high</option>
            <option value="price-high">Price: high to low</option>
          </select>
        </label>
      </div>
      {preview && (
        <p className="sample-label">
          Sample collection · Illustrative photos and prices
        </p>
      )}
      <div id="car-grid" className="car-grid" aria-live="polite">
        {filtered.length ? (
          filtered.map((car) => (
            <article className="car-card" key={car.id}>
              <div className="car-image">
                <a href={`/cars/${car.id}`} aria-label={`View ${car.name}`}>
                  {car.image ? (
                    <img
                      src={car.image}
                      alt={
                        car.is_sample
                          ? `${car.name} — illustrative photo`
                          : car.name
                      }
                      loading="lazy"
                    />
                  ) : (
                    <span className="photo-placeholder">
                      Photos coming soon
                    </span>
                  )}
                </a>
                <span className="car-badge">
                  {car.status !== "available" ? car.status : car.body}
                  {car.video ? " · ▶ Video" : ""}
                </span>
                <button
                  className="save-car"
                  onClick={() => toggleSaved(car.id)}
                  aria-label={`${saved.includes(car.id) ? "Unsave" : "Save"} ${car.name}`}
                  aria-pressed={saved.includes(car.id)}
                >
                  {saved.includes(car.id) ? "♥" : "♡"}
                </button>
              </div>
              <div className="car-content">
                <div className="car-meta">
                  {car.year} · {car.variant}
                </div>
                <h3>
                  <a href={`/cars/${car.id}`}>{car.name}</a>
                </h3>
                <div className="car-specs">
                  <span>{car.km} km</span>
                  <span>{car.fuel}</span>
                  <span>{car.transmission}</span>
                </div>
                <div className="car-bottom">
                  <div className="price">
                    ₹{car.price.toFixed(2)} lakh
                    <small>
                      {car.is_sample ? "Illustrative price" : car.condition}
                    </small>
                  </div>
                  <a
                    className="car-detail-link"
                    href={`/cars/${car.id}`}
                    aria-label={`Details for ${car.name}`}
                  >
                    ↗
                  </a>
                </div>
                <a className="stock-book" href={`/cars/${car.id}#test-drive`}>
                  {car.status === "available"
                    ? "View details & book a test drive"
                    : "View car details"}{" "}
                  <span>→</span>
                </a>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">
            <h3>
              {unavailable
                ? "Inventory is temporarily unavailable."
                : "No cars in this selection."}
            </h3>
            <p>
              {unavailable
                ? "Please try again shortly."
                : "Try a different search or reset your filters."}
            </p>
            {!unavailable && (
              <button className="text-link" onClick={reset}>
                View all cars ↗
              </button>
            )}
          </div>
        )}
      </div>
      <div className="inventory-foot">
        <span>
          Showing {filtered.length} of {cars.length} cars
        </span>
        <button className="text-link" onClick={reset}>
          Reset filters ↗
        </button>
      </div>
    </section>
  );
}
