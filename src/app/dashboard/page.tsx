"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ClipboardList, Trophy, BookOpen, Flame, Star, Coins, TrendingUp, Zap } from "lucide-react"

interface UserData {
  name: string
  level: number
  coins: number
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

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 16px" }}>
      {/* Welcome */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
          שלום, {user.name} 👋
        </h1>
        <p style={{ color: "var(--muted)", marginTop: 6, fontSize: 15 }}>
          מוכן ללמוד היום?
        </p>
      </div>

      {/* Stats Row */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          { icon: Star, label: "רמה", value: user.level, color: "#6366f1", suffix: "" },
          { icon: Coins, label: "מטבעות", value: user.coins.toLocaleString(), color: "#10b981", suffix: "" },
          { icon: TrendingUp, label: "נקודות", value: user.totalPoints.toLocaleString(), color: "#6366f1", suffix: "" },
          { icon: Flame, label: "רצף", value: user.streak, color: "#f43f5e", suffix: " ימים" },
          { icon: ClipboardList, label: "מבחנים", value: user._count.testResults, color: "#60a5fa", suffix: "" },
        ].map(({ icon: Icon, label, value, color, suffix }) => (
          <div
            key={label}
            style={{
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 16,
              padding: "20px 16px",
              textAlign: "center",
            }}
          >
            <Icon size={24} color={color} style={{ marginBottom: 8 }} />
            <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}{suffix}</div>
            <div style={{ color: "var(--muted)", fontSize: 13, marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Action Cards */}
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>מה רוצה לעשות?</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        {[
          {
            href: "/practice",
            icon: Zap,
            title: "תרגול",
            desc: "תרגל שאלות עם משוב מיידי",
            color: "var(--primary)",
            bg: "rgba(99,102,241,0.08)",
          },
          {
            href: "/test",
            icon: ClipboardList,
            title: "מבחן",
            desc: "דמה מבחן אמיתי וקבל ציון",
            color: "var(--accent)",
            bg: "rgba(244,63,94,0.08)",
          },
          {
            href: "/leaderboard",
            icon: Trophy,
            title: "לידרבורד",
            desc: "ראה איפה אתה עומד",
            color: "#f59e0b",
            bg: "rgba(245,158,11,0.08)",
          },
          {
            href: "/profile",
            icon: TrendingUp,
            title: "הישגים",
            desc: "מעקב ההתקדמות שלך",
            color: "var(--success)",
            bg: "rgba(16,185,129,0.08)",
          },
        ].map(({ href, icon: Icon, title, desc, color, bg }) => (
          <Link
            key={href}
            href={href}
            style={{
              display: "block",
              background: bg,
              border: `1px solid ${color}33`,
              borderRadius: 16,
              padding: "24px 20px",
              textDecoration: "none",
              transition: "transform 0.2s, border-color 0.2s",
            }}
          >
            <Icon size={32} color={color} style={{ marginBottom: 12 }} />
            <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, color: "var(--foreground)" }}>
              {title}
            </div>
            <div style={{ fontSize: 14, color: "var(--muted)" }}>{desc}</div>
          </Link>
        ))}
      </div>

      {/* Recent Results */}
      {recentResults.length > 0 && (
        <>
          <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>מבחנים אחרונים</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {recentResults.slice(0, 5).map((r) => (
              <div
                key={r.id}
                style={{
                  background: "var(--card)",
                  border: "1px solid var(--card-border)",
                  borderRadius: 12,
                  padding: "14px 18px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <BookOpen size={18} color="var(--muted)" />
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{r.course.name}</div>
                    <div style={{ color: "var(--muted)", fontSize: 12 }}>
                      {r.correctAnswers}/{r.totalQuestions} נכון
                    </div>
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
        </>
      )}
    </div>
  )
}
