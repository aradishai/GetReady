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
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 44, textAlign: "center" }}>
        בחר את סוג הלמידה
      </p>

      {/* Mode buttons */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, width: "100%" }}>

        {/* Practice */}
        <Link
          href={`/practice?courseId=${courseId}`}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              background: "var(--card)",
              border: `1.5px solid ${meta.color}55`,
              borderRadius: 20,
              padding: "24px 28px",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: `0 0 20px ${meta.color}18`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${meta.color}44`; (e.currentTarget as HTMLDivElement).style.borderColor = meta.color }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${meta.color}18`; (e.currentTarget as HTMLDivElement).style.borderColor = `${meta.color}55` }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>✏️</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>תרגול</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              שאלה אחת בכל פעם עם הסבר מיידי. לא נשמר כמבחן.
            </div>
          </div>
        </Link>

        {/* Test */}
        <Link
          href={`/test?courseId=${courseId}`}
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
              background: "var(--card)",
              border: `1.5px solid ${meta.color}55`,
              borderRadius: 20,
              padding: "24px 28px",
              cursor: "pointer",
              transition: "all 0.2s",
              boxShadow: `0 0 20px ${meta.color}18`,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 32px ${meta.color}44`; (e.currentTarget as HTMLDivElement).style.borderColor = meta.color }}
            onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.boxShadow = `0 0 20px ${meta.color}18`; (e.currentTarget as HTMLDivElement).style.borderColor = `${meta.color}55` }}
          >
            <div style={{ fontSize: 22, marginBottom: 6 }}>📝</div>
            <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 6 }}>מבחן</div>
            <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>
              25 שאלות ללא הסברים באמצע. התוצאה נשמרת בפרופיל שלך.
            </div>
          </div>
        </Link>

      </div>
    </div>
  )
}
