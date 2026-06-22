"use client"

import { useEffect, useState, useCallback, useRef, Suspense } from "react"
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

function PracticePageInner() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId = searchParams.get("courseId") || ""
  const isMobile = useMobile()

  const [questions, setQuestions] = useState<Question[]>([])
  const [current, setCurrent] = useState(0)
  const [selected, setSelected] = useState<Answer | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState({ correct: 0, total: 0 })
  const [streak, setStreak] = useState(0)
  const sessionBestStreakRef = useRef(0)

  const [topics, setTopics] = useState<string[]>([])
  const [filters, setFilters] = useState({ topic: "all", difficulty: "all", sourceType: "all" })
  const [showFilters, setShowFilters] = useState(false)
  const [loading, setLoading] = useState(true)

  const userId = session?.user?.id

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

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

  // Only fire on initial user login — NOT on tab-focus session refresh
  useEffect(() => {
    if (userId) loadQuestions()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  function handleAnswer(ans: Answer) {
    if (selected) return
    setSelected(ans)
    setShowResult(true)
    const correct = ans === questions[current].correctAnswer

    const newTotal = score.total + 1
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }))

    const newStreak = correct ? streak + 1 : 0
    setStreak(newStreak)

    const newSBest = Math.max(sessionBestStreakRef.current, newStreak)
    sessionBestStreakRef.current = newSBest

    // Track answered question
    if (courseId) {
      const doneKey = `practice_done_${courseId}`
      const done: string[] = JSON.parse(localStorage.getItem(doneKey) || "[]")
      const qId = questions[current].id
      if (!done.includes(qId)) localStorage.setItem(doneKey, JSON.stringify([...done, qId]))
    }

    // Update personal records silently
    if (courseId) {
      const prKey = `practice_records_${courseId}`
      const pr = JSON.parse(localStorage.getItem(prKey) || "{}")
      if (newSBest > (pr.bestStreak || 0)) pr.bestStreak = newSBest
      if (newTotal > (pr.bestSession || 0)) pr.bestSession = newTotal
      localStorage.setItem(prKey, JSON.stringify(pr))
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
      padding: isMobile ? "9px 12px" : "11px 16px",
      borderRadius: 10,
      border: "1px solid var(--card-border)",
      background: "var(--card)",
      color: "var(--foreground)",
      cursor: selected ? "default" : "pointer",
      fontSize: isMobile ? 13 : 15,
      textAlign: "right" as const,
      transition: "all 0.2s",
      display: "flex",
      alignItems: "center",
      gap: isMobile ? 8 : 10,
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
    <div style={{ maxWidth: 860, margin: "0 auto", padding: isMobile ? "12px 10px" : "20px 24px" }}>

      {/* Top Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <button
          onClick={() => router.push(courseId ? `/course/${courseId}` : "/dashboard")}
          style={{ padding: "8px 16px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", cursor: "pointer", fontSize: 14 }}
        >
          חזור
        </button>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <div style={{ fontSize: 14, color: "var(--muted)" }}>שאלה {current + 1} / {questions.length}</div>
          <div style={{ fontSize: 14, color: "var(--success)", fontWeight: 600 }}>{score.correct}/{score.total} נכון</div>
          {streak >= 2 && (
            <div style={{ fontSize: 14, color: "var(--warning)", fontWeight: 700 }}>רצף {streak}</div>
          )}
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
        <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 12, padding: 16, marginBottom: 16, display: "flex", flexWrap: "wrap", gap: 12 }}>
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
      <div style={{ background: "var(--card-border)", borderRadius: 4, height: 4, marginBottom: 16, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${((current + 1) / questions.length) * 100}%`, background: "var(--primary)", transition: "width 0.3s" }} />
      </div>

      {/* Question Card */}
      <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: isMobile ? 14 : 18, padding: isMobile ? "14px 12px" : "20px 22px", marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, marginBottom: isMobile ? 10 : 12, flexWrap: "wrap" }}>
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

        <p style={{ fontSize: isMobile ? 15 : 17, fontWeight: 600, lineHeight: 1.6, marginBottom: isMobile ? 12 : 16 }}>{q.question}</p>

        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 7 : 8 }}>
          {answers.map(({ key, label, text }) => (
            <button key={key} onClick={() => handleAnswer(key)} style={getAnswerStyle(key)}>
              <span
                style={{
                  width: 22, height: 22, borderRadius: "50%",
                  background: selected ? key === q.correctAnswer ? "var(--success)" : key === selected ? "var(--danger)" : "var(--card-border)" : "var(--card-border)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: isMobile ? 11 : 13, fontWeight: 700, flexShrink: 0, color: "#fff",
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

export default function PracticePage() {
  return (
    <Suspense fallback={<div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh", color: "var(--muted)" }}>טוען...</div>}>
      <PracticePageInner />
    </Suspense>
  )
}
