import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Register() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [registered, setRegistered] = useState(false);

  function getPasswordStrength(pass: string) {
    if (!pass) return { score: 0, label: "", color: "#d9ddea" };
    if (pass.length < 6) return { score: 33, label: "Weak password", color: "#cf4d77" };
    if (pass.length < 10) return { score: 66, label: "Good password ✦", color: "#6470a2" };
    return { score: 100, label: "Strong password ✦", color: "#56613a" };
  }

  const strength = getPasswordStrength(password);

  function saveLocalUser(userName: string, userEmail: string, userPass: string) {
    const cleanEmail = userEmail.trim().toLowerCase();
    const localUsersStr = localStorage.getItem("clientflow-local-users");
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
    localUsers[cleanEmail] = {
      id: Date.now(),
      name: userName.trim(),
      email: cleanEmail,
      password: userPass,
    };
    localStorage.setItem("clientflow-local-users", JSON.stringify(localUsers));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: cleanEmail, username: cleanEmail, password }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "We couldn't create your account. Please try again.");

      saveLocalUser(name, cleanEmail, password);
      setRegistered(true);
    } catch (submitError) {
      const isNetworkError = submitError instanceof TypeError || (submitError instanceof Error && (submitError.message.includes("fetch") || submitError.message.includes("Failed")));

      if (isNetworkError) {
        // Save user to localStorage registry so login works 100% on Vercel static deployments
        saveLocalUser(name, cleanEmail, password);
        setRegistered(true);
        return;
      }

      setError(submitError instanceof Error ? submitError.message : "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoRegister() {
    const demoUser = { name: name || "Creative Partner", email: email || "creator@clientflow.io" };
    sessionStorage.setItem("clientflow-user", JSON.stringify(demoUser));
    navigate("/");
  }

  return (
    <main className="auth-shell">
      <section className="auth-story" aria-label="ClientFlow introduction">
        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          ClientFlow
        </Link>
        <div className="hero-sun-auth" aria-hidden="true">☼</div>
        <div className="story-copy">
          <p className="eyebrow">GET STARTED</p>
          <h1>
            Organize your <em>client workflow.</em>
          </h1>
          <p>Set up your task planner to track progress, assign priorities, and deliver on time.</p>
        </div>

        <p className="story-note">
          <span>✦</span> Quick setup for your task workspace.
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <Link to="/" className="mobile-brand">
            <span className="brand-mark">C</span>ClientFlow
          </Link>
          <p className="eyebrow">NEW ACCOUNT</p>
          <h2>
            Create your <em>workspace.</em>
          </h2>
          <p className="auth-subtitle">Fill in your details to start managing tasks.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Your name
              <input
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                autoComplete="name"
              />
            </label>

            <label>
              Work email
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
              />
            </label>

            <label>
              Create a password
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              {password && (
                <div className="strength-meter">
                  <div className="strength-bar-track">
                    <div
                      className="strength-bar-fill"
                      style={{ width: `${strength.score}%`, background: strength.color }}
                    />
                  </div>
                  <span className="strength-label" style={{ color: strength.color }}>
                    {strength.label}
                  </span>
                </div>
              )}
            </label>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating workspace…" : "Create my workspace"}
              <span>→</span>
            </button>
          </form>

          <button type="button" className="demo-login-btn" onClick={handleDemoRegister}>
            ⚡ Instant Demo Access (Skip Registration)
          </button>

          <p className="auth-footer">
            Already have an account? <Link to="/login">Log in here</Link>
          </p>
        </div>
      </section>

      {registered && (
        <div className="success-backdrop" role="dialog" aria-modal="true" aria-labelledby="success-title">
          <div className="success-modal">
            <div className="success-icon">✓</div>
            <p className="eyebrow">YOU'RE ALL SET</p>
            <h2 id="success-title">Workspace created!</h2>
            <p>Your ClientFlow account is ready. Log in to start organizing your client work.</p>
            <button className="auth-submit" onClick={() => navigate("/login")} autoFocus>
              Continue to login <span>→</span>
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default Register;
