import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";

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
    try {
      const response = await fetch("http://localhost:5000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.message || "Unable to log in. Please check your details.");
      sessionStorage.setItem("clientflow-user", JSON.stringify(data));
      navigate("/");
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unable to log in. Please try again.");
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
