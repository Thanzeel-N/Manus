export const metadata = {
  title: "Privacy | Manu’s Car World",
  alternates: { canonical: "/privacy" },
};
export default function PrivacyPage() {
  return (
    <main id="main-content" className="section privacy-copy">
      <h1>Your privacy</h1>
      <p>
        Saved cars are stored in this browser on your device. Clear your
        browser’s site data to remove them. This website does not use analytics
        or advertising cookies.
      </p>
      <p>
        The enquiry form does not submit your details to our website.
        Downloading a draft saves your name, phone number and message to your
        device. Keep or delete that file as you choose.
      </p>
      <p>
        When email is available, the form opens your email app with a draft. You
        choose whether to send it. Your email provider and the recipient then
        handle that message. Opening a draft does not confirm a booking.
      </p>
      <p>
        The hosting provider may process technical request information, such as
        IP addresses, to operate and protect the site.
      </p>
      <a className="button light" href="/">
        Back to the showroom
      </a>
    </main>
  );
}
