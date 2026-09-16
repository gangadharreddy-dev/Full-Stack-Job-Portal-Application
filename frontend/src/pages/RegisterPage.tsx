import { useState } from "react";
import type { FormEvent } from "react";
import { api } from "../api/client";

export default function RegisterPage({ onAuthed }: { onAuthed: () => void }) {
  const [full_name, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone_number, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await api.auth.register(full_name, email, phone_number, password);
      await api.auth.login(email, password);
      setSuccess("Account created. Opening jobs...");
      onAuthed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Register failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <div className="form-card">
        <h2 style={{ marginBottom: "8px", textAlign: "center" }}>Join Jobetix</h2>
        <p className="muted" style={{ textAlign: "center", marginBottom: "20px" }}>
          Create an account to apply for internships & fresher roles
        </p>
        <form onSubmit={handleSubmit} className="form">
          <label>
            Full name
            <input value={full_name} onChange={(e) => setFullName(e.target.value)} required placeholder="Your full name" />
          </label>
          <label>
            Email address
            <input value={email} onChange={(e) => setEmail(e.target.value)} required type="email" placeholder="student@college.edu" />
          </label>
          <label>
            Phone number
            <input
              value={phone_number}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              type="tel"
              inputMode="tel"
              placeholder="9876543210"
            />
          </label>
          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} required type="password" placeholder="Create a secure password" />
          </label>
          <button type="submit" disabled={loading} style={{ marginTop: "8px" }}>
            {loading ? "Creating Account..." : "Register Now"}
          </button>
          {success && <div className="success">{success}</div>}
          {error && <div className="error">{error}</div>}
          <div className="muted" style={{ textAlign: "center", marginTop: "12px" }}>
            Already registered? <a href="#/login" style={{ color: "var(--royal-blue)", fontWeight: 700 }}>Login here</a>
          </div>
        </form>
      </div>
    </div>
  );
}
