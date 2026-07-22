"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserData {
  name: string
  isPaid: boolean
  isSocialLocked: boolean
}

interface StatsData {
  next: { id: string; name: string; date: string } | null
  weakTopics: { topic: string; total: number; correct: number; pct: number }[]
  hardQuestions: { id: string; question: string; topic: string; total: number; wrong: number; pct: number }[]
}

const ALL_COURSES = [
  { id: "course-social",     img: "/icon-social.jpeg",     name: "פסיכולוגיה חברתית" },
  { id: "course-psychodiag", img: "/icon-psychodiag.jpg",  name: "פסיכודיאגנוסטיקה",  examDate: new Date("2026-08-07T09:00:00") },
  { id: "course-assessment", img: "/icon-assessment.jpeg", name: "אבחון ומיון",         examDate: new Date("2026-07-19T09:00:00") },
  { id: "course-iyut",       img: "/icon-iyut.jpeg",       name: "אישיות",              examDate: new Date("2026-07-24T09:00:00") },
  { id: "course-orgs",       img: "/icon-orgs.jpeg",       name: "ארגונים",             examDate: new Date("2026-07-29T09:00:00") },
] as { id: string; img: string; name: string; adminOnly?: boolean; paidOnly?: boolean; examDate?: Date }[]

function useNow() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

function Countdown({ examDate }: { examDate: Date }) {
  const now = useNow()
  const diff = examDate.getTime() - now.getTime()

  if (diff <= 0) {
    return <div style={{ textAlign: "center", fontSize: 18, color: "#22c55e", fontWeight: 700 }}>✓</div>
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  const secs = Math.floor((diff % (1000 * 60)) / 1000)
  const d = examDate.getDate()
  const m = examDate.getMonth() + 1
  const dateStr = `${d}/${m}`

  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontSize: 10, color: "#c8b99a", marginBottom: 3 }}>{dateStr} | 09:00</div>
      <div style={{ fontSize: 12, fontWeight: 700, color: "#f0ddb4", letterSpacing: 1 }}>
        {days > 0 ? `${days}D ` : ""}{String(hours).padStart(2, "0")}:{String(mins).padStart(2, "0")}:{String(secs).padStart(2, "0")}
      </div>
    </div>
  )
}

const TOPIC_MEDALS = ["🥇", "🥈", "🥉"]

function StatsPanel({ stats }: { stats: StatsData | null }) {
  if (!stats) {
    return (
      <div style={{
        background: "linear-gradient(140deg, var(--card) 0%, #0f0c1a 100%)",
        border: "1px solid rgba(124,58,237,0.2)",
        borderRadius: 16,
        padding: "16px 18px",
        textAlign: "center",
      }}>
        <div style={{ fontSize: 12, color: "var(--muted)" }}>טוען סטטיסטיקות...</div>
      </div>
    )
  }

  if (!stats.next) {
    return null
  }

  const d = new Date(stats.next.date)
  const dateStr = `${d.getDate()}/${d.getMonth() + 1}`
  const hasData = stats.weakTopics.length > 0 || stats.hardQuestions.length > 0

  return (
    <div style={{
      background: "linear-gradient(140deg, #0a0712 0%, #110d20 100%)",
      border: "1px solid rgba(124,58,237,0.28)",
      borderRadius: 16,
      padding: "16px 18px",
      boxShadow: "0 0 32px rgba(124,58,237,0.08)",
    }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
        <div>
          <div style={{ fontSize: 13, fontWeight: 800, color: "#c4b5fd" }}>סטטיסטיקות הכיתה</div>
          <div style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
            {stats.next.name} · מבחן {dateStr}
          </div>
        </div>
        <span style={{ fontSize: 20 }}>📊</span>
      </div>

      {!hasData ? (
        <div style={{ textAlign: "center", padding: "12px 0", fontSize: 12, color: "var(--muted)" }}>
          מתמלא כשמשתמשים מתרגלים
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Weak topics */}
          {stats.weakTopics.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(167,139,250,0.7)", marginBottom: 8, letterSpacing: 0.3 }}>
                נושאים לחיזוק
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                {stats.weakTopics.map((t, i) => (
                  <div key={t.topic} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, flexShrink: 0 }}>{TOPIC_MEDALS[i]}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 3 }}>
                        <span style={{ fontSize: 11, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{t.topic}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: t.pct < 50 ? "#ef4444" : "#f97316", flexShrink: 0, marginRight: 6 }}>{t.pct}%</span>
                      </div>
                      <div style={{ height: 4, background: "rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${t.pct}%`, background: t.pct < 50 ? "#ef4444" : "#f97316", borderRadius: 4, transition: "width 0.6s" }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hard questions */}
          {stats.hardQuestions.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "rgba(167,139,250,0.7)", marginBottom: 8, letterSpacing: 0.3 }}>
                שאלות קשות
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {stats.hardQuestions.map((q, i) => (
                  <div key={q.id} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
                    <span style={{ fontSize: 11, fontWeight: 800, color: "#7c3aed", minWidth: 16, paddingTop: 1 }}>{i + 1}.</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 11, color: "var(--foreground)", lineHeight: 1.4, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                        {q.question}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 3 }}>
                        <span style={{ fontSize: 10, color: "rgba(167,139,250,0.6)", background: "rgba(124,58,237,0.1)", padding: "1px 6px", borderRadius: 4 }}>{q.topic}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color: "#ef4444" }}>{q.pct}% דיוק</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      )}
    </div>
  )
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)
  const [stats, setStats] = useState<StatsData | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, session, router])

  useEffect(() => {
    if (session?.user)
      fetch("/api/user/me").then(r => r.json()).then(setUser)
  }, [session])

  useEffect(() => {
    if (!user) return
    const isAdmin = session?.user?.isAdmin ?? false
    if (!isAdmin && !user.isPaid) return
    fetch("/api/stats").then(r => r.json()).then(setStats)
  }, [user, session])

  if (status === "loading" || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>טוען...</div>
      </div>
    )
  }

  const isAdmin = session?.user?.isAdmin ?? false
  const isPaid = user?.isPaid ?? false
  const courses = ALL_COURSES.filter(c => {
    if (c.adminOnly) return isAdmin
    if (c.paidOnly) return isAdmin || isPaid
    return true
  })

  const nextExamId = (() => {
    const now = Date.now()
    return courses
      .filter(c => c.examDate && c.examDate.getTime() > now)
      .sort((a, b) => a.examDate!.getTime() - b.examDate!.getTime())[0]?.id ?? null
  })()

  function isLocked(courseId: string): boolean {
    if (isAdmin) return false
    if (courseId === "course-social") return user?.isSocialLocked ?? false
    return !(user?.isPaid ?? false)
  }

  return (
    <div style={{ padding: "32px 18px 140px" }}>

      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 28px", lineHeight: 1.2 }}>
        שלום, {user.name}
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        maxWidth: 520,
        margin: "0 auto",
      }}>
        {courses.map(({ id, img, name, examDate }) => {
          const locked = isLocked(id)
          const card = (
            <div
              style={{
                width: "100%",
                aspectRatio: "160 / 257",
                overflow: "hidden",
                borderRadius: 14,
                cursor: locked ? "default" : "pointer",
                transition: "transform 0.15s ease",
                background: "transparent",
                position: "relative",
              }}
              onMouseEnter={e => { if (!locked) (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
              {locked && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(2,5,9,0.62)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  borderRadius: 14,
                }}>
                  <span style={{ fontSize: 28 }}>🔒</span>
                </div>
              )}
            </div>
          )

          const wrapper = (
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {card}
              {id === nextExamId && examDate ? <Countdown examDate={examDate} /> : (!examDate || examDate.getTime() <= Date.now()) ? <div style={{ textAlign: "center", fontSize: 18, color: "#22c55e", fontWeight: 700 }}>✓</div> : null}
            </div>
          )

          return locked ? (
            <div key={id}>{wrapper}</div>
          ) : (
            <Link key={id} href={`/course/${id}`} style={{ textDecoration: "none", display: "block" }}>
              {wrapper}
            </Link>
          )
        })}
      </div>

      {(isAdmin || isPaid) && (
        <div style={{ maxWidth: 520, margin: "18px auto 0" }}>
          <StatsPanel stats={stats} />
        </div>
      )}

    </div>
  )
}
