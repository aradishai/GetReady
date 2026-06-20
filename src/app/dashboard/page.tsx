"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserData {
  name: string
  level: number
  totalPoints: number
  streak: number
  _count: { testResults: number }
}

interface TestResult {
  id: string
  score: number
  totalQuestions: number
  correctAnswers: number
  createdAt: string
  course: { name: string }
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [recentResults, setRecentResults] = useState<TestResult[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isPaid) {
      fetch("/api/user/me").then((r) => r.json()).then(setUser)
      fetch("/api/results").then((r) => r.json()).then(setRecentResults)
    }
  }, [session])

  if (status === "loading" || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>טוען...</div>
      </div>
    )
  }

  const avgScore = recentResults.length
    ? Math.round(recentResults.reduce((a, r) => a + r.score, 0) / recentResults.length)
    : 0

  const lastResult = recentResults[0] ?? null

  const progressColor =
    avgScore >= 80 ? "var(--success)" : avgScore >= 60 ? "var(--warning)" : "var(--primary)"

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 18px 140px" }}>

      {/* ── Greeting ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>
          👋 שלום, {user.name}
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 8, fontSize: 15, margin: "8px 0 0" }}>
          מוכן ללמוד היום?
        </p>
      </div>

      {/* ── Stats Row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, marginBottom: 32 }}>
        {[
          { label: "התקדמות", value: `${avgScore}%`, color: progressColor },
          { label: "רמה",        value: user.level,                         color: "var(--primary)" },
          { label: "מבחנים",    value: user._count.testResults,             color: "var(--accent)" },
          { label: "נקודות",    value: user.totalPoints.toLocaleString(),   color: "var(--warning)" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 16,
              padding: "14px 6px",
              textAlign: "center",
              boxShadow: `0 0 14px ${color}20`,
            }}
          >
            <div style={{ fontSize: 17, fontWeight: 800, color }}>{value}</div>
            <div style={{ fontSize: 11, color: "var(--foreground)", opacity: 0.65, marginTop: 3 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* ── Main Card: המשך למידה ── */}
      <div
        style={{
          background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
          border: "1.5px solid var(--primary)",
          borderRadius: 24,
          padding: "28px 24px",
          marginBottom: 36,
          boxShadow: "0 0 40px rgba(56,189,248,0.18)",
        }}
      >
        {/* Header row — circle left, text right (RTL: text=first, circle=second) */}
        <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 22 }}>

          {/* Text — right side in RTL */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 700, letterSpacing: 1.5, marginBottom: 6, textTransform: "uppercase" }}>
              המשך למידה
            </div>
            <div style={{ fontSize: 21, fontWeight: 800, lineHeight: 1.2, marginBottom: 6, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {lastResult ? lastResult.course.name : "בחר קורס להתחלה"}
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)" }}>
              {lastResult
                ? `${lastResult.correctAnswers} מתוך ${lastResult.totalQuestions} שאלות נכון`
                : "לא בוצעו מבחנים עדיין"}
            </div>
          </div>

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icon-tirgul.png"
            alt="תרגול"
            style={{ width: 90, height: 90, objectFit: "contain", flexShrink: 0 }}
          />
        </div>

        {/* Progress Bar */}
        <div style={{ marginBottom: 22 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: 13, color: "var(--muted)" }}>ממוצע ציונים</span>
            <span style={{ fontSize: 15, fontWeight: 800, color: "var(--primary)" }}>{avgScore}%</span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.08)", borderRadius: 10, height: 12, overflow: "hidden" }}>
            <div
              style={{
                height: "100%",
                width: `${avgScore}%`,
                background: "linear-gradient(90deg, var(--primary), var(--accent))",
                borderRadius: 10,
                boxShadow: "0 0 10px rgba(56,189,248,0.6)",
                transition: "width 0.8s ease",
              }}
            />
          </div>
        </div>

        {/* CTA */}
        <Link
          href="/practice"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            width: "100%",
            padding: "16px",
            background: "linear-gradient(135deg, var(--primary) 0%, var(--accent) 100%)",
            color: "#07101e",
            borderRadius: 14,
            fontSize: 17,
            fontWeight: 800,
            cursor: "pointer",
            textDecoration: "none",
            boxShadow: "0 4px 24px rgba(56,189,248,0.35)",
            letterSpacing: 0.3,
          }}
        >
          ◀ המשך תרגול
        </Link>
      </div>

      {/* ── Actions ── */}
      <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, opacity: 0.75 }}>
        מה תרצה לעשות?
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14, marginBottom: 40 }}>
        {[
          { href: "/practice",   icon: "/icon-tirgul.png",      label: "תרגול" },
          { href: "/test-select", icon: "/icon-mivchan.png",    label: "מבחן" },
          { href: "/leaderboard", icon: "/icon-leaderboard.png", label: "Leaderboard" },
        ].map(({ href, icon, label }) => (
          <Link key={href} href={href} style={{ display: "block", textDecoration: "none", lineHeight: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={icon} alt={label} style={{ width: "100%", aspectRatio: "1 / 1", objectFit: "cover", display: "block" }} />
          </Link>
        ))}
      </div>

      {/* ── Recent Results ── */}
      {recentResults.length > 0 && (
        <>
          <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 14, opacity: 0.75 }}>
            מבחנים אחרונים
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {recentResults.slice(0, 5).map((r) => {
              const c = r.score >= 80 ? "var(--success)" : r.score >= 60 ? "var(--warning)" : "var(--danger)"
              return (
                <div
                  key={r.id}
                  style={{
                    background: "var(--card)",
                    border: "1px solid var(--card-border)",
                    borderRadius: 18,
                    padding: "18px 20px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 15 }}>{r.course.name}</div>
                      <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 3 }}>
                        {r.correctAnswers}/{r.totalQuestions} נכון
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ fontSize: 22, fontWeight: 800, color: c }}>{r.score}%</div>
                      <span style={{ fontSize: 20, color: "var(--muted)" }}>›</span>
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 6, height: 7, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${r.score}%`, background: c, borderRadius: 6 }} />
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
