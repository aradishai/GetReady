"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)
    const res = await signIn("credentials", { email, password, redirect: false })
    setLoading(false)
    if (res?.error) {
      setError("מייל או סיסמה שגויים")
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "var(--background)",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 20,
          padding: 40,
          boxShadow: "0 4px 24px rgba(56,189,248,0.08)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-getready.png" alt="GetReady" style={{ height: 90, width: "auto", display: "block", margin: "0 auto" }} />
          <p style={{ color: "#f5f0e8", marginTop: 2, fontSize: 12, letterSpacing: 0.3 }}>ערד ישי | חותם בעולם</p>
          <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 15 }}>התחבר לחשבון שלך</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, color: "var(--muted)" }}>מייל</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
              style={{ width: "100%", padding: "10px 14px", background: "var(--muted-bg)", border: "1px solid var(--card-border)", borderRadius: 10, color: "var(--foreground)", fontSize: 15, outline: "none" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: 6, fontSize: 14, color: "var(--muted)" }}>סיסמה</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                style={{ width: "100%", padding: "10px 14px", paddingLeft: 60, background: "var(--muted-bg)", border: "1px solid var(--card-border)", borderRadius: 10, color: "var(--foreground)", fontSize: 15, outline: "none" }}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "var(--muted)", fontSize: 12, padding: 0 }}
              >
                {showPass ? "הסתר" : "הצג"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8, padding: "10px 14px", color: "#ef4444", fontSize: 14 }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ padding: "12px 24px", background: loading ? "var(--muted)" : "var(--primary)", color: "#fff", border: "none", borderRadius: 10, fontSize: 16, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", marginTop: 8 }}
          >
            {loading ? "מתחבר..." : "התחברות"}
          </button>
        </form>

        <p style={{ textAlign: "center", marginTop: 24, color: "var(--muted)", fontSize: 14 }}>
          אין לך חשבון?{" "}
          <Link href="/register" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>הרשמה</Link>
        </p>
      </div>
    </div>
  )
}
