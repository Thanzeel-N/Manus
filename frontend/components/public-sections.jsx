import Icon from "./icon";

export function PageIntro({ label, title, text, children }) {
  return (
    <section className="p-page-intro p-container">
      <div className="p-breadcrumb">
        <a href="/">Home</a>
        <Icon name="chevron" size={12} />
        <span>{label}</span>
      </div>
      <div className="p-page-intro-grid">
        <div>
          <p className="p-eyebrow">{label}</p>
          <h1>{title}</h1>
        </div>
        <div>
          <p>{text}</p>
          {children}
        </div>
      </div>
    </section>
  );
}
export function ContactBand() {
  return (
    <section className="p-contact-band">
      <div className="p-container">
        <div>
          <p className="p-eyebrow">LET’S FIND YOUR NEXT CHAPTER</p>
          <h2>
            A better drive
            <br />
            starts with a conversation.
          </h2>
        </div>
        <div>
          <p>
            Tell us what matters to you. We’ll help you find a car that feels
            right.
          </p>
          <a
            href="/visit#contact"
            className="p-button p-button-white"
            data-contact-trigger="true"
            data-title="Start a conversation with our team"
            data-interest="Visiting the showroom"
          >
            Talk to our team
            <Icon name="northeast" size={18} />
          </a>
        </div>
      </div>
    </section>
  );
}
export function Process({ steps }) {
  return (
    <div className="p-process">
      {steps.map(([title, text], index) => (
        <article key={title}>
          <span className="p-step">0{index + 1}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}
export function FAQ({ items }) {
  return (
    <section className="p-container p-section p-faq">
      <div>
        <p className="p-eyebrow">A LITTLE MORE CLARITY</p>
        <h2>
          Good questions.
          <br />
          Straight answers.
        </h2>
      </div>
      <div>
        {items.map(([question, answer]) => (
          <details key={question}>
            <summary>
              {question}
              <Icon name="plus" size={19} />
            </summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
