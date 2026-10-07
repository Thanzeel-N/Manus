import "./globals.css";
import "./brand-theme.css";
import "./color-modes.css";
import ThemeInit from "../components/theme-init";

export const metadata = {
  title: "Manu’s Car World — Pre-owned Car Dealership",
  description:
    "Browse pre-owned cars at Manu’s Car World. Compare stock, plan a showroom visit, or discuss selling and exchanging your current car with our team.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <ThemeInit />
      </head>
      <body>{children}</body>
    </html>
  );
}
