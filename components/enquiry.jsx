"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";

const EnquiryContext = createContext(null);

export function EnquiryButton({
  title = "Book a test drive",
  car,
  children,
  ...props
}) {
  const open = useContext(EnquiryContext);
  return (
    <button {...props} onClick={() => open(title, car)}>
      {children}
    </button>
  );
}

export function EnquiryProvider({ children }) {
  const dialog = useRef(null);
  const closeTimer = useRef(null);
  useEffect(() => () => clearTimeout(closeTimer.current), []);
  const [title, setTitle] = useState("Book a test drive");
  const [car, setCar] = useState("Help me choose");
  const [status, setStatus] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [minDate, setMinDate] = useState("");
  function open(nextTitle, nextCar) {
    clearTimeout(closeTimer.current);
    dialog.current.removeAttribute("data-closing");
    setTitle(nextTitle);
    setCar(nextCar || "Help me choose");
    setStatus("");
    setSent(false);
    const today = new Date();
    setMinDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    );
    dialog.current.showModal();
  }
  function close() {
    if (!dialog.current.open || dialog.current.hasAttribute("data-closing"))
      return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.current.close();
      return;
    }
    dialog.current.setAttribute("data-closing", "true");
    closeTimer.current = setTimeout(() => {
      dialog.current?.close();
      dialog.current?.removeAttribute("data-closing");
    }, 220);
  }
  async function submitEnquiry(event) {
    event.preventDefault();
    if (sending || sent) return;
    const data = new FormData(event.currentTarget);
    setSending(true);
    setStatus("");
    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.get("name"), phone: data.get("phone"),
          email: data.get("email") || "", interest: car,
          date: data.get("date") || null, message: data.get("message") || "",
        }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || Object.entries(result).map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(" ") : value}`).join(" ") || "Unable to send your enquiry.");
      setSent(true);
      setStatus(`Thank you. Your enquiry #${result.reference} has been sent to our team. We will contact you to arrange the next step.`);
    } catch (error) {
      setStatus(error.message || "Unable to send your enquiry. Please try again.");
    } finally {
      setSending(false);
    }
  }
  return (
    <EnquiryContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
        onClick={(event) => {
          if (event.target !== dialog.current) return;
          const rect = dialog.current.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            close();
        }}
      >
        <button
          className="close-dialog"
          aria-label="Close enquiry"
          onClick={close}
        >
          ×
        </button>
        <div className="eyebrow">LET’S TALK CARS</div>
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-description">
          Send your enquiry to our showroom team. We will get in touch to help.
        </p>
        <form id="enquiry-form" onSubmit={submitEnquiry}>
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              maxLength={100}
              required
              placeholder="Full name"
            />
          </label>
          <label>
            Phone number
            <input
              name="phone"
              type="tel"
              autoComplete="tel"
              minLength={7}
              maxLength={20}
              required
              placeholder="Your contact number"
            />
          </label>
          <label>
            Email (optional)
            <input name="email" type="email" autoComplete="email" maxLength={254} placeholder="you@example.com" />
          </label>
          <label>
            Interested in
            <select
              aria-label="Interested in"
              value={car}
              onChange={(event) => setCar(event.target.value)}
            >
              <option>Help me choose</option>
              <option>Visiting the showroom</option>
              <option>BMW 3 Series</option>
              <option>Mercedes-Benz C-Class</option>
              <option>Audi Q5</option>
              <option>Selling or exchanging my car</option>
            </select>
          </label>
          <label>
            Preferred visit or callback date
            <input name="date" type="date" min={minDate} />
          </label>
          <label>
            Anything else?
            <textarea
              name="message"
              rows={3}
              maxLength={5000}
              placeholder="Tell us what you’re looking for"
            />
          </label>
          <button className="button light" type="submit" disabled={sending || sent}>
            {sending ? "Sending…" : sent ? "Enquiry sent ✓" : "Send enquiry"} <span>→</span>
          </button>
          <p className="form-note">
            Your details will be shared with our showroom team for follow-up.
            A visit or test drive is confirmed separately.
          </p>
          <p id="form-status" role="status">
            {status}
          </p>
        </form>
      </dialog>
    </EnquiryContext.Provider>
  );
}
