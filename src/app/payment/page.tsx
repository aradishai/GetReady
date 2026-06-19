"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Send, CheckCircle, Lock, Copy } from "lucide-react"

export default function PaymentPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const [form, setForm] = useState({ fullName: "", email: "", lastFourDigits: "", note: "" })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [copied, setCopied] = useState(false)

  const PHONE_NUMBER = "0542086591"

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    const res = await fetch("/api/payment/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    })

    const data = await res.json()
    setLoading(false)

    if (!res.ok) {
      setError(data.error || "שגיאה בשליחה")
    } else {
      setSubmitted(true)
    }
  }

  function copyPhone() {
    navigator.clipboard.writeText(PHONE_NUMBER)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (submitted) {
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
            textAlign: "center",
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 20,
            padding: 48,
            maxWidth: 440,
            boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
          }}
        >
          <CheckCircle size={64} color="var(--success)" style={{ marginBottom: 20 }} />
          <h2 style={{ fontSize: 24, fontWeight: 700, marginBottom: 12 }}>
            הבקשה נשלחה בהצלחה! ✅
          </h2>
          <p style={{ color: "var(--muted)", lineHeight: 1.7, marginBottom: 24 }}>
            קיבלנו את אישור התשלום שלך.
            <br />
            נאשר את הגישה שלך בהקדם האפשרי.
            <br />
            <strong style={{ color: "var(--foreground)" }}>בדרך כלל עד 24 שעות.</strong>
          </p>
          <button
            onClick={() => router.push("/dashboard")}
            style={{
              padding: "12px 28px",
              background: "var(--primary)",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            חזרה לדף הבית
          </button>
        </div>
      </div>
    )
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
      <div style={{ width: "100%", maxWidth: 480 }}>
        {/* Lock Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <Lock size={48} color="var(--primary)" style={{ marginBottom: 12 }} />
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>
            גישה לאפליקציה
          </h1>
          <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 15 }}>
            כדי להתחיל לתרגל, יש לרכוש גישה
          </p>
        </div>

        {/* Payment Card */}
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 20,
            padding: 32,
            marginBottom: 20,
            boxShadow: "0 4px 24px rgba(99,102,241,0.08)",
          }}
        >
          <div
            style={{
              background: "linear-gradient(135deg, rgba(99,102,241,0.1), rgba(244,63,94,0.1))",
              border: "1px solid rgba(99,102,241,0.2)",
              borderRadius: 14,
              padding: 20,
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: 36, fontWeight: 800, color: "var(--primary)", marginBottom: 4 }}>
              30 ₪
            </div>
            <div style={{ color: "var(--muted)", fontSize: 14 }}>
              גישה מלאה לכל הקורסים והפיצ׳רים
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ fontWeight: 600, marginBottom: 12, fontSize: 15 }}>
              שלב 1 — העברה בביט:
            </p>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "var(--muted-bg)",
                border: "1px solid var(--card-border)",
                borderRadius: 10,
                padding: "12px 16px",
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, flex: 1 }}>{PHONE_NUMBER}</span>
              <button
                onClick={copyPhone}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "6px 12px",
                  background: copied ? "var(--success)" : "var(--primary)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 7,
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 500,
                  transition: "background 0.2s",
                }}
              >
                <Copy size={13} />
                {copied ? "הועתק!" : "העתק"}
              </button>
            </div>
          </div>

          <p style={{ fontWeight: 600, marginBottom: 16, fontSize: 15 }}>
            שלב 2 — שלח אישור תשלום:
          </p>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              { label: "שם מלא", key: "fullName", type: "text", placeholder: "ישראל ישראלי", required: true },
              { label: "מייל", key: "email", type: "email", placeholder: "your@email.com", required: true },
              { label: "4 ספרות אחרונות של הטלפון ממנו שילמת", key: "lastFourDigits", type: "text", placeholder: "1234", required: true },
              { label: "הערה (אופציונלי)", key: "note", type: "text", placeholder: "...", required: false },
            ].map(({ label, key, type, placeholder, required }) => (
              <div key={key}>
                <label style={{ display: "block", marginBottom: 5, fontSize: 13, color: "var(--muted)" }}>
                  {label}
                </label>
                <input
                  type={type}
                  value={form[key as keyof typeof form]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  required={required}
                  placeholder={placeholder}
                  maxLength={key === "lastFourDigits" ? 4 : undefined}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    background: "var(--muted-bg)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 10,
                    color: "var(--foreground)",
                    fontSize: 14,
                    outline: "none",
                  }}
                />
              </div>
            ))}

            {error && (
              <div
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8,
                  padding: "10px 14px",
                  color: "#ef4444",
                  fontSize: 14,
                }}
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                padding: "12px 24px",
                background: loading ? "var(--muted)" : "var(--primary)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                marginTop: 4,
              }}
            >
              <Send size={16} />
              {loading ? "שולח..." : "שלח אישור תשלום"}
            </button>
          </form>
        </div>

        {session?.user && (
          <p style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>
            מחובר כ: {session.user.email}
          </p>
        )}
      </div>
    </div>
  )
}
