"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Star, Coins, Flame, ClipboardList, TrendingUp } from "lucide-react"

interface UserData {
  name: string
  email: string
  level: number
  coins: number
  totalPoints: number
  streak: number
  createdAt: string
  achievements: { id: string; type: string; unlockedAt: string }[]
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

const ACHIEVEMENT_META: Record<string, { label: string; icon: string }> = {
  first_test: { label: "מבחן ראשון", icon: "📝" },
  streak_3: { label: "רצף 3 ימים", icon: "🔥" },
  streak_7: { label: "שבוע שלם", icon: "📅" },
  correct_10: { label: "10 נכונות ברצף", icon: "🎯" },
  score_100: { label: "100% במבחן", icon: "💯" },
  questions_100: { label: "100 שאלות", icon: "📚" },
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [results, setResults] = useState<TestResult[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isPaid) {
      fetch("/api/user/me").then((r) => r.json()).then(setUser)
      fetch("/api/results").then((r) => r.json()).then(setResults)
    }
  }, [session])

  if (!user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>טוען...</div>
      </div>
    )
  }

  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length)
    : 0

  return (
    <div style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px" }}>
      {/* Profile Header */}
      <div
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 20,
          padding: 28,
          display: "flex",
          alignItems: "center",
          gap: 20,
          marginBottom: 24,
        }}
      >
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            background: `hsl(${(user.name.charCodeAt(0) * 50) % 360}, 60%, 50%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 32,
            fontWeight: 700,
            color: "#fff",
            flexShrink: 0,
          }}
        >
          {user.name[0]}
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>{user.name}</h1>
          <p style={{ color: "var(--muted)", margin: "4px 0 0", fontSize: 14 }}>{user.email}</p>
          <p style={{ color: "var(--muted)", margin: "2px 0 0", fontSize: 13 }}>
            חבר מ-{new Date(user.createdAt).toLocaleDateString("he-IL")}
          </p>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 900, color: "var(--primary)" }}>רמה {user.level}</div>
        </div>
      </div>

      {/* Stats */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
          gap: 12,
          marginBottom: 24,
        }}
      >
        {[
          { icon: Star, label: "רמה", value: user.level, color: "var(--primary)" },
          { icon: Coins, label: "מטבעות", value: user.coins.toLocaleString(), color: "var(--success)" },
          { icon: TrendingUp, label: "נקודות", value: user.totalPoints.toLocaleString(), color: "#6366f1" },
          { icon: Flame, label: "רצף", value: `${user.streak} ימים`, color: "#f43f5e" },
          { icon: ClipboardList, label: "מבחנים", value: user._count.testResults, color: "#60a5fa" },
          { icon: TrendingUp, label: "ממוצע", value: `${avgScore}%`, color: avgScore >= 80 ? "var(--success)" : "var(--warning)" },
        ].map(({ icon: Icon, label, value, color }) => (
          <div
            key={label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 14,
              padding: "16px",
              textAlign: "center",
            }}
          >
            <Icon size={20} color={color} style={{ marginBottom: 6 }} />
            <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
            <div style={{ color: "var(--muted)", fontSize: 12 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Achievements */}
      {user.achievements.length > 0 && (
        <div
          style={{
            background: "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 16,
            padding: 20,
            marginBottom: 24,
          }}
        >
          <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 16 }}>הישגים 🏅</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {user.achievements.map((a) => {
              const meta = ACHIEVEMENT_META[a.type] || { label: a.type, icon: "⭐" }
              return (
                <div
                  key={a.id}
                  style={{
                    background: "rgba(245,158,11,0.1)",
                    border: "1px solid rgba(245,158,11,0.3)",
                    borderRadius: 10,
                    padding: "8px 14px",
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--warning)",
                  }}
                >
                  {meta.icon} {meta.label}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Recent Results */}
      {results.length > 0 && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 14, fontSize: 16 }}>מבחנים אחרונים</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {results.map((r) => (
              <div
                key={r.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 12,
                  padding: "12px 16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.course.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>
                    {new Date(r.createdAt).toLocaleDateString("he-IL")} •{" "}
                    {r.correctAnswers}/{r.totalQuestions} נכון
                  </div>
                </div>
                <div
                  style={{
                    fontSize: 20,
                    fontWeight: 700,
                    color: r.score >= 80 ? "var(--success)" : r.score >= 60 ? "var(--warning)" : "var(--danger)",
                  }}
                >
                  {r.score}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
