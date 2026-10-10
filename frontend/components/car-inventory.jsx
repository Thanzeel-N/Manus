"use client";

import { useEffect, useRef, useState } from "react";
import { matchesCarSearch } from "../lib/car-search";
import Icon from "./icon";
import VehicleImage from "./vehicle-image";
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const filterDialog = useRef(null);
  const activeFilterCount = [
    "make",
    "budget",
    "body",
    "fuel",
    "transmission",
    "year",
  ].filter((key) => filters[key] !== defaults[key]).length;
  useEffect(() => {
    if (!filtersOpen) return;
    const dialog = filterDialog.current;
    dialog.showModal();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
    };
  }, [filtersOpen]);
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
        matchesCarSearch(car, filters.q) &&
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
      <div
        className="collection-search"
        role="search"
        aria-label="Search the collection"
      >
        <label className="collection-search-field" htmlFor="car-search">
          <Icon name="search" size={20} />
          <input
            id="car-search"
            type="search"
            aria-label="Search our cars"
            aria-describedby="car-search-help"
            placeholder="Try BMW petrol or BMW M3 manual"
            value={filters.q}
            onChange={(event) => update("q", event.target.value)}
          />
        </label>
        <button
          className="collection-filter-button"
          type="button"
          aria-haspopup="dialog"
          aria-controls="car-filter-dialog"
          aria-expanded={filtersOpen}
          onClick={() => setFiltersOpen(true)}
        >
          <Icon name="settings" size={18} /> Filters
          {activeFilterCount > 0 && <span>{activeFilterCount}</span>}
        </button>
      </div>
      <div className="collection-search-summary">
        <p id="car-search-help">
          Search by make, model, fuel or transmission. Combine them to find your
          fit.
        </p>
        <span role="status">
          {filtered.length} {filtered.length === 1 ? "car" : "cars"} found
        </span>
      </div>
      <dialog
        ref={filterDialog}
        id="car-filter-dialog"
        className="collection-filter-dialog"
        aria-labelledby="car-filter-title"
        onClose={() => setFiltersOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) {
            const bounds = event.currentTarget.getBoundingClientRect();
            if (
              event.clientX < bounds.left ||
              event.clientX > bounds.right ||
              event.clientY < bounds.top ||
              event.clientY > bounds.bottom
            )
              setFiltersOpen(false);
          }
        }}
      >
        <div className="collection-filters">
          <div className="filter-heading">
            <div>
              <h2 id="car-filter-title">Filter the collection</h2>
              <p>Choose what matters to you.</p>
            </div>
            <button
              type="button"
              className="filter-reset"
              aria-label="Close filters"
              onClick={() => setFiltersOpen(false)}
            >
              <Icon name="close" size={20} />
            </button>
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
          <div className="filter-dialog-actions">
            <button type="button" className="filter-reset" onClick={reset}>
              Reset all
            </button>
            <button
              type="button"
              className="p-button"
              onClick={() => setFiltersOpen(false)}
            >
              Show {filtered.length} {filtered.length === 1 ? "car" : "cars"}
              <Icon name="arrow" size={18} />
            </button>
          </div>
        </div>
      </dialog>
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
                    <VehicleImage
                      sampleId={car.is_sample ? car.id : undefined}
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
                  {car.video && <Icon name="play" size={12} />}
                </span>
                <button
                  className="save-car"
                  onClick={() => toggleSaved(car.id)}
                  aria-label={`${saved.includes(car.id) ? "Unsave" : "Save"} ${car.name}`}
                  aria-pressed={saved.includes(car.id)}
                >
                  <Icon
                    name="heart"
                    size={19}
                    filled={saved.includes(car.id)}
                  />
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
                  <span>
                    <Icon name="gauge" size={14} />
                    {car.km} km
                  </span>
                  <span>
                    <Icon name="fuel" size={14} />
                    {car.fuel}
                  </span>
                  <span>
                    <Icon name="settings" size={14} />
                    {car.transmission}
                  </span>
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
                    <Icon name="northeast" size={18} />
                  </a>
                </div>
                <a className="stock-book" href={`/cars/${car.id}#test-drive`}>
                  {car.status === "available"
                    ? "View details & book a test drive"
                    : "View car details"}{" "}
                  <Icon name="arrow" size={17} />
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
                View all cars <Icon name="northeast" size={18} />
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
          Reset filters <Icon name="northeast" size={18} />
        </button>
      </div>
    </section>
  );
}
