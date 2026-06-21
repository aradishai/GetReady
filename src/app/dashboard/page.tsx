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

      {/* ── Course Cards ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>

          {/* פסיכודיאגנוסטיקה — green */}
          <Link href="/course/course-psychodiag" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "linear-gradient(170deg, #0c1222 0%, #050a16 100%)",
                border: "2px solid #22c55e",
                borderRadius: 18,
                padding: "26px 10px 20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                boxShadow: "0 0 6px #22c55e, 0 0 18px #22c55ecc, 0 0 42px #22c55e66, 0 0 72px #22c55e28, inset 0 0 22px #22c55e0d",
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1)")}
            >
              <div style={{ filter: "drop-shadow(0 0 8px #22c55e) drop-shadow(0 0 18px #22c55e)" }}>
                <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
                  <path d="M32 7C20 7 10 15 10 26C10 36 16 43 25 46V51H39V46C48 43 54 36 54 26C54 15 44 7 32 7Z"
                    stroke="#22c55e" strokeWidth="2.5" strokeLinejoin="round" fill="rgba(34,197,94,0.08)"/>
                  <line x1="32" y1="8" x2="32" y2="50" stroke="#22c55e" strokeWidth="1.5"/>
                  <path d="M10 22C6 22 4 26 6 30C8 34 10 33 10 29" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M54 22C58 22 60 26 58 30C56 34 54 33 54 29" stroke="#22c55e" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="42" cy="44" r="9" stroke="#22c55e" strokeWidth="2.5" fill="rgba(34,197,94,0.08)"/>
                  <line x1="48" y1="51" x2="55" y2="58" stroke="#22c55e" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.4, textAlign: "center" }}>
                פסיכודיאגנוסטיקה
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #22c55e88",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#22c55e", fontSize: 15 }}>›</div>
            </div>
          </Link>

          {/* פסיכולוגיה חברתית — yellow */}
          <Link href="/course/course-social" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "linear-gradient(170deg, #121008 0%, #0a0c06 100%)",
                border: "2px solid #eab308",
                borderRadius: 18,
                padding: "26px 10px 20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                boxShadow: "0 0 6px #eab308, 0 0 18px #eab308cc, 0 0 42px #eab30866, 0 0 72px #eab30828, inset 0 0 22px #eab3080d",
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1)")}
            >
              <div style={{ filter: "drop-shadow(0 0 8px #eab308) drop-shadow(0 0 18px #eab308)" }}>
                <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="17" r="9" stroke="#eab308" strokeWidth="2.5" fill="rgba(234,179,8,0.1)"/>
                  <path d="M18 54C18 43 24 37 32 37C40 37 46 43 46 54" stroke="#eab308" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
                  <circle cx="13" cy="21" r="7" stroke="#eab308" strokeWidth="2" fill="rgba(234,179,8,0.07)" opacity="0.85"/>
                  <path d="M3 54C3 45 7 41 13 41" stroke="#eab308" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85"/>
                  <circle cx="51" cy="21" r="7" stroke="#eab308" strokeWidth="2" fill="rgba(234,179,8,0.07)" opacity="0.85"/>
                  <path d="M61 54C61 45 57 41 51 41" stroke="#eab308" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.4, textAlign: "center" }}>
                פסיכולוגיה חברתית
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #eab30888",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#eab308", fontSize: 15 }}>›</div>
            </div>
          </Link>

          {/* אישיות — purple */}
          <Link href="/course/course-iyut" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "linear-gradient(170deg, #0e0c1e 0%, #080616 100%)",
                border: "2px solid #a855f7",
                borderRadius: 18,
                padding: "26px 10px 20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                boxShadow: "0 0 6px #a855f7, 0 0 18px #a855f7cc, 0 0 42px #a855f766, 0 0 72px #a855f728, inset 0 0 22px #a855f70d",
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1)")}
            >
              <div style={{ filter: "drop-shadow(0 0 8px #a855f7) drop-shadow(0 0 18px #a855f7)" }}>
                <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="24" r="18" stroke="#a855f7" strokeWidth="2.5" fill="rgba(168,85,247,0.08)"/>
                  <path d="M23 41C23 49 41 49 41 41" stroke="#a855f7" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <circle cx="32" cy="24" r="4" stroke="#a855f7" strokeWidth="1.8"/>
                  <circle cx="32" cy="24" r="9" stroke="#a855f7" strokeWidth="1.4" strokeDasharray="4 3"/>
                  <circle cx="32" cy="24" r="14" stroke="#a855f7" strokeWidth="1.1" strokeDasharray="3 4" opacity="0.7"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.4, textAlign: "center" }}>
                אישיות
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #a855f788",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#a855f7", fontSize: 15 }}>›</div>
            </div>
          </Link>

          {/* אבחון ומיון — orange */}
          <Link href="/course/course-assessment" style={{ textDecoration: "none" }}>
            <div
              style={{
                background: "linear-gradient(170deg, #120c06 0%, #0a0804 100%)",
                border: "2px solid #f97316",
                borderRadius: 18,
                padding: "26px 10px 20px",
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                boxShadow: "0 0 6px #f97316, 0 0 18px #f97316cc, 0 0 42px #f9731666, 0 0 72px #f9731628, inset 0 0 22px #f973160d",
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)")}
              onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.transform = "scale(1)")}
            >
              <div style={{ filter: "drop-shadow(0 0 8px #f97316) drop-shadow(0 0 18px #f97316)" }}>
                <svg width="68" height="68" viewBox="0 0 64 64" fill="none">
                  <rect x="8" y="12" width="40" height="46" rx="5" stroke="#f97316" strokeWidth="2.5" fill="rgba(249,115,22,0.07)"/>
                  <rect x="18" y="6" width="20" height="12" rx="4" stroke="#f97316" strokeWidth="2.5" fill="rgba(249,115,22,0.1)"/>
                  <rect x="14" y="26" width="9" height="9" rx="2" stroke="#f97316" strokeWidth="1.8" fill="none"/>
                  <path d="M16 30.5L19 33.5L24 27" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="27" y1="30" x2="42" y2="30" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round"/>
                  <rect x="14" y="39" width="9" height="9" rx="2" stroke="#f97316" strokeWidth="1.8" fill="none"/>
                  <path d="M16 43.5L19 46.5L24 40" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  <line x1="27" y1="43" x2="42" y2="43" stroke="#f97316" strokeWidth="1.8" strokeLinecap="round"/>
                  <circle cx="48" cy="48" r="12" stroke="#f97316" strokeWidth="2.5" fill="#080e1c"/>
                  <path d="M42 48L46 52L54 43" stroke="#f97316" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", lineHeight: 1.4, textAlign: "center" }}>
                אבחון ומיון
              </div>
              <div style={{ width: 28, height: 28, borderRadius: "50%", border: "1.5px solid #f9731688",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#f97316", fontSize: 15 }}>›</div>
            </div>
          </Link>

        </div>
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
