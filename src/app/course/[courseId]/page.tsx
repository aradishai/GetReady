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
  const [practiceRec,   setPracticeRec]   = useState({ bestStreak: 0, bestSession: 0 })
  const [topicStats,    setTopicStats]    = useState<{ topic: string; total: number; correct: number; pct: number | null }[]>([])

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
    const localPr = JSON.parse(localStorage.getItem(`practice_records_${courseId}`) || "{}")
    if (localPr.bestStreak) setPracticeRec({ bestStreak: localPr.bestStreak, bestSession: localPr.bestSession || 0 })

    fetch(`/api/practice/topic-stats?courseId=${courseId}`)
      .then(r => r.json())
      .then(d => {
        setTopicStats(Array.isArray(d.topics) ? d.topics : [])
        setPracticeDone(d.practiceDone ?? 0)
        setPracticeRec({
          bestStreak: Math.max(d.bestStreak ?? 0, localPr.bestStreak ?? 0),
          bestSession: Math.max(d.bestSession ?? 0, localPr.bestSession ?? 0),
        })
      })
  }, [session, courseId])

  if (!meta) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>קורס לא נמצא</div>
      </div>
    )
  }

  const last3        = results.slice(0, 3)
  const avgScore     = last3.length ? Math.round(last3.reduce((a, r) => a + r.score, 0) / last3.length) : 0
  const coursePoints   = results.reduce((a, r) => a + r.correctAnswers * 4, 0)
  const levelThreshold = totalQ > 0 ? Math.max(1, Math.floor(totalQ / 10)) : 1
  const courseLevel    = practiceRec.bestStreak > 0 ? Math.ceil(practiceRec.bestStreak / levelThreshold) : 1
  const lastResult   = results[0] ?? null

  const SEP = <span style={{ color: "rgba(255,255,255,0.12)", margin: isMobile ? "0 6px" : "0 10px", fontWeight: 300 }}>|</span>

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: isMobile ? "12px 12px 60px" : "10px 18px 16px" }}>

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
          marginBottom: isMobile ? 14 : 8,
        }}
      >
        חזרה לקורסים
      </button>

      {/* Course header */}
      <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 12 : 12, marginBottom: isMobile ? 16 : 10 }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={meta.img} alt={meta.name} style={{ width: isMobile ? 52 : 52, borderRadius: isMobile ? 10 : 10, flexShrink: 0 }} />
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
        fontSize: isMobile ? 12 : 15,
        marginBottom: isMobile ? 14 : 8,
        letterSpacing: 0.1,
        flexWrap: "nowrap",
        overflowX: "hidden",
      }}>
        <span style={{ whiteSpace: "nowrap" }}>
          <span style={{ color: meta.color, fontWeight: 800, fontSize: isMobile ? 17 : 22 }}>{courseLevel}</span>
          <span style={{ color: "var(--muted)", marginLeft: 4 }}>רמה</span>
        </span>
        {SEP}
        <span style={{ whiteSpace: "nowrap" }}>
          <span style={{ color: meta.color, fontWeight: 800, fontSize: isMobile ? 17 : 22 }}>{results.length > 0 ? `${avgScore}%` : "—"}</span>
          <span style={{ color: "var(--muted)", marginLeft: 4 }}>ממוצע 3 אחרונים</span>
        </span>
        {practiceRec.bestStreak > 0 && <>
          {SEP}
          <span style={{ whiteSpace: "nowrap" }}>
            <span style={{ color: meta.color, fontWeight: 800, fontSize: isMobile ? 17 : 22 }}>{practiceRec.bestStreak}</span>
            <span style={{ color: "var(--muted)", marginLeft: 4 }}>שיא רצף תרגול</span>
          </span>
        </>}
      </div>

      {/* Progress card */}
      <div style={{
        background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
        border: `1.5px solid ${meta.color}55`,
        borderRadius: isMobile ? 14 : 20,
        padding: isMobile ? "14px 14px" : "10px 16px",
        marginBottom: isMobile ? 12 : 8,
        boxShadow: `0 0 32px ${meta.color}18`,
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <span style={{ fontSize: isMobile ? 11 : 13, color: "var(--muted)" }}>
            {lastResult ? `${lastResult.correctAnswers}/${lastResult.totalQuestions} במבחן האחרון` : "התחל להיבחן כדי לעקוב"}
          </span>
          <span style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: meta.color }}>{results.length > 0 ? `${avgScore}%` : "—"}</span>
        </div>
        <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, height: 7, overflow: "hidden" }}>
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
          borderRadius: isMobile ? 14 : 14,
          padding: isMobile ? "14px 14px" : "10px 16px",
          marginBottom: isMobile ? 10 : 8,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <span style={{ fontSize: isMobile ? 11 : 13, color: "var(--muted)" }}>תרגול — שאלות שנפתרו</span>
            <span style={{ fontSize: isMobile ? 14 : 16, fontWeight: 800, color: "var(--foreground)" }}>
              {practiceDone} / {totalQ}
            </span>
          </div>
          <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 8, height: 7, overflow: "hidden" }}>
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

      {/* Topic stats */}
      {topicStats.length > 0 && (
        <div style={{
          background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
          border: "1.5px solid rgba(255,255,255,0.07)",
          borderRadius: isMobile ? 14 : 14,
          padding: isMobile ? "12px 14px" : "10px 16px",
          marginBottom: isMobile ? 10 : 8,
        }}>
          <div style={{ fontSize: isMobile ? 11 : 13, color: "var(--muted)", marginBottom: 10 }}>ביצועים לפי נושא — לחץ לתרגול ממוקד</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            {topicStats.map(s => {
              const pct = s.pct
              const practiced = pct !== null
              const color = pct === null ? "var(--muted)" : pct >= 90 ? "var(--success)" : pct >= 45 ? "var(--warning)" : "var(--danger)"
              return (
                <button
                  key={s.topic}
                  onClick={() => router.push(`/practice?courseId=${courseId}&topics=${encodeURIComponent(s.topic)}`)}
                  style={{
                    display: "flex", alignItems: "center", gap: 10,
                    background: "transparent", border: "none", cursor: "pointer",
                    padding: "4px 0", width: "100%", textAlign: "right",
                    opacity: practiced ? 1 : 0.5,
                  }}
                >
                  <div style={{ flex: 1, fontSize: isMobile ? 12 : 13, color: "var(--foreground)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{s.topic}</div>
                  {pct !== null ? (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, color, minWidth: 34, textAlign: "left" }}>{pct}%</div>
                      <div style={{ width: 80, background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 5, overflow: "hidden", flexShrink: 0 }}>
                        <div style={{ height: "100%", width: `${pct}%`, background: color, borderRadius: 4, transition: "width 0.6s ease" }} />
                      </div>
                    </>
                  ) : (
                    <>
                      <div style={{ fontSize: 11, color: "var(--muted)", minWidth: 34, textAlign: "left" }}>—</div>
                      <div style={{ width: 80, background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 5, flexShrink: 0 }} />
                    </>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Mode buttons */}
      <div style={{ display: "flex", gap: isMobile ? 10 : 10, marginBottom: courseId === "course-assessment" || courseId === "course-orgs" ? 10 : 0 }}>
        <Link href={`/practice?courseId=${courseId}`} style={{ textDecoration: "none", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/תרגול 4.webp"
            alt="תרגול"
            style={{ width: "100%", display: "block", borderRadius: isMobile ? 12 : 18, cursor: "pointer", transition: "transform 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Link>
        <Link href={`/test?courseId=${courseId}`} style={{ textDecoration: "none", flex: 1 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/מבחן 4.webp"
            alt="מבחן"
            style={{ width: "100%", display: "block", borderRadius: isMobile ? 12 : 18, cursor: "pointer", transition: "transform 0.15s ease" }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
          />
        </Link>
      </div>

      {courseId === "course-orgs" && (
        <Link href="/course/course-orgs/lifecycle" style={{ textDecoration: "none", display: "block", marginBottom: 10 }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: isMobile ? "13px 16px" : "14px 20px",
            borderRadius: isMobile ? 12 : 14,
            background: "linear-gradient(135deg, #0c1f2e 0%, #071826 100%)",
            border: "1px solid rgba(56,189,248,0.3)",
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(56,189,248,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)")}
          >
            <span style={{ fontSize: isMobile ? 22 : 24 }}>🔄</span>
            <div>
              <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: "#7dd3fc" }}>תרגולים — מחזור החיים הארגוני</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: "var(--muted)", marginTop: 2 }}>סידור ציר זמן ומילוי פרטים לפי רמת קושי</div>
            </div>
            <span style={{ marginRight: "auto", fontSize: 16, color: "rgba(125,211,252,0.6)" }}>←</span>
          </div>
        </Link>
      )}

      {courseId === "course-assessment" && (
        <Link href="/course/course-assessment/mmpi" style={{ textDecoration: "none", display: "block" }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: isMobile ? "13px 16px" : "14px 20px",
            borderRadius: isMobile ? 12 : 14,
            background: "linear-gradient(135deg, #1e1535 0%, #130d2b 100%)",
            border: "1px solid rgba(124,58,237,0.35)",
            cursor: "pointer",
            transition: "border-color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.7)")}
            onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(124,58,237,0.35)")}
          >
            <span style={{ fontSize: isMobile ? 22 : 24 }}>🧠</span>
            <div>
              <div style={{ fontSize: isMobile ? 13 : 14, fontWeight: 700, color: "#c4b5fd" }}>תרגול זיכרון — סקאלות MMPI</div>
              <div style={{ fontSize: isMobile ? 11 : 12, color: "var(--muted)", marginTop: 2 }}>התאם מספרי סקאלה להגדרות</div>
            </div>
            <span style={{ marginRight: "auto", fontSize: 16, color: "rgba(167,139,250,0.6)" }}>←</span>
          </div>
        </Link>
      )}

    </div>
  )
}
