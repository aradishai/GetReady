"use client"

import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import Link from "next/link"

function useMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640)
    check()
    window.addEventListener("resize", check)
    return () => window.removeEventListener("resize", check)
  }, [])
  return isMobile
}

const COURSE_META: Record<string, { name: string; img: string; color: string }> = {
  "course-psychodiag": { name: "פסיכודיאגנוסטיקה",  img: "/icon-psychodiag.jpg",  color: "#22c55e" },
  "course-social":     { name: "פסיכולוגיה חברתית",  img: "/icon-social.jpeg",     color: "#f97316" },
  "course-iyut":       { name: "אישיות",              img: "/icon-iyut.jpeg",        color: "#a855f7" },
  "course-assessment": { name: "אבחון ומיון",         img: "/icon-assessment.jpeg", color: "#eab308" },
  "course-chevrot":    { name: "חברות בישראל",        img: "/icon-chevrot.jpg",     color: "#ef4444" },
  "course-orgs":       { name: "ארגונים",             img: "/icon-orgs.jpeg",       color: "#38bdf8" },
}

interface CourseResult {
  id: string
  score: number
  totalQuestions: number
  correctAnswers: number
  createdAt: string
  course: { name: string }
}

export default function CoursePage() {
  const params   = useParams()
  const router   = useRouter()
  const { data: session, status } = useSession()
  const courseId = params.courseId as string
  const meta     = COURSE_META[courseId]
  const isMobile = useMobile()

  const [results,       setResults]       = useState<CourseResult[]>([])
  const [loading,       setLoading]       = useState(true)
  const [totalQ,        setTotalQ]        = useState(0)
  const [practiceDone,  setPracticeDone]  = useState(0)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    // payment gate disabled
  }, [status, session, router])

  useEffect(() => {
    if (!session?.user) return
    fetch(`/api/results?courseId=${courseId}`)
      .then(r => r.json())
      .then(data => { setResults(Array.isArray(data) ? data : []); setLoading(false) })
    fetch(`/api/questions?courseId=${courseId}&countOnly=true`)
      .then(r => r.json())
      .then(d => setTotalQ(d.count ?? 0))
    const done: string[] = JSON.parse(localStorage.getItem(`practice_done_${courseId}`) || "[]")
    setPracticeDone(done.length)
  }, [session, courseId])

  if (!meta) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>קורס לא נמצא</div>
      </div>
    )
  }

  const avgScore     = results.length ? Math.round(results.reduce((a, r) => a + r.score, 0) / results.length) : 0
  const coursePoints = results.reduce((a, r) => a + r.correctAnswers * 4, 0)
  const courseLevel  = Math.floor(coursePoints / 50) + 1
  const lastResult   = results[0] ?? null

  const SEP = <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 10px", fontWeight: 300 }}>|</span>

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: isMobile ? "12px 12px 60px" : "20px 18px 80px" }}>

      {/* Back */}
      <button
        onClick={() => router.push("/dashboard")}
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 10,
          color: "var(--foreground)",
          cursor: "pointer",
          fontSize: isMobile ? 13 : 14,
          fontWeight: 600,
          padding: isMobile ? "7px 14px" : "9px 18px",
          marginBottom: isMobile ? 14 : 16,
        }}
      >
        חזרה לקורסים
      </button>

      {/* Course header */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 14, marginBottom: isMobile ? 16 : 20 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.img} alt={meta.name} style={{ width: isMobile ? 52 : 60, borderRadius: isMobile ? 10 : 12, flexShrink: 0 }} />
        <div>
          <h1 style={{ fontSize: isMobile ? 20 : 22, fontWeight: 800, margin: 0 }}>{meta.name}</h1>
        </div>
      </div>

      {/* Stats bar */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        direction: "ltr",
        fontSize: isMobile ? 14 : 15,
        marginBottom: isMobile ? 14 : 14,
        letterSpacing: 0.1,
        flexWrap: "wrap",
        gap: "4px 0",
      }}>
        <span style={{ color: meta.color, fontWeight: 800, fontSize: isMobile ? 20 : 22 }}>{coursePoints}</span>
        <span style={{ color: "var(--muted)", marginLeft: 5 }}>נקודות</span>
        {SEP}
        <span style={{ color: meta.color, fontWeight: 800, fontSize: isMobile ? 20 : 22 }}>{courseLevel}</span>
        <span style={{ color: "var(--muted)", marginLeft: 5 }}>רמה</span>
        {SEP}
        <span style={{ color: meta.color, fontWeight: 800, fontSize: isMobile ? 20 : 22 }}>{results.length > 0 ? `${avgScore}%` : "—"}</span>
        <span style={{ color: "var(--muted)", marginLeft: 5 }}>ממוצע</span>
      </div>

      {/* Progress card */}
      <div style={{
        background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
        border: `1.5px solid ${meta.color}55`,
        borderRadius: isMobile ? 14 : 20,
        padding: isMobile ? "14px 14px" : "16px 18px",
        marginBottom: isMobile ? 12 : 14,
        boxShadow: `0 0 32px ${meta.color}18`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: isMobile ? 11 : 13, color: "var(--muted)" }}>
            {lastResult ? `${lastResult.correctAnswers}/${lastResult.totalQuestions} במבחן האחרון` : "התחל להיבחן כדי לעקוב"}
          </span>
          <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: meta.color }}>{results.length > 0 ? `${avgScore}%` : "—"}</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, height: isMobile ? 7 : 10, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${avgScore}%`,
            background: `linear-gradient(90deg, ${meta.color}cc, ${meta.color})`,
            borderRadius: 8,
            transition: "width 0.8s ease",
          }} />
        </div>
      </div>

      {/* Practice progress */}
      {totalQ > 0 && (
        <div style={{
          background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
          border: "1.5px solid rgba(255,255,255,0.07)",
          borderRadius: isMobile ? 14 : 20,
          padding: isMobile ? "14px 14px" : "22px 22px",
          marginBottom: isMobile ? 12 : 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: isMobile ? 11 : 13, color: "var(--muted)" }}>תרגול — שאלות שנפתרו</span>
            <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "var(--foreground)" }}>
              {practiceDone} / {totalQ}
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, height: isMobile ? 7 : 10, overflow: "hidden" }}>
            <div style={{
              height: "100%",
              width: `${totalQ > 0 ? Math.round((practiceDone / totalQ) * 100) : 0}%`,
              background: "linear-gradient(90deg, #c8b99a, #f0ddb4)",
              borderRadius: 8,
              transition: "width 0.8s ease",
            }} />
          </div>
        </div>
      )}

      {/* Mode buttons */}
      <div style={{ display: "flex", gap: isMobile ? 10 : 12, marginBottom: isMobile ? 16 : 20 }}>
        <Link href={`/practice?courseId=${courseId}`} style={{ textDecoration: "none", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/תרגול 4.png"
            alt="תרגול"
            style={{ width: "100%", display: "block", borderRadius: isMobile ? 12 : 18, cursor: "pointer", transition: "transform 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Link>
        <Link href={`/test?courseId=${courseId}`} style={{ textDecoration: "none", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/מבחן 4.png"
            alt="מבחן"
            style={{ width: "100%", display: "block", borderRadius: isMobile ? 12 : 18, cursor: "pointer", transition: "transform 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Link>
      </div>


    </div>
  )
}
