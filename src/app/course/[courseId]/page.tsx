"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect } from "react"
import Link from "next/link"

const COURSE_META: Record<string, { name: string; img: string; color: string }> = {
  "course-psychodiag": { name: "פסיכודיאגנוסטיקה",   img: "/icon-green.png",  color: "#22c55e" },
  "course-social":     { name: "פסיכולוגיה חברתית",   img: "/icon-yellow.png", color: "#eab308" },
  "course-iyut":       { name: "אישיות",               img: "/icon-purple.png", color: "#a855f7" },
  "course-assessment": { name: "אבחון ומיון",          img: "/icon-orange.png", color: "#f97316" },
}

export default function CoursePage() {
  const params = useParams()
  const router = useRouter()
  const { data: session, status } = useSession()
  const courseId = params.courseId as string
  const meta = COURSE_META[courseId]

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  if (!meta) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>קורס לא נמצא</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "40px 18px 120px", display: "flex", flexDirection: "column", alignItems: "center" }}>

      {/* Back */}
      <div style={{ alignSelf: "flex-start", marginBottom: 32 }}>
        <button
          onClick={() => router.push("/dashboard")}
          style={{ padding: "8px 18px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, color: "var(--muted)", cursor: "pointer", fontSize: 14 }}
        >
          ← חזור
        </button>
      </div>

      {/* Card image */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={meta.img}
        alt={meta.name}
        style={{ width: 180, borderRadius: 18, marginBottom: 28, boxShadow: `0 0 40px ${meta.color}44` }}
      />

      {/* Course name */}
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 8, textAlign: "center" }}>{meta.name}</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 36, textAlign: "center" }}>
        בחר את סוג הלמידה
      </p>

      {/* Mode buttons */}
      <div style={{ display: "flex", gap: 20, width: "100%", justifyContent: "center" }}>

        <Link href={`/practice?courseId=${courseId}`} style={{ textDecoration: "none", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/תרגול 4.png"
            alt="תרגול"
            style={{ width: "100%", display: "block", borderRadius: 18, cursor: "pointer", transition: "transform 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Link>

        <Link href={`/test?courseId=${courseId}`} style={{ textDecoration: "none", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/מבחן 4.png"
            alt="מבחן"
            style={{ width: "100%", display: "block", borderRadius: 18, cursor: "pointer", transition: "transform 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Link>

      </div>
    </div>
  )
}
