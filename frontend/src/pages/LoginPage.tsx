import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";

export default function LoginPage({ onAuthed }: { onAuthed: () => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.auth.login(email, password);
      onAuthed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="form-card">
        <h2 style={{ marginBottom: "20px", textAlign: "center" }}>Welcome to Jobetix</h2>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="student@college.edu" />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" placeholder="••••••••" />
          </label>
          <button disabled={loading} style={{ marginTop: "8px" }}>{loading ? "Logging in..." : "Login to Account"}</button>
          {error && <div className="error">{error}</div>}
          <div className="muted" style={{ textAlign: "center", marginTop: "12px" }}>
            Don't have an account? <a href="#/register" style={{ color: "var(--royal-blue)", fontWeight: 700 }}>Register as Student / Candidate</a>
          </div>
        </form>
      </div>
    </div>
  );
}

