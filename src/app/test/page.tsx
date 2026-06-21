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

const QUESTION_COUNT = 25
const POINTS_PER_Q = 4

export default function TestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId") || ""

  const [phase, setPhase] = useState<"test" | "submitting">("test")
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [current, setCurrent] = useState(0)
  const [loading, setLoading] = useState(true)
  const startTime = useRef(Date.now())

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  useEffect(() => {
    if (status !== "authenticated") return
    const params = new URLSearchParams({ limit: String(QUESTION_COUNT), ...(courseId && { courseId }) })
    fetch(`/api/questions?${params}`)
      .then((r) => r.json())
      .then((data) => { setQuestions(Array.isArray(data) ? data : []); setLoading(false) })
  }, [status, courseId])

  function selectAnswer(key: Answer) {
    setAnswers((a) => ({ ...a, [current]: key }))
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
    const data = await res.json()
    if (data.resultId) router.push(`/results/${data.resultId}`)
  }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "#fff" }}>טוען שאלות...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "60px 16px", textAlign: "center" }}>
        <p style={{ color: "#fff", fontSize: 18 }}>אין שאלות זמינות לקורס זה עדיין.</p>
        <button onClick={() => router.back()} style={{ marginTop: 20, padding: "12px 24px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 15 }}>
          חזור
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

  const q = questions[current]
  const answersObj: { key: Answer; label: string; text: string }[] = [
    { key: "A", label: "א", text: q.answerA },
    { key: "B", label: "ב", text: q.answerB },
    { key: "C", label: "ג", text: q.answerC },
    { key: "D", label: "ד", text: q.answerD },
  ]
  const answered = Object.keys(answers).length

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px", color: "#fff" }}>
      {/* Top bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => router.push(courseId ? `/course/${courseId}` : "/dashboard")}
          style={{ padding: "11px 24px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 17 }}
        >
          חזור
        </button>
        <div style={{ fontSize: 18, color: "#fff", fontWeight: 600 }}>
          שאלה {current + 1} / {questions.length}
        </div>
      </div>

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
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          style={{ padding: "16px 28px", borderRadius: 12, border: "1px solid var(--card-border)", background: "var(--card)", color: current === 0 ? "var(--muted)" : "var(--foreground)", cursor: current === 0 ? "not-allowed" : "pointer", fontSize: 17 }}
        >
          קודם
        </button>
        {current < questions.length - 1 ? (
          <button onClick={() => setCurrent((c) => c + 1)} style={{ flex: 1, padding: "16px 28px", borderRadius: 12, border: "none", background: "var(--primary)", color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 600 }}>
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
