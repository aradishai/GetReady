"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function RegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    if (form.password !== form.confirm) { setError("הסיסמאות לא תואמות"); return }
    if (form.password.length < 6) { setError("הסיסמה חייבת להכיל לפחות 6 תווים"); return }
    setLoading(true)
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: form.name, email: form.email, password: form.password }),
    })
    const data = await res.json()
    setLoading(false)
    if (!res.ok) { setError(data.error || "שגיאה בהרשמה") } else { router.push("/login?registered=1") }
  }

  return (
    <div
      style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "var(--background)" }}
    >
      <div
        style={{ width: "100%", maxWidth: 420, background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 20, padding: 40, boxShadow: "0 4px 24px rgba(56,189,248,0.08)" }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 26, fontWeight: 800, background: "linear-gradient(135deg, #38bdf8, #7dd3fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", margin: 0 }}>
            GetReady
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 15 }}>צור חשבון חדש</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {[
            { label: "שם מלא", key: "name", type: "text", placeholder: "ישראל ישראלי" },
            { label: "מייל", key: "email", type: "email", placeholder: "your@email.com" },
            { label: "סיסמה", key: "password", type: "password", placeholder: "לפחות 6 תווים" },
            { label: "אישור סיסמה", key: "confirm", type: "password", placeholder: "••••••••" },
          ].map(({ label, key, type, placeholder }) => (
            <div key={key}>
              <label style={{ display: "block", marginBottom: 5, fontSize: 14, color: "var(--muted)" }}>{label}</label>
              <input
                type={type}
                value={form[key as keyof typeof form]}
                onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                required
                placeholder={placeholder}
                style={{ width: "100%", padding: "10px 14px", background: "var(--muted-bg)", border: "1px solid var(--card-border)", borderRadius: 10, color: "var(--foreground)", fontSize: 15, outline: "none" }}
              />
            </div>
          ))}

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "12px 24px", background: loading ? "var(--muted)" : "var(--primary)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 4 }}
          >
            {loading ? "נרשם..." : "הרשמה"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "var(--muted)", fontSize: 14 }}>
          יש לך כבר חשבון?{" "}
          <Link href="/login" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>התחברות</Link>
        </p>
      </div>
    </div>
  )
}
