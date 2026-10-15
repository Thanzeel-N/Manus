"use client";

import { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import Icon from "./icon";
import SiteImage from "./site-image";
import { submitEnquiry } from "../lib/enquiries";

const ContactModalContext = createContext(null);

export function useContactModal() {
  const context = useContext(ContactModalContext);
  if (!context) {
    return {
      openContactModal: () => {},
      closeContactModal: () => {},
      isOpen: false,
    };
  }
  return context;
}

export function ContactButton({
  children,
  className = "p-button",
  title = "Plan your showroom visit",
  interest = "Visiting the showroom",
  car = "",
  ...props
}) {
  const { openContactModal } = useContactModal();
  return (
    <button
      type="button"
      className={className}
      onClick={(e) => {
        e.preventDefault();
        openContactModal({ title, interest, car });
      }}
      {...props}
    >
      {children}
    </button>
  );
}

export function ContactModalProvider({ children }) {
  const dialogRef = useRef(null);
  const lastActiveElementRef = useRef(null);
  const closeTimerRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Plan your showroom visit");
  const [activeInterest, setActiveInterest] = useState("Visiting the showroom");
  const [selectedCar, setSelectedCar] = useState("");
  const [preferredSlot, setPreferredSlot] = useState("afternoon");

  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [minDate, setMinDate] = useState("");

  // Determine min date on mount
  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setMinDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  const openContactModal = useCallback(({
    title = "Plan your showroom visit",
    interest = "Visiting the showroom",
    car = "",
  } = {}) => {
    if (typeof document === "undefined") return;
    lastActiveElementRef.current = document.activeElement;
    clearTimeout(closeTimerRef.current);

    setModalTitle(title);
    setActiveInterest(interest);
    setSelectedCar(car);
    setSent(false);
    setFeedback("");
    setBusy(false);
    setIsOpen(true);

    const dialog = dialogRef.current;
    if (dialog) {
      dialog.removeAttribute("data-closing");
      if (!dialog.open) {
        try {
          dialog.showModal();
        } catch {
          // Fallback if showModal fails
        }
      }
    }
  }, []);

  const closeContactModal = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || !dialog.open || dialog.hasAttribute("data-closing")) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      dialog.close();
      setIsOpen(false);
      if (lastActiveElementRef.current?.focus) {
        lastActiveElementRef.current.focus();
      }
      return;
    }

    dialog.setAttribute("data-closing", "true");
    closeTimerRef.current = setTimeout(() => {
      if (dialogRef.current) {
        dialogRef.current.close();
        dialogRef.current.removeAttribute("data-closing");
      }
      setIsOpen(false);
      if (lastActiveElementRef.current?.focus) {
        lastActiveElementRef.current.focus();
      }
    }, 200);
  }, []);

  // Universal click interceptor: intercept any clicks on contact-related links or hash triggers
  useEffect(() => {
    function handleGlobalClick(e) {
      const target = e.target;
      if (!target) return;

      const anchor = target.closest("a");
      const button = target.closest("button");

      if (button?.dataset?.contactTrigger) {
        e.preventDefault();
        openContactModal({
          title: button.dataset.title || "Plan your showroom visit",
          interest: button.dataset.interest || "Visiting the showroom",
          car: button.dataset.car || "",
        });
        return;
      }

      if (anchor) {
        const href = anchor.getAttribute("href") || "";
        if (
          href === "#contact" ||
          href === "/visit#contact" ||
          href === "#plan-visit" ||
          anchor.dataset.contactTrigger
        ) {
          e.preventDefault();
          const interest =
            anchor.dataset.interest ||
            (href === "#plan-visit" ? "Visiting the showroom" : "Visiting the showroom");
          const title = anchor.dataset.title || "Plan your showroom visit";
          openContactModal({ title, interest, car: anchor.dataset.car || "" });
        }
      }
    }

    if (typeof window !== "undefined") {
      if (window.location.hash === "#contact") {
        openContactModal({
          title: "Plan your showroom visit",
          interest: "Visiting the showroom",
        });
      }
      window.addEventListener("click", handleGlobalClick);
      return () => window.removeEventListener("click", handleGlobalClick);
    }
  }, [openContactModal]);

  // Handle submit enquiry
  async function submit(event) {
    event.preventDefault();
    if (busy || sent) return;
    const form = event.currentTarget;
    const fields = new FormData(form);

    setBusy(true);
    setFeedback("");

    const name = fields.get("name");
    const phone = fields.get("phone");
    const email = fields.get("email") || "";
    const interest = fields.get("interest") || activeInterest;
    const date = fields.get("date") || null;
    const slot = fields.get("time_slot") || preferredSlot;
    const rawMessage = fields.get("message") || "";
    const context = [
      selectedCar ? `[Vehicle: ${selectedCar}]` : "",
      slot ? `[Preferred Slot: ${slot}]` : "",
    ].filter(Boolean).join(" ");
    const message = `${context} ${rawMessage}`.trim();

    try {
      const result = await submitEnquiry({ name, phone, email, interest, date, message });
      setSent(true);
      setFeedback(
        `Thank you, ${name}. Your enquiry #${result.reference} has been received. Our showroom concierge will contact you shortly to confirm.`
      );
    } catch (err) {
      setFeedback(err.message || "We couldn’t send your enquiry. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <ContactModalContext.Provider
      value={{
        openContactModal,
        closeContactModal,
        isOpen,
      }}
    >
      {children}

      <dialog
        ref={dialogRef}
        id="contact-popup-dialog"
        className="public-site p-contact-modal-dialog"
        aria-labelledby="contact-modal-title"
        aria-describedby="contact-modal-desc"
        onCancel={(e) => {
          e.preventDefault();
          closeContactModal();
        }}
        onClick={(e) => {
          if (e.target !== dialogRef.current) return;
          const rect = dialogRef.current.getBoundingClientRect();
          if (
            e.clientX < rect.left ||
            e.clientX > rect.right ||
            e.clientY < rect.top ||
            e.clientY > rect.bottom
          ) {
            closeContactModal();
          }
        }}
      >
        <button
          type="button"
          className="close-dialog p-modal-close"
          aria-label="Close enquiry"
          onClick={closeContactModal}
        >
          <Icon name="close" size={20} />
        </button>

        <div className="p-modal-split-layout">
          {/* Left Column: Car visual */}
          <div className="p-modal-media-col">
            <SiteImage
              name="contactCar"
              alt="Manu’s Car World Luxury Vehicle"
              className="p-modal-media-img"
              sizes="(max-width: 760px) 100vw, 42vw"
            />
            <div className="p-modal-media-overlay">
              <span className="p-modal-media-badge">MANU’S CAR WORLD</span>
              <p className="p-modal-media-tagline">Certified Pre-Owned Luxury</p>
            </div>
          </div>

          {/* Right Column: Original Form */}
          <form className="p-contact-form" onSubmit={submit}>
            <div className="p-form-heading">
              <span>
                <Icon name="mail" size={22} />
              </span>
              <div>
                <p className="p-eyebrow">A PERSONAL CONVERSATION</p>
                <h2 id="contact-modal-title">{modalTitle}</h2>
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
                <select
                  name="interest"
                  value={activeInterest}
                  onChange={(e) => setActiveInterest(e.target.value)}
                >
                  <option value="Visiting the showroom">Visiting the showroom</option>
                  <option value="Book a test drive">Book a test drive</option>
                  <option value="Buying a car">Buying a car</option>
                  <option value="Help me choose">Help me choose</option>
                  <option value="Selling or exchanging my car">Selling or exchanging my car</option>
                  <option value="Changing a test-drive request">Changing a test-drive request</option>
                </select>
              </label>

              <label className="p-field-wide">
                Preferred callback or visit date <span>(optional)</span>
                <input name="date" type="date" min={minDate} />
              </label>

              <label className="p-field-wide">
                Your message
                <textarea
                  name="message"
                  rows={4}
                  maxLength={5000}
                  placeholder="A car you like, a question you have, or what you’re looking for…"
                />
              </label>
            </div>

            <button className="p-button" type="submit" disabled={busy || sent}>
              {busy ? "Sending your enquiry…" : sent ? "Enquiry received" : "Send my enquiry"}
              <Icon name={sent ? "check" : "northeast"} size={18} />
            </button>

            <p className="p-form-privacy">
              Your details are shared with the showroom team for this enquiry.
              Appointments and vehicle availability are confirmed separately.
            </p>

            {feedback && (
              <p
                className={`p-form-feedback ${sent ? "is-success" : ""}`}
                role={sent ? "status" : "alert"}
              >
                {feedback}
              </p>
            )}
          </form>
        </div>
      </dialog>
    </ContactModalContext.Provider>
  );
}
