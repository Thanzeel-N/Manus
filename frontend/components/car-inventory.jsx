"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { matchesCarSearch } from "../lib/car-search";
import Icon from "./icon";
import VehicleImage from "./vehicle-image";

const BODY_VALUES = ["Sedan", "SUV", "Hatchback", "Coupe", "MPV"];

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

function matchesBudget(price, budget) {
  if (budget === "all") return true;
  if (budget === "25-50") return price >= 25 && price <= 50;
  if (budget === "50-plus") return price > 50;
  const ceiling = Number(budget);
  return Number.isFinite(ceiling) ? price < ceiling : true;
}

function CarCardMedia({ car, active }) {
  const videoRef = useRef(null);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const photos = useMemo(() => {
    const items = (car.images || []).filter((item) => item?.url);
    if (car.image && !items.some((item) => item.url === car.image)) {
      items.unshift({ url: car.image, caption: "" });
    }
    return items;
  }, [car.image, car.images]);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!active) {
      setPhotoIndex(0);
      setVideoPlaying(false);
      if (video) {
        video.pause();
        video.currentTime = 0;
      }
      return;
    }

    if (car.video && !videoFailed && !reducedMotion) {
      video?.play().catch(() => {});
      return () => {
        if (video) {
          video.pause();
          video.currentTime = 0;
        }
      };
    }

    if (photos.length < 2) return;
    setPhotoIndex(1);
    if (reducedMotion) return;
    const timer = window.setInterval(
      () => setPhotoIndex((index) => (index + 1) % photos.length),
      2200,
    );
    return () => window.clearInterval(timer);
  }, [active, car.video, photos, reducedMotion, videoFailed]);

  const photo = photos[photoIndex] || photos[0];
  return (
    <div className="car-media-preview">
      {photo ? (
        <VehicleImage
          key={photo.url}
          sampleId={car.is_sample ? car.id : undefined}
          src={photo.url}
          alt={photo.caption || `${car.name} — photo ${photoIndex + 1}`}
          loading="lazy"
        />
      ) : (
        <span className="photo-placeholder">Photos coming soon</span>
      )}
      {car.video && !videoFailed && !reducedMotion && (
        <video
          ref={videoRef}
          className={active && videoPlaying ? "is-active" : ""}
          src={car.video}
          muted
          loop
          playsInline
          preload="metadata"
          aria-label={`${car.name} video preview`}
          onPlaying={() => setVideoPlaying(true)}
          onError={() => setVideoFailed(true)}
        />
      )}
      {!car.video && photos.length > 1 && (
        <span className="car-media-count" aria-hidden="true">
          {photoIndex + 1} / {photos.length}
        </span>
      )}
    </div>
  );
}

function CarCard({ car, saved, onToggleSaved }) {
  const router = useRouter();
  const [previewActive, setPreviewActive] = useState(false);
  const detailHref = `/cars/${car.id}`;

  function openCard(event) {
    if (event.defaultPrevented || event.target.closest("a, button")) return;
    router.push(detailHref);
  }

  return (
    <article
      className="car-card"
      role="link"
      tabIndex={0}
      aria-label={`View ${car.name} details`}
      onClick={openCard}
      onKeyDown={(event) => {
        if (
          event.target === event.currentTarget &&
          (event.key === "Enter" || event.key === " ")
        ) {
          event.preventDefault();
          router.push(detailHref);
        }
      }}
      onMouseEnter={() => setPreviewActive(true)}
      onMouseLeave={() => setPreviewActive(false)}
      onFocusCapture={() => setPreviewActive(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPreviewActive(false);
        }
      }}
    >
      <div className="car-image">
        <CarCardMedia car={car} active={previewActive} />
        <span className="car-badge">
          {car.status !== "available" ? car.status : car.body}
          {car.video && <Icon name="play" size={12} />}
        </span>
        <button
          type="button"
          className="save-car"
          onClick={(event) => {
            event.stopPropagation();
            onToggleSaved(car.id);
          }}
          aria-label={`${saved ? "Unsave" : "Save"} ${car.name}`}
          aria-pressed={saved}
        >
          <Icon name="heart" size={19} filled={saved} />
        </button>
      </div>
      <div className="car-content">
        <div className="car-meta">
          {car.year} · {car.variant}
        </div>
        <h3>{car.name}</h3>
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
          <span className="car-detail-link" aria-hidden="true">
            <Icon name="northeast" size={18} />
          </span>
        </div>
        <a className="stock-book" href={`${detailHref}#test-drive`}>
          {car.status === "available"
            ? "View details & book a test drive"
            : "View car details"}{" "}
          <Icon name="arrow" size={17} />
        </a>
      </div>
    </article>
  );
}

export function HomeCarGrid({ cars }) {
  const [saved, setSaved] = useState([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("manus-saved") || "[]");
      if (Array.isArray(stored)) setSaved(stored);
    } catch {}
  }, []);

  function toggleSaved(id) {
    const next = saved.includes(id)
      ? saved.filter((value) => value !== id)
      : [...saved, id];
    setSaved(next);
    try {
      localStorage.setItem("manus-saved", JSON.stringify(next));
    } catch {}
  }

  return (
    <div className="car-grid p-home-car-grid">
      {cars.map((car) => (
        <CarCard
          key={car.id}
          car={car}
          saved={saved.includes(car.id)}
          onToggleSaved={toggleSaved}
        />
      ))}
    </div>
  );
}

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
          key === "body"
            ? BODY_VALUES.includes(query.get(key))
              ? query.get(key)
              : value
            : query.get(key) || value,
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
        matchesBudget(car.price, filters.budget) &&
        (filters.body === "all" || car.body === filters.body) &&
        (filters.fuel === "all" || car.fuel === filters.fuel) &&
        (filters.transmission === "all" ||
          car.transmission === filters.transmission) &&
        (filters.year === "all" || car.year >= Number(filters.year)) &&
        (category === "all" || saved.includes(car.id)),
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
                <option value="25">Under ₹25 lakh</option>
                <option value="25-50">₹25–₹50 lakh</option>
                <option value="50-plus">Above ₹50 lakh</option>
              </select>
            </label>
            {select("body", "Body style", BODY_VALUES, "All body styles")}
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
            ["saved", `Saved ${saved.length}`],
          ].map(([value, label]) => (
            <button
              type="button"
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
            <CarCard
              key={car.id}
              car={car}
              saved={saved.includes(car.id)}
              onToggleSaved={toggleSaved}
            />
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
                Reset filters <Icon name="northeast" size={18} />
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
