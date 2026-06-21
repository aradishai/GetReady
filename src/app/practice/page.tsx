"use client"

import { useEffect, useState, useCallback } from "react"
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
  explanation: string
  topic: string
  difficulty: string
  sourceType: string
  examYear: string | null
}

type Answer = "A" | "B" | "C" | "D"

export default function PracticePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId") || ""

  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Answer | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [streak, setStreak] = useState(0)

  const [topics, setTopics] = useState<string[]>([])
  const [filters, setFilters] = useState({ topic: "all", difficulty: "all", sourceType: "all" })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  useEffect(() => {
    fetch(`/api/questions/topics?courseId=${courseId}`).then((r) => r.json()).then(setTopics)
  }, [courseId])

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const params = new URLSearchParams({
      limit: "1000",
      ...(courseId && { courseId }),
      ...(filters.topic !== "all" && { topic: filters.topic }),
      ...(filters.difficulty !== "all" && { difficulty: filters.difficulty }),
      ...(filters.sourceType !== "all" && { sourceType: filters.sourceType }),
    })
    const data = await fetch(`/api/questions?${params}`).then((r) => r.json())
    setQuestions(Array.isArray(data) ? data : [])
    setCurrent(0)
    setSelected(null)
    setShowResult(false)
    setLoading(false)
  }, [filters, courseId])

  useEffect(() => {
    if (session?.user?.isPaid) loadQuestions()
  }, [session, loadQuestions])

  function handleAnswer(ans: Answer) {
    if (selected) return
    setSelected(ans)
    setShowResult(true)
    const correct = ans === questions[current].correctAnswer
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))
    setStreak((s) => (correct ? s + 1 : 0))
    // Track answered question in localStorage
    if (courseId) {
      const key = `practice_done_${courseId}`
      const done: string[] = JSON.parse(localStorage.getItem(key) || "[]")
      const qId = questions[current].id
      if (!done.includes(qId)) localStorage.setItem(key, JSON.stringify([...done, qId]))
    }
  }

  function nextQuestion() {
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1)
      setSelected(null)
      setShowResult(false)
    } else {
      loadQuestions()
    }
  }

  function prevQuestion() {
    if (current > 0) {
      setCurrent((c) => c - 1)
      setSelected(null)
      setShowResult(false)
    }
  }

  const q = questions[current]
  const answers: { key: Answer; label: string; text: string }[] = q
    ? [
        { key: "A", label: "א", text: q.answerA },
        { key: "B", label: "ב", text: q.answerB },
        { key: "C", label: "ג", text: q.answerC },
        { key: "D", label: "ד", text: q.answerD },
      ]
    : []

  function getAnswerStyle(key: Answer) {
    const base = {
      width: "100%",
      padding: "18px 22px",
      borderRadius: 12,
      border: "1px solid var(--card-border)",
      background: "var(--card)",
      color: "var(--foreground)",
      cursor: selected ? "default" : "pointer",
      fontSize: 18,
      textAlign: "right" as const,
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: 12,
    }
    if (!showResult) return base
    if (key === q.correctAnswer) return { ...base, background: "rgba(16,185,129,0.12)", border: "1px solid var(--success)" }
    if (key === selected) return { ...base, background: "rgba(239,68,68,0.12)", border: "1px solid var(--danger)" }
    return { ...base, opacity: 0.5 }
  }

  const difficultyColor: Record<string, string> = {
    Easy: "var(--success)",
    Medium: "var(--warning)",
    Hard: "var(--danger)",
  }

  if (loading || questions.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>{loading ? "טוען שאלות..." : "לא נמצאו שאלות לפילטר זה"}</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto", padding: "32px 24px" }}>
      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <button
          onClick={() => router.push(courseId ? `/course/${courseId}` : "/dashboard")}
          style={{ padding: "8px 16px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", cursor: "pointer", fontSize: 14 }}
        >
          חזור
        </button>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>שאלה {current + 1} / {questions.length}</div>
          <div style={{ fontSize: 14, color: "var(--success)", fontWeight: 600 }}>{score.correct}/{score.total} נכון</div>
          {streak >= 3 && <div style={{ fontSize: 14, color: "var(--warning)", fontWeight: 600 }}>רצף {streak}</div>}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: "6px 14px",
            background: showFilters ? "var(--primary)" : "var(--card)",
            border: "1px solid var(--card-border)",
            borderRadius: 8,
            color: showFilters ? "#fff" : "var(--muted)",
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          פילטר
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 16, marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 12 }}>
          {[
            { label: "נושא", key: "topic", options: [{ value: "all", label: "הכל" }, ...topics.map((t) => ({ value: t, label: t }))] },
            { label: "קושי", key: "difficulty", options: [{ value: "all", label: "הכל" }, { value: "Easy", label: "קל" }, { value: "Medium", label: "בינוני" }, { value: "Hard", label: "קשה" }] },
          ].map(({ label, key, options }) => (
            <div key={key}>
              <label style={{ display: "block", fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>{label}</label>
              <select
                value={filters[key as keyof typeof filters]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                style={{ background: "var(--muted-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", padding: "6px 10px", fontSize: 13, cursor: "pointer" }}
              >
                {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          ))}
          <div style={{ display: "flex", alignItems: "flex-end" }}>
            <button onClick={loadQuestions} style={{ padding: "6px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
              החל
            </button>
          </div>
        </div>
      )}

      {/* Progress Bar */}
      <div style={{ background: "var(--card-border)", borderRadius: 4, height: 4, marginBottom: 24, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((current + 1) / questions.length) * 100}%`, background: "var(--primary)", transition: "width 0.3s" }} />
      </div>

      {/* Question Card */}
      <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 24, padding: 36, marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: `${difficultyColor[q.difficulty]}22`, color: difficultyColor[q.difficulty], border: `1px solid ${difficultyColor[q.difficulty]}44` }}>
            {q.difficulty === "Easy" ? "קל" : q.difficulty === "Medium" ? "בינוני" : "קשה"}
          </span>
          <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "rgba(56,189,248,0.1)", color: "var(--primary)", border: "1px solid rgba(56,189,248,0.3)" }}>
            {q.topic}
          </span>
          {q.sourceType === "PreviousExam" && (
            <span style={{ fontSize: 12, padding: "3px 10px", borderRadius: 20, background: "rgba(245,158,11,0.1)", color: "var(--warning)", border: "1px solid rgba(245,158,11,0.3)" }}>
              מבחן קודם {q.examYear && `• ${q.examYear}`}
            </span>
          )}
        </div>

        <p style={{ fontSize: 22, fontWeight: 600, lineHeight: 1.7, marginBottom: 30 }}>{q.question}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {answers.map(({ key, label, text }) => (
            <button key={key} onClick={() => handleAnswer(key)} style={getAnswerStyle(key)}>
              <span
                style={{
                  width: 28, height: 28, borderRadius: "50%",
                  background: selected ? key === q.correctAnswer ? "var(--success)" : key === selected ? "var(--danger)" : "var(--card-border)" : "var(--card-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, flexShrink: 0, color: "#fff",
                }}
              >
                {label}
              </span>
              {text}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {showResult && (
        <div style={{ background: selected === q.correctAnswer ? "rgba(16,185,129,0.08)" : "rgba(239,68,68,0.08)", border: `1px solid ${selected === q.correctAnswer ? "var(--success)" : "var(--danger)"}44`, borderRadius: 14, padding: 20, marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: selected === q.correctAnswer ? "var(--success)" : "var(--danger)" }}>
            {selected === q.correctAnswer ? "נכון!" : "לא נכון"}
          </div>
          <p style={{ color: "var(--foreground)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            <strong>הסבר:</strong> {q.explanation}
          </p>
        </div>
      )}

      {/* Navigation buttons */}
      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
        <button
          onClick={prevQuestion}
          disabled={current === 0}
          style={{ padding: "9px 20px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 8, color: current === 0 ? "rgba(255,255,255,0.2)" : "var(--muted)", cursor: current === 0 ? "default" : "pointer", fontSize: 13 }}
        >
          הקודם
        </button>
        <button
          onClick={nextQuestion}
          style={{ padding: "9px 20px", background: showResult ? "var(--primary)" : "var(--card)", border: showResult ? "1px solid var(--primary)" : "1px solid var(--card-border)", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer", color: showResult ? "#fff" : "var(--muted)" }}
        >
          {current < questions.length - 1 ? "שאלה הבאה" : "סיבוב חדש"}
        </button>
      </div>
    </div>
  )
}
