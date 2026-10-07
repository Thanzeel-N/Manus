export default function BrandLogo({ className = "" }) {
  return <span className={`brand-logo ${className}`}>
    <img className="logo-for-light" src="/brand/logo-light.svg" alt="Manu’s Car World" width="1979" height="492" />
    <img className="logo-for-dark" src="/brand/logo-dark.svg" alt="Manu’s Car World" width="1979" height="492" />
  </span>;
}
