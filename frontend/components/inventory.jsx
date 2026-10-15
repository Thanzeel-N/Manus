"use client";

import SiteImage from "./site-image";
import { useEffect, useState } from "react";
import { EnquiryButton } from "./enquiry";
import { siteMedia } from "../lib/site-media";

export const cars = [
  {
    id: "bmw",
    brand: "BMW",
    name: "BMW 3 Series",
    variant: "320d Luxury Line",
    year: 2021,
    km: "32,000",
    fuel: "Diesel",
    body: "Sedan",
    price: 32.5,
    image: siteMedia("assets/bmw.webp"),
  },
  {
    id: "mercedes",
    brand: "Mercedes-Benz",
    name: "Mercedes-Benz C-Class",
    variant: "C 220d Progressive",
    year: 2020,
    km: "41,000",
    fuel: "Diesel",
    body: "Sedan",
    price: 29.9,
    image: siteMedia("assets/mercedes.webp"),
  },
  {
    id: "audi",
    brand: "Audi",
    name: "Audi Q5",
    variant: "45 TFSI Premium Plus",
    year: 2022,
    km: "24,000",
    fuel: "Petrol",
    body: "SUV",
    price: 46.5,
    image: siteMedia("assets/audi.webp"),
  },
];

export default function Inventory() {
  const [make, setMake] = useState("all");
  const [budget, setBudget] = useState("all");
  const [body, setBody] = useState("all");
  const [category, setCategory] = useState("all");
  const [saved, setSaved] = useState([]);
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("manus-saved") || "[]");
      if (Array.isArray(stored))
        setSaved(stored.filter((id) => cars.some((car) => car.id === id)));
    } catch {
      /* Storage is optional. */
    }
  }, []);
  function toggleSaved(id) {
    const updated = saved.includes(id)
      ? saved.filter((value) => value !== id)
      : [...saved, id];
    setSaved(updated);
    try {
      localStorage.setItem("manus-saved", JSON.stringify(updated));
    } catch {
      /* Keep session state. */
    }
  }
  function reset() {
    setMake("all");
    setBudget("all");
    setBody("all");
    setCategory("all");
  }
  const filtered = cars.filter(
    (car) =>
      (make === "all" || car.brand === make) &&
      (budget === "all" || car.price < Number(budget)) &&
      (body === "all" || car.body === body) &&
      (category === "all" ||
        (category === "saved"
          ? saved.includes(car.id)
          : car.body === category)),
  );

  return (
    <section className="inventory section" id="inventory">
      <div className="section-top">
        <div>
          <div className="eyebrow">Explore our stock</div>
          <h2>Different cars. One showroom.</h2>
        </div>
        <p>
          Compare makes, budgets, and body styles.
          <br />
          Shortlist your favourites before your visit.
        </p>
      </div>
      <form
        className="filters"
        onSubmit={(event) => {
          event.preventDefault();
          document.getElementById("car-grid")?.scrollIntoView({
            behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
              .matches
              ? "instant"
              : "smooth",
            block: "center",
          });
        }}
      >
        <label>
          Make
          <select
            aria-label="Make"
            value={make}
            onChange={(event) => setMake(event.target.value)}
          >
            <option value="all">All brands</option>
            <option>BMW</option>
            <option>Mercedes-Benz</option>
            <option>Audi</option>
          </select>
        </label>
        <label>
          Budget
          <select
            aria-label="Budget"
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
          >
            <option value="all">Any budget</option>
            <option value="30">Under ₹30 lakh</option>
            <option value="40">Under ₹40 lakh</option>
            <option value="50">Under ₹50 lakh</option>
          </select>
        </label>
        <label>
          Body style
          <select
            aria-label="Body style"
            value={body}
            onChange={(event) => setBody(event.target.value)}
          >
            <option value="all">All body styles</option>
            <option>Sedan</option>
            <option>SUV</option>
          </select>
        </label>
        <button className="button dark" type="submit">
          Find my car <span>↗</span>
        </button>
      </form>
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
        <span className="sample-label">
          Sample collection · Illustrative photos
        </span>
      </div>
      <div id="car-grid" className="car-grid" aria-live="polite">
        {filtered.length ? (
          filtered.map((car) => (
            <article className="car-card" key={car.id}>
              <div className="car-image">
                <SiteImage
                  name={car.id}
                  alt={`${car.brand} car — illustrative photo`}
                  sizes="(max-width: 700px) 90vw, (max-width: 1000px) 44vw, 30vw"
                />
                <span className="car-badge">{car.body} · Sample listing</span>
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
                <h3>{car.name}</h3>
                <div className="car-specs">
                  <span>{car.km} km</span>
                  <span>{car.fuel}</span>
                  <span>Automatic</span>
                </div>
                <div className="car-bottom">
                  <div className="price">
                    ₹{car.price.toFixed(2)} lakh
                    <small>Illustrative price</small>
                  </div>
                  <EnquiryButton
                    title="Your next drive awaits."
                    car={car.name}
                    aria-label={`Enquire about ${car.name}`}
                  >
                    ↗
                  </EnquiryButton>
                </div>
              </div>
            </article>
          ))
        ) : (
          <div className="empty">
            <h3>No cars in this selection.</h3>
            <p>Try a different filter or save a car to see it here.</p>
            <button className="text-link" onClick={reset}>
              View all cars ↗
            </button>
          </div>
        )}
      </div>
      <div className="inventory-foot">
        <span>
          Showing {filtered.length} of {cars.length} sample cars
        </span>
        <button className="text-link" onClick={reset}>
          Reset filters <span>↗</span>
        </button>
      </div>
    </section>
  );
}
