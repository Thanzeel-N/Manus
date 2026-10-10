"use client";

import { useMemo, useState } from "react";
import { EnquiryButton } from "./enquiry";

const brands = [
  { name: "BMW", baseFactor: 34 },
  { name: "Mercedes-Benz", baseFactor: 36 },
  { name: "Audi", baseFactor: 32 },
  { name: "Volkswagen", baseFactor: 14 },
  { name: "Toyota", baseFactor: 18 },
  { name: "Honda", baseFactor: 12 },
  { name: "Hyundai", baseFactor: 11 },
  { name: "Kia", baseFactor: 13 },
  { name: "Skoda", baseFactor: 15 },
  { name: "Tata", baseFactor: 10 },
  { name: "Mahindra", baseFactor: 12 },
  { name: "Other Brand", baseFactor: 10 },
];

const years = [2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015];

const mileageRanges = [
  { label: "Under 20,000 km", multiplier: 1.08 },
  { label: "20,000 – 40,000 km", multiplier: 1.0 },
  { label: "40,000 – 70,000 km", multiplier: 0.92 },
  { label: "70,000 – 100,000 km", multiplier: 0.82 },
  { label: "Above 100,000 km", multiplier: 0.72 },
];

const conditions = [
  { label: "Excellent (Showroom condition, full service history)", multiplier: 1.05 },
  { label: "Very Good (Minor normal wear, regular servicing)", multiplier: 1.0 },
  { label: "Good (Moderate wear, drives well)", multiplier: 0.92 },
  { label: "Fair (Needs cosmetic touch-up or minor servicing)", multiplier: 0.84 },
];

export default function ValuationCalculator() {
  const [brand, setBrand] = useState("BMW");
  const [model, setModel] = useState("");
  const [year, setYear] = useState(2021);
  const [mileageIdx, setMileageIdx] = useState(1);
  const [conditionIdx, setConditionIdx] = useState(1);
  const [fuel, setFuel] = useState("Diesel");
  const [transmission, setTransmission] = useState("Automatic");

  const calculation = useMemo(() => {
    const selectedBrand = brands.find((b) => b.name === brand) || brands[0];
    const age = Math.max(0, 2026 - Number(year));
    // Depreciation curve
    const ageFactor = Math.pow(0.88, age);
    const mileageFactor = mileageRanges[mileageIdx].multiplier;
    const condFactor = conditions[conditionIdx].multiplier;
    const transFactor = transmission === "Automatic" ? 1.05 : 0.95;
    const fuelFactor = fuel === "Electric" || fuel === "Hybrid" ? 1.06 : 1.0;

    const baseVal = selectedBrand.baseFactor * ageFactor * mileageFactor * condFactor * transFactor * fuelFactor;
    const low = Math.max(2.5, baseVal * 0.94);
    const high = Math.max(3.0, baseVal * 1.06);

    return {
      low: low.toFixed(2),
      high: high.toFixed(2),
      exchangeBonus: "₹35,000",
    };
  }, [brand, year, mileageIdx, conditionIdx, fuel, transmission]);

  const enquiryTitle = `Exchange Valuation for ${year} ${brand} ${model || ""}`.trim();

  return (
    <div className="valuation-card" id="valuation">
      <div className="valuation-header">
        <div className="eyebrow">Instant Car Valuation</div>
        <h2>Estimate your vehicle’s exchange value.</h2>
        <p>
          Select your car details below to see an instant estimate based on current
          dealership market trends in Bengaluru.
        </p>
      </div>

      <div className="valuation-form-grid">
        <label className="val-field">
          <span>Make / Brand</span>
          <select value={brand} onChange={(e) => setBrand(e.target.value)}>
            {brands.map((b) => (
              <option key={b.name} value={b.name}>
                {b.name}
              </option>
            ))}
          </select>
        </label>

        <label className="val-field">
          <span>Model / Variant (Optional)</span>
          <input
            type="text"
            placeholder="e.g. 320d Luxury Line, C 200, Fortuner"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        </label>

        <label className="val-field">
          <span>Year of Registration</span>
          <select value={year} onChange={(e) => setYear(Number(e.target.value))}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>

        <label className="val-field">
          <span>Fuel Type</span>
          <select value={fuel} onChange={(e) => setFuel(e.target.value)}>
            <option value="Petrol">Petrol</option>
            <option value="Diesel">Diesel</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Electric">Electric</option>
            <option value="CNG">CNG</option>
          </select>
        </label>

        <label className="val-field">
          <span>Transmission</span>
          <select
            value={transmission}
            onChange={(e) => setTransmission(e.target.value)}
          >
            <option value="Automatic">Automatic</option>
            <option value="Manual">Manual</option>
          </select>
        </label>

        <label className="val-field">
          <span>Kilometers Driven</span>
          <select
            value={mileageIdx}
            onChange={(e) => setMileageIdx(Number(e.target.value))}
          >
            {mileageRanges.map((m, i) => (
              <option key={m.label} value={i}>
                {m.label}
              </option>
            ))}
          </select>
        </label>

        <label className="val-field val-field-full">
          <span>Vehicle Condition</span>
          <select
            value={conditionIdx}
            onChange={(e) => setConditionIdx(Number(e.target.value))}
          >
            {conditions.map((c, i) => (
              <option key={c.label} value={i}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="valuation-result-box">
        <div className="result-left">
          <span className="result-label">ESTIMATED EXCHANGE VALUE RANGE</span>
          <div className="result-price">
            ₹{calculation.low} L – ₹{calculation.high} L
          </div>
          <span className="result-note">
            Includes special Manu’s Exchange Loyalty Bonus of {calculation.exchangeBonus}
          </span>
        </div>

        <div className="result-cta">
          <EnquiryButton
            className="button light"
            title={enquiryTitle}
            car={`Exchange Valuation: ${year} ${brand} ${model || ""}`.trim()}
          >
            Lock in this valuation <span>→</span>
          </EnquiryButton>
          <small className="result-disclaimer">
            Final valuation confirmed after a quick 20-minute physical inspection at our showroom.
          </small>
        </div>
      </div>
    </div>
  );
}
