"use client";

import { createContext, useContext, useRef, useState } from "react";

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

export function EnquiryProvider({ children, email = "" }) {
  const dialog = useRef(null);
  const [title, setTitle] = useState("Book a test drive");
  const [car, setCar] = useState("Help me choose");
  const [status, setStatus] = useState("");
  const [minDate, setMinDate] = useState("");
  function open(nextTitle, nextCar) {
    setTitle(nextTitle);
    setCar(nextCar || "Help me choose");
    setStatus("");
    dialog.current.querySelector("form")?.reset();
    const today = new Date();
    setMinDate(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`,
    );
    dialog.current.showModal();
  }
  function download(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (email && event.nativeEvent.submitter?.value === "email") {
      const body = `Name: ${data.get("name").trim()}\nPhone: ${data.get("phone").trim()}\nInterest: ${car}\nPreferred date: ${data.get("date") || "To be arranged"}\nMessage: ${data.get("message").trim() || "None"}`;
      window.location.href = `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(`Car enquiry: ${car}`)}&body=${encodeURIComponent(body)}`;
      setStatus(
        "Your email app should open with a draft. Send it there to contact us. If it does not open, download your enquiry and email it to " +
          email +
          ". No booking is confirmed.",
      );
      return;
    }
    const text = `Manu’s Car World — Enquiry draft\n\nName: ${data.get("name")}\nPhone: ${data.get("phone")}\nInterest: ${car}\nPreferred date: ${data.get("date") || "To be arranged"}\nMessage: ${data.get("message") || "None"}\n\nThis is a local draft. It has not been sent and does not confirm a booking.`;
    const url = URL.createObjectURL(
      new Blob([text], { type: "text/plain;charset=utf-8" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "manus-car-world-enquiry.txt";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    setStatus(
      "Your enquiry draft has been downloaded. No booking has been made.",
    );
  }
  return (
    <EnquiryContext.Provider value={open}>
      {children}
      <dialog
        ref={dialog}
        aria-labelledby="dialog-title"
        aria-describedby="dialog-description"
        onClick={(event) => {
          if (event.target !== dialog.current) return;
          const rect = dialog.current.getBoundingClientRect();
          if (
            event.clientX < rect.left ||
            event.clientX > rect.right ||
            event.clientY < rect.top ||
            event.clientY > rect.bottom
          )
            dialog.current.close();
        }}
      >
        <button
          className="close-dialog"
          aria-label="Close enquiry"
          onClick={() => dialog.current.close()}
        >
          ×
        </button>
        <div className="eyebrow">LET’S TALK CARS</div>
        <h2 id="dialog-title">{title}</h2>
        <p id="dialog-description">
          {email
            ? `Prepare your enquiry for ${email}. Send it using your email app.`
            : "Prepare your enquiry. Contact details will be available when the dealership launches."}
        </p>
        <form id="enquiry-form" onSubmit={download}>
          <label>
            Your name
            <input
              name="name"
              autoComplete="name"
              maxLength={100}
              pattern=".*\S.*"
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
              pattern="[+0-9 \(\)\-]{7,20}"
              required
              placeholder="Your contact number"
            />
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
              maxLength={1000}
              placeholder="Tell us what you’re looking for"
            />
          </label>
          {email && (
            <button className="button dark" type="submit" value="email">
              Open email enquiry <span>↗</span>
            </button>
          )}
          <button className="button dark" type="submit" value="download">
            Download my enquiry <span>↗</span>
          </button>
          <p className="form-note">
            This saves a copy to your device. It does not send an enquiry or
            confirm a booking. <a href="/privacy">Privacy information</a>
          </p>
          <p id="form-status" role="status">
            {status}
          </p>
        </form>
      </dialog>
    </EnquiryContext.Provider>
  );
}
