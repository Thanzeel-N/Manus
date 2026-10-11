"use client";
import Script from "next/script";
import { useEffect, useRef, useState } from "react";
import BrandLogo from "./brand-logo";
import ThemeToggle from "./theme-toggle";
import Icon from "./icon";
import { useCustomerSession } from "./customer-session";

export default function UnifiedLogin({ fromWorkspace = false, createAccount = false }) {
  const { session, error: sessionError } = useCustomerSession();
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false),
    [googleReady, setGoogleReady] = useState(false);
  const [next, setNext] = useState("/cars");
  const registering = createAccount;
  const [challenge, setChallenge] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);
  const [resendAt, setResendAt] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const codeInput = useRef(null);
  useEffect(() => {
    if (!challenge) return;
    codeInput.current?.focus();
    const tick = () => setSecondsLeft(Math.max(0, Math.ceil((resendAt - Date.now()) / 1000)));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [challenge, resendAt]);
  const googleButton = useRef(null);
  useEffect(() => {
    const value = new URLSearchParams(location.search).get("next");
    if (value && /^\/cars(?:\/|\?|#|$)/.test(value) && !value.includes("\\"))
      setNext(value);
  }, []);
  useEffect(() => {
    if (
      session?.account?.role === "admin" ||
      session?.account?.role === "staff"
    )
      window.location.replace("/dashboard");
    else if (fromWorkspace && session?.account?.role === "customer")
      window.location.replace("/cars");
  }, [session, fromWorkspace]);
  useEffect(() => {
    if (
      !googleReady ||
      !session?.client_id ||
      !googleButton.current ||
      session.account
    )
      return;
    let active = true;
    window.google.accounts.id.initialize({
      client_id: session.client_id,
      nonce: session.nonce,
      auto_select: false,
      callback: async ({ credential }) => {
        if (!active) return;
        setBusy(true);
        setError("");
        try {
          const response = await fetch("/api/customer/google", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-CSRFToken": session.csrf,
            },
            body: JSON.stringify({ credential }),
          });
          const result = await response.json();
          if (!response.ok)
            throw new Error(result.detail || "Unable to sign in.");
          const destination =
            result.account?.role === "staff" ||
            result.account?.role === "admin" ||
            result.account?.destination === "/dashboard"
              ? "/dashboard"
              : next;
          window.location.assign(destination);
        } catch (error) {
          setError(error.message);
          setBusy(false);
        }
      },
    });
    window.google.accounts.id.renderButton(googleButton.current, {
      type: "standard",
      theme: "outline",
      size: "large",
      text: "continue_with",
      width: 280,
    });
    return () => {
      active = false;
    };
  }, [googleReady, session, next, challenge]);
  async function submit(event) {
    event.preventDefault();
    if (busy || !session) return;
    setBusy(true);
    setError("");
    try {
      const fields = Object.fromEntries(new FormData(event.currentTarget));
      const sendingCode = registering && !challenge;
      const response = await fetch(
        registering ? (sendingCode ? "/api/customer/registration-code" : "/api/customer/register") : "/api/customer/password",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": session.csrf,
          },
          body: JSON.stringify(registering && challenge ? { ...registrationData, verification_id: challenge.verification_id, verification_code: fields.verification_code } : fields),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.detail ||
            Object.values(result).flat().join(" ") ||
            "Unable to sign in.",
        );
      if (sendingCode) {
        setRegistrationData(fields);
        setChallenge(result);
        setResendAt(Date.now() + result.retry_after * 1000);
        setBusy(false);
        return;
      }
      setRegistrationData(null);
      window.location.assign(
        result.account.role === "customer" ? next : "/dashboard",
      );
    } catch (error) {
      setError(error.message);
      setBusy(false);
    }
  }
  async function resendCode() {
    if (busy || secondsLeft > 0) return;
    setBusy(true); setError("");
    try {
      const response = await fetch('/api/customer/registration-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'X-CSRFToken': session.csrf }, body: JSON.stringify(registrationData),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.detail || 'Unable to resend your code. Please try again.');
      setChallenge(result);
      setResendAt(Date.now() + result.retry_after * 1000);
    } catch (error) { setError(error.message); }
    finally { setBusy(false); }
  }
  async function signOut() {
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/customer/account-logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": session.csrf,
        },
        body: "{}",
      });
      if (!response.ok)
        throw new Error("Unable to sign out. Please try again.");
      window.location.reload();
    } catch (error) {
      setError(error.message);
      setBusy(false);
    }
  }
  return (
    <div className="workspace-app ws-login ws-shared-login">
      <section className="ws-login-story">
        <a href="/" className="ws-brand" aria-label="Manu’s Car World home">
          <BrandLogo />
          <small>MANU’S CAR WORLD</small>
        </a>
        <div className="ws-login-copy">
          <span className="ws-overline">YOUR NEXT CHAPTER STARTS HERE</span>
          <h1>
            Great cars.
            <br />
            Good people.
            <br />
            <em>One place to sign in.</em>
          </h1>
          <p>
            Find your next drive or keep the showroom moving. Your account takes
            you to the right place.
          </p>
          <div className="ws-login-tags">
            <span>
              <Icon name="car" size={16} />
              Your next car
            </span>
            <span>
              <Icon name="wheel" size={16} />
              Test drives
            </span>
            <span>
              <Icon name="users" size={16} />
              Your team
            </span>
          </div>
        </div>
        <div className="ws-login-photo">
          <img
            src="/assets/optimized/bmw-900-24d7056e377e.webp"
            alt="BMW from the showroom collection"
          />
          <span>
            MANU’S CAR WORLD<span>FOR THE ROAD AHEAD</span>
          </span>
        </div>
        <small className="ws-login-foot">
          Your showroom. A little more connected.
        </small>
      </section>
      <section className="ws-login-form-side">
        <div className="ws-login-tools">
          <ThemeToggle />
          <a className="ws-back" href="/">
            Back to website
          </a>
        </div>
        <div className="ws-login-form">
          <span className="ws-login-symbol">
            <Icon name="shield" size={24} />
          </span>
          <p className="ws-overline">WELCOME TO MANU’S</p>
          <h2>
            {session?.account
              ? "Welcome back."
              : registering
                ? "Your next drive starts here."
                : "Welcome back."}
          </h2>
          <p>
            {session?.account
              ? `Signed in as ${session.account.name || session.account.email}.`
              : registering
                ? "Create your customer account with email and password. No Google account needed."
                : "Sign in with Google, or use your email and password. Staff can use their username."}
          </p>
          {(error || sessionError) && (
            <div className="ws-error" role="alert">
              {error || sessionError}
            </div>
          )}
          {session?.account ? (
            <div className="ws-shared-account">
              <a
                className="ws-button"
                href={session.account.role === "customer" ? next : "/dashboard"}
              >
                {session.account.role === "customer"
                  ? "Continue to cars"
                  : "Open dashboard"}
                <Icon name="arrow" size={18} />
              </a>
              <button
                className="ws-text-button"
                onClick={signOut}
                disabled={busy}
              >
                Sign out
              </button>
            </div>
          ) : (
            <>
              {session?.client_id ? (
                <>
                  <Script
                    src="https://accounts.google.com/gsi/client"
                    onReady={() => setGoogleReady(true)}
                    onError={() =>
                      setError(
                        "Google could not load. You can still create an account or sign in below.",
                      )
                    }
                  />
                  <div
                    ref={googleButton}
                    className="ws-google-button"
                    aria-busy={busy}
                  />
                </>
              ) : (
                <>
                  <button className="ws-google-unavailable" disabled>
                    Continue with Google
                  </button>
                  {session && (
                    <small className="ws-google-note">
                      Google sign-in is being set up. You can create an account
                      or sign in with email below.
                    </small>
                  )}
                </>
              )}
              <div className="ws-login-divider">
                <span>or continue with email</span>
              </div>

              <form
                onSubmit={submit}
                key={registering ? "register" : "login"}
                aria-label={
                  registering
                    ? "Create a customer account"
                    : "Sign in with password"
                }
              >
                {registering && (
                  <label className="ws-field">
                    <span>Full name</span>
                    <input
                      name="name"
                      autoComplete="name"
                      required
                      maxLength={150}
                      placeholder="Your full name"
                      disabled={busy}
                    />
                  </label>
                )}
                <label className="ws-field">
                  <span>
                    {registering ? "Email address" : "Email or username"}
                  </span>
                  <input
                    name={registering ? "email" : "username"}
                    type={registering ? "email" : "text"}
                    autoComplete={registering ? "email" : "username"}
                    autoCapitalize="none"
                    spellCheck={false}
                    required
                    maxLength={254}
                    placeholder={
                      registering
                        ? "you@example.com"
                        : "Your email or staff username"
                    }
                    disabled={busy}
                  />
                </label>
                <label className="ws-field">
                  <span id="auth-password-label">Password</span>
                  <span className="ws-password">
                    <input
                      name="password"
                      aria-labelledby="auth-password-label"
                      type={showPassword ? "text" : "password"}
                      autoComplete={
                        registering ? "new-password" : "current-password"
                      }
                      minLength={registering ? 8 : undefined}
                      maxLength={1024}
                      aria-describedby={
                        registering ? "signup-password-help" : undefined
                      }
                      required
                      placeholder="Enter your password"
                      disabled={busy}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((value) => !value)}
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? "Hide" : "Show"}
                    </button>
                  </span>
                </label>
                {registering && (
                  <>
                    <small
                      className="ws-password-help"
                      id="signup-password-help"
                    >
                      Use at least 8 characters. Avoid common passwords and your
                      personal details.
                    </small>
                    <label className="ws-field">
                      <span>Confirm password</span>
                      <input
                        name="confirm_password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        maxLength={1024}
                        placeholder="Enter your password again"
                        disabled={busy}
                      />
                    </label>
                  </>
                )}
                <button className="ws-button" disabled={busy || !session}>
                  {busy
                    ? registering
                      ? "Creating your account…"
                      : "Signing in…"
                    : registering
                      ? "Create my account"
                      : "Sign in"}
                  <Icon name="arrow" size={18} />
                </button>
              </form>
              <p className="ws-login-help">
                {registering
                  ? "Already have an account?"
                  : "New to Manu’s Car World?"}{" "}
                <a
                  href={registering ? "/login" : "/signup"}
                  className="ws-auth-switch"
                >
                  {registering ? "Sign in" : "Create an account"}
                </a>
                <br />
                <a href="/visit#contact">
                  Need help signing in? Contact our team.
                </a>
              </p>
            </>
          )}
        </div>
        <span className="ws-login-security">
          <Icon name="shield" size={13} /> Your account determines your access
        </span>
      </section>
    </div>
  );
}
