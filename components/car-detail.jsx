"use client";

import BrandLogo from "./brand-logo";
import ThemeToggle from "./theme-toggle";
import Footer from "./footer";
import { useEffect, useState } from "react";

const dateKey = (value) =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(value));
const timeLabel = (value) =>
  new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function CarDetail({ car, preview }) {
  const [photo, setPhoto] = useState(0);
  const [slots, setSlots] = useState([]);
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [receipt, setReceipt] = useState(null);
  const [reload, setReload] = useState(0);
  const [email, setEmail] = useState("");
  const [verification, setVerification] = useState(null);
  const [code, setCode] = useState("");
  const [sendingCode, setSendingCode] = useState(false);
  const [verificationMessage, setVerificationMessage] = useState("");
  const [cooldown, setCooldown] = useState(0);
  useEffect(() => {
    if (!cooldown) return;
    const timer = setTimeout(
      () => setCooldown((value) => Math.max(0, value - 1)),
      1000,
    );
    return () => clearTimeout(timer);
  }, [cooldown]);
  async function sendCode(event) {
    if (!event.currentTarget.form.elements.email.reportValidity()) return;
    setSendingCode(true);
    setVerificationMessage("");
    try {
      const response = await fetch("/api/verification/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.detail || Object.values(data).flat().join(" "));
      setVerification(data.verification_id);
      setCode("");
      setCooldown(data.retry_after);
      setVerificationMessage(data.detail);
    } catch (err) {
      setVerificationMessage(
        err.message || "Unable to send a code. Please try again.",
      );
    } finally {
      setSendingCode(false);
    }
  }
  useEffect(() => {
    let active = true;
    if (preview || car.status !== "available") {
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch(`/api/cars/${car.id}/slots/`)
      .then(async (response) => {
        const data = await response.json();
        if (!response.ok)
          throw new Error(data.detail || "Unable to load availability.");
        if (active) {
          setSlots(data);
          setError("");
        }
      })
      .catch((err) => {
        if (active) setError(err.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [car.id, car.status, preview, reload]);
  const dates = [...new Set(slots.map((item) => dateKey(item.starts_at)))];
  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const form = new FormData(event.currentTarget);
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slot: Number(slot),
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          verification_id: verification,
          verification_code: code,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        if (response.status === 409) {
          setSlots((current) =>
            current.filter((item) => String(item.id) !== slot),
          );
          setSlot("");
        }
        throw new Error(
          data.detail ||
            Object.values(data).flat().join(" ") ||
            "Booking could not be saved.",
        );
      }
      setReceipt({
        ...data,
        starts_at: slots.find((item) => String(item.id) === slot)?.starts_at,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <>
      <header className="detail-nav">
        <a className="brand" href="/" aria-label="Manu’s Car World home"><BrandLogo /></a><ThemeToggle/>
        <a href="/cars">← Back to all cars</a>
      </header>
      <main className="detail-page">
        <div className="detail-heading">
          <div>
            <div className="eyebrow">
              {car.brand} · {car.condition} · {car.status}
            </div>
            <h1>{car.name}</h1>
            <p>
              {car.year} · {car.variant}
            </p>
          </div>
          <div className="detail-price">
            ₹{car.price.toFixed(2)} lakh
            <small>
              {car.is_sample
                ? "Illustrative price · Sample listing"
                : "Contact us for the final on-road price"}
            </small>
          </div>
        </div>
        <div className="detail-columns">
          <div>
            <div className="gallery-main">
              {car.images.length ? (
                <img
                  src={car.images[photo].url}
                  alt={
                    car.images[photo].caption ||
                    `${car.name} photo ${photo + 1}`
                  }
                />
              ) : (
                <p>Photos coming soon</p>
              )}
              <span>
                {car.images.length
                  ? `${photo + 1} / ${car.images.length}`
                  : "0 photos"}
              </span>
            </div>
            <div className="gallery-thumbs" aria-label="Car photos">
              {car.images.map((item, index) => (
                <button
                  key={item.url}
                  onClick={() => setPhoto(index)}
                  aria-label={`View photo ${index + 1}`}
                  aria-pressed={photo === index}
                >
                  <img
                    src={item.url}
                    alt={item.caption || `Photo ${index + 1}`}
                  />
                </button>
              ))}
            </div>
            {car.video && (
              <section className="detail-block">
                <div className="eyebrow">A closer look</div>
                <h2>Watch the walkaround</h2>
                <video
                  controls
                  playsInline
                  preload="metadata"
                  src={car.video}
                  aria-label={`${car.name} walkaround video`}
                />
                <p>Short video provided by the showroom.</p>
              </section>
            )}
            <section className="detail-block">
              <h2>Get to know this car.</h2>
              <dl className="spec-grid">
                {[
                  ["Year", car.year],
                  ["Mileage", `${car.km} km`],
                  ["Fuel", car.fuel],
                  ["Transmission", car.transmission],
                  ["Body style", car.body],
                  ["Condition", car.condition],
                ].map(([key, value]) => (
                  <div key={key}>
                    <dt>{key}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
              <p>{car.description}</p>
              {car.features.length > 0 && (
                <ul className="feature-list">
                  {car.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
            </section>
          </div>
          <aside className="booking-panel" id="test-drive">
            <div className="eyebrow">Experience it yourself</div>
            <h2>Book a test drive.</h2>
            <p>
              Pick a day and a time that suit you. Our team will confirm your
              visit.
            </p>
            {receipt ? (
              <div role="status" className="booking-success">
                <h3>Request received.</h3>
                <p>
                  {car.name}
                  <br />
                  {new Date(receipt.starts_at).toLocaleString("en-IN", {
                    timeZone: "Asia/Kolkata",
                  })}{" "}
                  IST
                </p>
                <p>
                  Reference: <strong>{receipt.reference}</strong>
                </p>
                <p>
                  Your booking is pending staff confirmation. Please wait for
                  the showroom to contact you before visiting.
                </p>
              </div>
            ) : preview ? (
              <p className="booking-note">
                Preview mode. Connect the Django backend to see available dates
                and send real booking requests.
              </p>
            ) : car.status !== "available" ? (
              <p className="booking-note">
                This car is {car.status}. Test drives are currently unavailable.
              </p>
            ) : (
              <>
                {loading ? (
                  <p role="status">Checking available times…</p>
                ) : (
                  <form onSubmit={submit} className="booking-form">
                    {slots.length > 0 ? (
                      <>
                        <label>
                          Choose a date
                          <input
                            type="date"
                            required
                            min={dates[0]}
                            max={dates[dates.length - 1]}
                            value={date}
                            onChange={(event) => {
                              setDate(event.target.value);
                              setSlot("");
                            }}
                          />
                        </label>
                        <fieldset>
                          <legend>Available times · IST</legend>
                          <div className="time-slots">
                            {slots
                              .filter(
                                (item) => dateKey(item.starts_at) === date,
                              )
                              .map((item) => (
                                <label
                                  key={item.id}
                                  className={
                                    slot === String(item.id) ? "chosen" : ""
                                  }
                                >
                                  <input
                                    type="radio"
                                    name="time"
                                    value={item.id}
                                    checked={slot === String(item.id)}
                                    onChange={(event) =>
                                      setSlot(event.target.value)
                                    }
                                    required
                                  />
                                  {timeLabel(item.starts_at)}
                                </label>
                              ))}
                          </div>
                          {!date ? (
                            <p>Select a date to see available times.</p>
                          ) : (
                            !dates.includes(date) && (
                              <p>
                                No test drives on this date. Please choose
                                another day.
                              </p>
                            )
                          )}
                        </fieldset>
                        <label>
                          Your name
                          <input
                            name="name"
                            autoComplete="name"
                            required
                            maxLength={100}
                          />
                        </label>
                        <label>
                          Email
                          <input
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            disabled={sendingCode || busy}
                            onChange={(event) => {
                              setEmail(event.target.value);
                              setVerification(null);
                              setCode("");
                              setVerificationMessage("");
                            }}
                          />
                        </label>
                        <div className="email-verification">
                          <p>
                            Verify your email to request a test drive. We’ll
                            send a six-digit code, valid for 10 minutes.
                          </p>
                          <button
                            type="button"
                            className="verification-send"
                            onClick={sendCode}
                            disabled={
                              sendingCode || busy || cooldown > 0 || !email
                            }
                          >
                            {sendingCode
                              ? "Sending code…"
                              : cooldown
                                ? `Resend in ${cooldown}s`
                                : verification
                                  ? "Resend verification code"
                                  : "Send verification code"}
                          </button>
                          {verificationMessage && (
                            <p role="status">{verificationMessage}</p>
                          )}
                          {verification && (
                            <label>
                              Verification code
                              <input
                                name="verification_code"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                pattern="[0-9]{6}"
                                maxLength={6}
                                required
                                value={code}
                                onChange={(event) =>
                                  setCode(event.target.value.replace(/\D/g, ""))
                                }
                                placeholder="6-digit code"
                              />
                            </label>
                          )}
                        </div>
                        <label>
                          Phone number
                          <input
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            pattern="[+0-9 ()-]{7,20}"
                            required
                            maxLength={20}
                          />
                        </label>
                        <p className="booking-privacy">
                          We use these details to arrange your test drive.
                        </p>
                        <button
                          className="button light"
                          disabled={
                            busy || !slot || !verification || code.length !== 6
                          }
                        >
                          {busy
                            ? "Verifying and sending…"
                            : "Verify email & request test drive ↗"}
                        </button>
                      </>
                    ) : (
                      !error && (
                        <p>
                          No slots are available yet. Please check back shortly.
                        </p>
                      )
                    )}
                  </form>
                )}
                {error && (
                  <div role="alert">
                    <p>{error}</p>
                    <button
                      className="text-link"
                      onClick={() => setReload((value) => value + 1)}
                    >
                      Refresh availability ↻
                    </button>
                  </div>
                )}
              </>
            )}
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
