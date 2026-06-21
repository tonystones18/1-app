import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext.js";

export function LoginPage(): React.JSX.Element {
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("admin@visionesoft.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email and password are required");
      return;
    }

    const result = await login(email, password);
    if (result.success) {
      void navigate("/");
    } else {
      setError(result.error ?? "Login failed");
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        <div className="auth-logo">
          <span className="auth-logo-name">VisioneSoft</span>
          <span className="auth-logo-badge">Admin</span>
        </div>

        <h1 className="auth-title">Sign in to your account</h1>
        <p className="auth-subtitle">Enterprise iGaming Platform</p>

        {error && (
          <div className="alert alert-danger" role="alert" style={{ marginBottom: "16px" }}>
            <div className="alert-content">{error}</div>
          </div>
        )}

        <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
          <div className="field">
            <label htmlFor="email" className="field-label">Email address</label>
            <input
              id="email"
              type="email"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              placeholder="admin@visionesoft.com"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password" className="field-label">Password</label>
            <input
              id="password"
              type="password"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={isLoading} style={{ marginTop: "8px" }}>
            {isLoading ? <span className="spinner" aria-hidden="true" /> : null}
            {isLoading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p style={{ textAlign: "center", fontSize: "0.75rem", color: "var(--color-neutral-400)", marginTop: "24px" }}>
          Development mode — use admin@visionesoft.com / Admin@VisioneSoft1!
        </p>
      </div>
    </div>
  );
}
