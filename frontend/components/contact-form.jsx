"use client";
import { useEffect, useState } from "react";
import Icon from "./icon";
import { submitEnquiry } from "../lib/enquiries";

export default function ContactForm({
  interest = "Help me choose",
  title = "How can we help?",
  button = "Send enquiry",
  vehicle = false,
  requireMessage = false,
}) {
  const [busy, setBusy] = useState(false),
    [sent, setSent] = useState(false),
    [feedback, setFeedback] = useState(""),
    [minDate, setMinDate] = useState("");

  useEffect(() => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    setMinDate(`${year}-${month}-${day}`);
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (busy || sent) return;
    const fields = new FormData(event.currentTarget);
    setBusy(true);
    setFeedback("");
    try {
      const result = await submitEnquiry({
        name: fields.get("name"),
        phone: fields.get("phone"),
        email: fields.get("email") || "",
        interest: fields.get("interest") || interest,
        date: fields.get("date") || null,
        message: fields.get("message") || "",
      });
      setSent(true);
      setFeedback(
        `Thank you. Enquiry #${result.reference} has reached our team. We’ll contact you about the next step.`,
      );
    } catch (error) {
      setFeedback(
        error.message || "We couldn’t send your enquiry. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="p-contact-form" onSubmit={submit} aria-busy={busy}>
      <div className="p-form-heading">
        <span>
          <Icon name={vehicle ? "exchange" : "mail"} size={22} />
        </span>
        <div>
          <p className="p-eyebrow">A PERSONAL CONVERSATION</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="p-field-grid">
        <label>
          Your name
          <input
            name="name"
            autoComplete="name"
            required
            maxLength={100}
            placeholder="Full name"
          />
        </label>
        <label>
          Phone number
          <input
            name="phone"
            autoComplete="tel"
            type="tel"
            required
            minLength={7}
            maxLength={20}
            pattern={"(?:\\+)?[0-9 \\(\\)\\-]{7,20}"}
            inputMode="tel"
            placeholder="Your contact number"
          />
        </label>
        <label className="p-field-wide">
          Email <span>(optional)</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            maxLength={254}
            placeholder="you@example.com"
          />
        </label>
        <label className="p-field-wide">
          I’m interested in
          <select name="interest" defaultValue={interest}>
            <option>General enquiry</option>
            <option>Help me choose</option>
            <option>Buying a car</option>
            <option>Selling or exchanging my car</option>
            <option>Visiting the showroom</option>
            <option>Changing a test-drive request</option>
          </select>
        </label>
        <label className="p-field-wide">
          Preferred callback or visit date <span>(optional)</span>
          <input name="date" type="date" min={minDate} />
        </label>
        <label className="p-field-wide">
          {vehicle ? "Tell us about your car" : "Your message"}
          <textarea
            name="message"
            rows={4}
            maxLength={5000}
            required={vehicle || requireMessage}
            placeholder={
              vehicle
                ? "Make, model, year, mileage and anything else we should know…"
                : "A car you like, a question you have, or what you’re looking for…"
            }
          />
        </label>
      </div>
      <button className="p-button" type="submit" disabled={busy || sent}>
        {busy ? "Sending your enquiry…" : sent ? "Enquiry received" : button}
        <Icon name={sent ? "check" : "northeast"} size={18} />
      </button>
      <p className="p-form-privacy">
        Your details are shared with the showroom team for this enquiry.
        Appointments and vehicle availability are confirmed separately.
      </p>
      <div aria-live="polite" aria-atomic="true">
        {feedback && (
          <p
            className={`p-form-feedback ${sent ? "is-success" : ""}`}
            role={sent ? "status" : "alert"}
          >
            {feedback}
          </p>
        )}
      </div>
    </form>
  );
}
