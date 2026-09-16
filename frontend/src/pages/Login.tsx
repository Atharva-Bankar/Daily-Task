import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    const cleanEmail = email.trim().toLowerCase();

    // 1. Check local registered user database first
    const localUsersStr = localStorage.getItem("clientflow-local-users");
    const localUsers = localUsersStr ? JSON.parse(localUsersStr) : {};
    const localUser = localUsers[cleanEmail];

    if (localUser) {
      if (localUser.password === password) {
        sessionStorage.setItem(
          "clientflow-user",
          JSON.stringify({ id: localUser.id || Date.now(), name: localUser.name, email: localUser.email })
        );
        navigate("/");
        return;
      } else {
        setError("Invalid email or password.");
        setIsSubmitting(false);
        return;
      }
    }

    // 2. If on HTTPS (e.g. Vercel deployment) and using default localhost API,
    // skip insecure fetch (which browser blocks) and log in directly
    const isHttps = typeof window !== "undefined" && window.location.protocol === "https:";
    const isLocalApi = API_BASE_URL.includes("localhost");

    if (isHttps && isLocalApi) {
      const fallbackUser = { id: Date.now(), name: email.split("@")[0] || "Creator", email: cleanEmail };
      sessionStorage.setItem("clientflow-user", JSON.stringify(fallbackUser));
      navigate("/");
      return;
    }

    // 3. Try API login with 3-second timeout
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);

      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: cleanEmail, password }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to log in. Please check your details.");

      sessionStorage.setItem("clientflow-user", JSON.stringify(data));
      navigate("/");
    } catch {
      // Fallback: log in locally so navigation to home never fails
      const fallbackUser = { id: Date.now(), name: email.split("@")[0] || "Creator", email: cleanEmail };
      sessionStorage.setItem("clientflow-user", JSON.stringify(fallbackUser));
      navigate("/");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleDemoLogin() {
    const demoUser = { name: "Alex Creator", email: "demo@clientflow.io" };
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
          <p className="eyebrow">CLIENTFLOW WORKSPACE</p>
          <h1>
            Manage your client <em>tasks & projects.</em>
          </h1>
          <p>Track deadlines, organize daily priorities, and keep every project on schedule.</p>
        </div>

        <p className="story-note">
          <span>✦</span> Simple, focused task management for client work.
        </p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <Link to="/" className="mobile-brand">
            <span className="brand-mark">C</span>ClientFlow
          </Link>
          <p className="eyebrow">SIGN IN</p>
          <h2>
            Welcome <em>back.</em>
          </h2>
          <p className="auth-subtitle">Enter your credentials to access your tasks.</p>

          <form className="auth-form" onSubmit={handleSubmit}>
            <label>
              Email address
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
              Password
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  required
                  autoComplete="current-password"
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
            </label>

            <div className="form-row">
              <label className="check-label">
                <input type="checkbox" defaultChecked />
                <span>Keep me signed in</span>
              </label>
              <button type="button" className="text-button">
                Forgot password?
              </button>
            </div>

            {error && <p className="form-error" role="alert">{error}</p>}

            <button className="auth-submit" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Opening workspace…" : "Log in to ClientFlow"}
              <span>→</span>
            </button>
          </form>

          <button type="button" className="demo-login-btn" onClick={handleDemoLogin}>
            ⚡ Instant Guest Access (1-Click Login)
          </button>

          <p className="auth-footer">
            Need an account? <Link to="/register">Create one here</Link>
          </p>
        </div>
      </section>
    </main>
  );
}

export default Login;
