"use client"

import { useEffect, useState, useRef } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  question: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  correctAnswer: string
  explanation: string
  topic: string
  difficulty: string
  sourceType: string
  examYear: string | null
}

type Answer = "A" | "B" | "C" | "D"

export default function TestPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const [phase, setPhase] = useState<"setup" | "test" | "submitting">("setup")
  const [config, setConfig] = useState({ count: 10, timed: false, timePerQ: 30, sourceType: "all" })
  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers] = useState<Record<number, Answer>>({})
  const [current, setCurrent] = useState(0)
  const [timeLeft, setTimeLeft] = useState(0)
  const [startTime] = useState(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  async function startTest() {
    const params = new URLSearchParams({
      limit: String(config.count),
      ...(config.sourceType !== "all" && { sourceType: config.sourceType }),
    })
    const data = await fetch(`/api/questions?${params}`).then((r) => r.json())
    setQuestions(data)
    setAnswers({})
    setCurrent(0)
    if (config.timed) {
      setTimeLeft(config.timePerQ)
      timerRef.current = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) { goNext(); return config.timePerQ }
          return t - 1
        })
      }, 1000)
    }
    setPhase("test")
  }

  function goNext() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
      if (config.timed) setTimeLeft(config.timePerQ)
    }
  }

  function selectAnswer(key: Answer) {
    setAnswers((a) => ({ ...a, [current]: key }))
  }

  async function submitTest() {
    if (timerRef.current) clearInterval(timerRef.current)
    setPhase("submitting")
    const timeSpent = Math.round((Date.now() - startTime) / 1000)
    const answersPayload = questions.map((q, i) => ({
      questionId: q.id,
      userAnswer: answers[i] || "A",
      isCorrect: (answers[i] || "A") === q.correctAnswer,
      difficulty: q.difficulty,
      timeSpent: config.timed ? config.timePerQ - timeLeft : undefined,
    }))
    const res = await fetch("/api/results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId: questions[0] ? "demo" : undefined, answers: answersPayload, timeSpent }),
    })
    const data = await res.json()
    if (data.resultId) router.push(`/results/${data.resultId}`)
  }

  const q = questions[current]
  const answersObj = q
    ? [
        { key: "A" as Answer, label: "א", text: q.answerA },
        { key: "B" as Answer, label: "ב", text: q.answerB },
        { key: "C" as Answer, label: "ג", text: q.answerC },
        { key: "D" as Answer, label: "ד", text: q.answerD },
      ]
    : []

  const answered = Object.keys(answers).length

  if (phase === "setup") {
    return (
      <div style={{ maxWidth: 540, margin: "0 auto", padding: "40px 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>מצב מבחן</h1>
          <p style={{ color: "var(--muted)", marginTop: 8 }}>הגדר את המבחן שלך</p>
        </div>

        <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 20, padding: 28 }}>
          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 12 }}>מספר שאלות</label>
            <div style={{ display: "flex", gap: 10 }}>
              {[10, 20, 30].map((n) => (
                <button
                  key={n}
                  onClick={() => setConfig({ ...config, count: n })}
                  style={{
                    flex: 1, padding: "12px", borderRadius: 10,
                    border: `2px solid ${config.count === n ? "var(--primary)" : "var(--card-border)"}`,
                    background: config.count === n ? "rgba(99,102,241,0.1)" : "transparent",
                    color: config.count === n ? "var(--primary)" : "var(--muted)",
                    cursor: "pointer", fontSize: 16, fontWeight: 700,
                  }}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontWeight: 600, marginBottom: 12 }}>מקור שאלות</label>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                { value: "all", label: "הכל — שאלות תרגול ומבחנים קודמים" },
                { value: "PreviousExam", label: "רק מבחנים קודמים 📋" },
                { value: "Generated", label: "רק שאלות תרגול 🎯" },
              ].map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setConfig({ ...config, sourceType: value })}
                  style={{
                    padding: "12px 16px", borderRadius: 10, textAlign: "right",
                    border: `2px solid ${config.sourceType === value ? "var(--primary)" : "var(--card-border)"}`,
                    background: config.sourceType === value ? "rgba(99,102,241,0.1)" : "transparent",
                    color: config.sourceType === value ? "var(--primary)" : "var(--foreground)",
                    cursor: "pointer", fontSize: 14,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 28 }}>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontWeight: 600 }}>
              <input type="checkbox" checked={config.timed} onChange={(e) => setConfig({ ...config, timed: e.target.checked })} style={{ width: 18, height: 18, cursor: "pointer" }} />
              מבחן עם זמן
            </label>
            {config.timed && (
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ color: "var(--muted)", fontSize: 14 }}>שניות לשאלה:</span>
                {[15, 30, 60].map((t) => (
                  <button
                    key={t}
                    onClick={() => setConfig({ ...config, timePerQ: t })}
                    style={{
                      padding: "6px 14px", borderRadius: 8, fontWeight: 600, cursor: "pointer",
                      border: `2px solid ${config.timePerQ === t ? "var(--warning)" : "var(--card-border)"}`,
                      background: config.timePerQ === t ? "rgba(245,158,11,0.1)" : "transparent",
                      color: config.timePerQ === t ? "var(--warning)" : "var(--muted)",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={startTest}
            style={{ width: "100%", padding: "14px", background: "var(--accent)", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            התחל מבחן 🚀
          </button>
        </div>
      </div>
    )
  }

  if (phase === "submitting") {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>שומר תוצאות...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "24px 16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 600 }}>שאלה {current + 1} / {questions.length}</div>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <span style={{ color: "var(--muted)", fontSize: 13 }}>ענית על {answered}/{questions.length}</span>
          {config.timed && (
            <span style={{ color: timeLeft <= 10 ? "var(--danger)" : "var(--warning)", fontWeight: 700, fontSize: 16 }}>
              ⏱ {timeLeft}s
            </span>
          )}
        </div>
      </div>

      <div style={{ background: "var(--card-border)", borderRadius: 4, height: 4, marginBottom: 20, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((current + 1) / questions.length) * 100}%`, background: "var(--accent)", transition: "width 0.3s" }} />
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 20, padding: 28, marginBottom: 16 }}>
        <p style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>{q.question}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {answersObj.map(({ key, label, text }) => (
            <button
              key={key}
              onClick={() => selectAnswer(key)}
              style={{
                width: "100%", padding: "14px 18px", borderRadius: 12, textAlign: "right", cursor: "pointer",
                border: `2px solid ${answers[current] === key ? "var(--primary)" : "var(--card-border)"}`,
                background: answers[current] === key ? "rgba(99,102,241,0.1)" : "var(--card)",
                color: "var(--foreground)", fontSize: 15,
                display: "flex", alignItems: "center", gap: 12, transition: "all 0.15s",
              }}
            >
              <span style={{ width: 28, height: 28, borderRadius: "50%", background: answers[current] === key ? "var(--primary)" : "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, flexShrink: 0, color: "#fff" }}>
                {label}
              </span>
              {text}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
        <button
          onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          disabled={current === 0}
          style={{ padding: "12px 20px", borderRadius: 10, border: "1px solid var(--card-border)", background: "var(--card)", color: current === 0 ? "var(--muted)" : "var(--foreground)", cursor: current === 0 ? "not-allowed" : "pointer", fontSize: 14, fontWeight: 500 }}
        >
          קודם
        </button>
        {current < questions.length - 1 ? (
          <button onClick={goNext} style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", background: "var(--primary)", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 600 }}>
            הבא
          </button>
        ) : (
          <button onClick={submitTest} style={{ flex: 1, padding: "12px 20px", borderRadius: 10, border: "none", background: "var(--success)", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
            סיים מבחן ✓
          </button>
        )}
      </div>

      <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 16, justifyContent: "center" }}>
        {questions.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            style={{
              width: 28, height: 28, borderRadius: 6, cursor: "pointer", fontSize: 11, fontWeight: 600, color: i === current ? "#fff" : answers[i] ? "var(--success)" : "var(--muted)",
              border: `2px solid ${i === current ? "var(--primary)" : answers[i] ? "var(--success)" : "var(--card-border)"}`,
              background: i === current ? "var(--primary)" : answers[i] ? "rgba(16,185,129,0.1)" : "var(--card)",
            }}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  )
}
