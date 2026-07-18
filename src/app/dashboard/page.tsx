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

const ALL_COURSES = [
  { id: "course-social",     img: "/icon-social.jpeg",     name: "פסיכולוגיה חברתית" },
  { id: "course-psychodiag", img: "/icon-psychodiag.jpg",  name: "פסיכודיאגנוסטיקה",  examDate: new Date("2026-08-07T09:00:00") },
  { id: "course-assessment", img: "/icon-assessment.jpeg", name: "אבחון ומיון",         examDate: new Date("2026-07-19T09:00:00") },
  { id: "course-iyut",       img: "/icon-iyut.jpeg",       name: "אישיות",              examDate: new Date("2026-07-24T09:00:00") },
  { id: "course-orgs",       img: "/icon-orgs.jpeg",       name: "ארגונים",             examDate: new Date("2026-07-29T09:00:00") },
  { id: "bonus", img: "", name: "שאלות בונוס", adminOnly: true },
] as { id: string; img: string; name: string; adminOnly?: boolean; examDate?: Date }[]

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

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, session, router])

  useEffect(() => {
    if (session?.user)
      fetch("/api/user/me").then(r => r.json()).then(setUser)
  }, [session])

  if (status === "loading" || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>טוען...</div>
      </div>
    )
  }

  const isAdmin = session?.user?.isAdmin ?? false

  const courses = ALL_COURSES.filter(c => isAdmin || !c.adminOnly)

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
              {img ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
              ) : (
                <div style={{ width: "100%", height: "100%", background: "linear-gradient(145deg, #0f0c1a, #1a0a2e 40%, #2d1854 70%, #1a0f35)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10, boxShadow: "inset 0 0 40px rgba(139,92,246,0.15)" }}>
                  <span style={{ fontSize: 32 }}>⭐</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "#f0ddb4", textAlign: "center", padding: "0 8px" }}>{name}</span>
                </div>
              )}
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
              {id === nextExamId && examDate ? <Countdown examDate={examDate} /> : id !== "bonus" && (!examDate || examDate.getTime() <= Date.now()) ? <div style={{ textAlign: "center", fontSize: 18, color: "#22c55e", fontWeight: 700 }}>✓</div> : null}
            </div>
          )

          const href = id === "bonus" ? "/bonus" : `/course/${id}`

          return locked ? (
            <div key={id}>{wrapper}</div>
          ) : (
            <Link key={id} href={href} style={{ textDecoration: "none", display: "block" }}>
              {wrapper}
            </Link>
          )
        })}
      </div>

    </div>
  )
}
