"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

interface Question {
  id: string
  question: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  correctAnswer: string
  topic: string
  difficulty: string
}

type Answer = "A" | "B" | "C" | "D"
type Phase = "setup" | "test" | "submitting"

const QUESTION_COUNT = 25

const DIFFICULTY_OPTIONS = [
  { value: "all",    label: "כל הרמות" },
  { value: "Easy",   label: "קל" },
  { value: "Medium", label: "בינוני" },
  { value: "Hard",   label: "קשה" },
]
const TIME_OPTIONS = [
  { value: 0,  label: "ללא הגבלה" },
  { value: 30, label: "30 שניות" },
  { value: 60, label: "60 שניות" },
  { value: 90, label: "90 שניות" },
]

export default function TestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId") || ""

  const [phase, setPhase]               = useState<Phase>("setup")
  const [difficulty, setDifficulty]     = useState("all")
  const [timeLimitPerQ, setTimeLimitPerQ] = useState(0)

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers]     = useState<Record<number, Answer>>({})
  const [current, setCurrent]     = useState(0)
  const [loading, setLoading]     = useState(false)
  const [timeLeft, setTimeLeft]   = useState<number | null>(null)
  const startTime = useRef(Date.now())

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  // Timer — resets on every question change
  useEffect(() => {
    if (phase !== "test" || timeLimitPerQ === 0) return
    setTimeLeft(timeLimitPerQ)
    const interval = setInterval(() => {
      setTimeLeft(t => {
        if (t !== null && t > 1) return t - 1
        clearInterval(interval)
        setCurrent(c => (c < questions.length - 1 ? c + 1 : c))
        return 0
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [current, phase, timeLimitPerQ, questions.length])

  async function startTest() {
    setLoading(true)
    const params = new URLSearchParams({
      limit: String(QUESTION_COUNT),
      ...(courseId && { courseId }),
      ...(difficulty !== "all" && { difficulty }),
    })
    const data = await fetch(`/api/questions?${params}`).then(r => r.json())
    setQuestions(Array.isArray(data) ? data : [])
    setAnswers({})
    setCurrent(0)
    startTime.current = Date.now()
    setLoading(false)
    setPhase("test")
  }

  function selectAnswer(key: Answer) {
    setAnswers(a => ({ ...a, [current]: key }))
  }

  async function submitTest() {
    setPhase("submitting")
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000)
    const answersPayload = questions.map((q, i) => ({
      questionId: q.id,
      userAnswer: answers[i] || "A",
      isCorrect: (answers[i] || "A") === q.correctAnswer,
    }))
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: courseId || questions[0]?.id, answers: answersPayload, timeSpent }),
    })
    const result = await res.json()
    if (result.resultId) router.push(`/results/${result.resultId}`)
  }

  /* ── SETUP SCREEN ── */
  if (phase === "setup") {
    const btnBase = (active: boolean): React.CSSProperties => ({
      padding: "10px 20px",
      borderRadius: 10,
      border: `2px solid ${active ? "var(--primary)" : "var(--card-border)"}`,
      background: active ? "rgba(56,189,248,0.1)" : "var(--card)",
      color: active ? "var(--primary)" : "var(--foreground)",
      cursor: "pointer",
      fontSize: 14,
      fontWeight: active ? 700 : 400,
    })

    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "48px 24px" }}>
        <button
          onClick={() => router.push(courseId ? `/course/${courseId}` : "/dashboard")}
          style={{ padding: "9px 18px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, color: "var(--foreground)", cursor: "pointer", fontSize: 14, marginBottom: 32 }}
        >
          חזרה לקורס
        </button>

        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 32 }}>הגדרות מבחן</h1>

        {/* Difficulty */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>רמת קושי</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {DIFFICULTY_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setDifficulty(opt.value)} style={btnBase(difficulty === opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time per question */}
        <div style={{ marginBottom: 40 }}>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>זמן לשאלה</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {TIME_OPTIONS.map(opt => (
              <button key={opt.value} onClick={() => setTimeLimitPerQ(opt.value)} style={btnBase(timeLimitPerQ === opt.value)}>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={startTest}
          disabled={loading}
          style={{ width: "100%", padding: "16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: loading ? "wait" : "pointer" }}
        >
          {loading ? "טוען שאלות..." : "התחל מבחן"}
        </button>
      </div>
    )
  }

  if (phase === "submitting") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "#fff" }}>שומר תוצאות...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "60px 16px", textAlign: "center" }}>
        <p style={{ color: "#fff", fontSize: 18 }}>אין שאלות זמינות לקורס זה עדיין.</p>
        <button onClick={() => setPhase("setup")} style={{ marginTop: 20, padding: "12px 24px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15 }}>
          חזור להגדרות
        </button>
      </div>
    )
  }

  /* ── TEST SCREEN ── */
  const q = questions[current]
  const answersObj: { key: Answer; label: string; text: string }[] = [
    { key: "A", label: "א", text: q.answerA },
    { key: "B", label: "ב", text: q.answerB },
    { key: "C", label: "ג", text: q.answerC },
    { key: "D", label: "ד", text: q.answerD },
  ]

  const timerPct = timeLimitPerQ > 0 && timeLeft !== null ? (timeLeft / timeLimitPerQ) * 100 : 100
  const timerColor = timeLeft !== null && timeLeft <= 10 ? "var(--danger)" : timeLeft !== null && timeLeft <= 20 ? "var(--warning)" : "var(--success)"

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px", color: "#fff" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={() => router.push(courseId ? `/course/${courseId}` : "/dashboard")}
          style={{ padding: "11px 24px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 17 }}
        >
          חזור
        </button>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          {timeLeft !== null && timeLimitPerQ > 0 && (
            <div style={{ fontSize: 22, fontWeight: 800, color: timerColor, minWidth: 50, textAlign: "center" }}>
              {timeLeft}s
            </div>
          )}
          <div style={{ fontSize: 18, color: "#fff", fontWeight: 600 }}>
            שאלה {current + 1} / {questions.length}
          </div>
        </div>
      </div>

      {/* Timer bar */}
      {timeLimitPerQ > 0 && (
        <div style={{ background: "var(--card-border)", borderRadius: 6, height: 5, marginBottom: 6, overflow: "hidden" }}>
          <div style={{ height: "100%", width: `${timerPct}%`, background: timerColor, transition: "width 1s linear" }} />
        </div>
      )}

      {/* Progress bar */}
      <div style={{ background: "var(--card-border)", borderRadius: 6, height: 6, marginBottom: 28, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((current + 1) / questions.length) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
      </div>

      {/* Question */}
      <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 24, padding: 36, marginBottom: 20 }}>
        <p style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.7, marginBottom: 30 }}>{q.question}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {answersObj.map(({ key, label, text }) => (
            <button
              key={key}
              onClick={() => selectAnswer(key)}
              style={{
                width: "100%", padding: "18px 22px", borderRadius: 14, textAlign: "right", cursor: "pointer",
                border: `2px solid ${answers[current] === key ? "var(--primary)" : "var(--card-border)"}`,
                background: answers[current] === key ? "rgba(56,189,248,0.1)" : "var(--card)",
                color: "#fff", fontSize: 18,
                display: "flex", alignItems: "center", gap: 16, transition: "all 0.15s",
              }}
            >
              <span style={{ width: 36, height: 36, borderRadius: "50%", background: answers[current] === key ? "var(--primary)" : "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 700, flexShrink: 0, color: "#fff" }}>
                {label}
              </span>
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: "flex", gap: 12, marginBottom: 20 }}>
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          style={{ padding: "16px 28px", borderRadius: 12, border: "1px solid var(--card-border)", background: "var(--card)", color: current === 0 ? "var(--muted)" : "var(--foreground)", cursor: current === 0 ? "not-allowed" : "pointer", fontSize: 17 }}
        >
          קודם
        </button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent(c => c + 1)} style={{ flex: 1, padding: "16px 28px", borderRadius: 12, border: "none", background: "var(--primary)", color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 600 }}>
            הבא
          </button>
        ) : (
          <button onClick={submitTest} style={{ flex: 1, padding: "16px 28px", borderRadius: 12, border: "none", background: "var(--success)", color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700 }}>
            סיים מבחן
          </button>
        )}
      </div>

      {/* Question grid */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: 36, height: 36, borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600,
              color: i === current ? "#fff" : answers[i] ? "var(--success)" : "var(--muted)",
              border: `2px solid ${i === current ? "var(--primary)" : answers[i] ? "var(--success)" : "var(--card-border)"}`,
              background: i === current ? "var(--primary)" : answers[i] ? "rgba(52,211,153,0.1)" : "var(--card)",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
