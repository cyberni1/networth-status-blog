"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin");
      } else {
        const data = await res.json();
        setError(data.error || "Falsches Passwort");
      }
    } catch {
      setError("Verbindungsfehler – bitte nochmal versuchen");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "#08080f", fontFamily: "system-ui, sans-serif",
    }}>
      <div style={{ width: "100%", maxWidth: "380px", padding: "0 20px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{ fontSize: "28px", fontWeight: 900, color: "#fff", letterSpacing: "-0.5px" }}>
            PROMI<span style={{ color: "#a855f7" }}>VERMÖGEN</span>
          </div>
          <p style={{ color: "rgba(255,255,255,0.35)", fontSize: "13px", marginTop: "8px" }}>
            Admin-Bereich
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "16px", padding: "28px",
          }}
        >
          <label style={{ display: "block", fontSize: "13px", color: "rgba(255,255,255,0.5)", marginBottom: "8px" }}>
            Passwort
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
            autoFocus
            style={{
              width: "100%", boxSizing: "border-box",
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: "10px", padding: "12px 16px",
              color: "#fff", fontSize: "16px", outline: "none",
              marginBottom: error ? "12px" : "20px",
            }}
          />

          {error && (
            <p style={{ color: "#f87171", fontSize: "13px", marginBottom: "16px" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            style={{
              width: "100%", padding: "13px",
              borderRadius: "10px",
              background: "linear-gradient(135deg,#a855f7,#3b82f6)",
              color: "#fff", fontWeight: 700, fontSize: "15px",
              border: "none", cursor: loading ? "wait" : "pointer",
              opacity: !password ? 0.5 : 1,
              transition: "opacity 0.2s",
            }}
          >
            {loading ? "Einloggen..." : "Einloggen"}
          </button>
        </form>
      </div>
    </div>
  );
}
