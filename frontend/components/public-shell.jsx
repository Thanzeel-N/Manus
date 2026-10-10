import Header from "./header";
import Footer from "./footer";
import { ContactModalProvider } from "./contact-modal";

export default function PublicShell({ children }) {
  return (
    <ContactModalProvider>
      <div className="public-site">
        <a className="p-skip" href="#main-content">
          Skip to content
        </a>
        <Header />
        {children}
        <Footer />
      </div>
    </ContactModalProvider>
  );
}
