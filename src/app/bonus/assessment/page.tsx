"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface Question {
  id: string
  topic: string
  question: string
  answerA: string
  answerB: string
  answerC: string
  answerD: string
  correctAnswer: string
  explanation: string
  position: number
}

const TOPIC_IMAGES: Record<string, string> = {
  "ילד עם הכינור": "/bonus-yeled-kinor.png",
  "משפחה בכפר": "/bonus-mishpacha-kfar.jpg",
}

const ANSWER_LABELS: Record<string, string> = {
  A: "א",
  B: "ב",
  C: "ג",
  D: "ד",
}

export default function AssessmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAdmin = session?.user?.isAdmin ?? false
  const isPaid = (session?.user as { isPaid?: boolean })?.isPaid ?? false

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>([])
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !isAdmin && !isPaid) router.push("/dashboard")
  }, [status, isAdmin, isPaid, router])

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/admin/questions?courseId=bonus")
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      const sorted = data.sort((a: Question, b: Question) => a.position - b.position)
      setQuestions(sorted)
      setAnsweredCorrectly(new Array(sorted.length).fill(null))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    if (!isAdmin && !isPaid) return

    const init = async () => {
      setLoading(true)
      const res = await fetch("/api/admin/questions?courseId=bonus")
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        const sorted = data.sort((a: Question, b: Question) => a.position - b.position)
        setQuestions(sorted)
        setAnsweredCorrectly(new Array(sorted.length).fill(null))
        setLoading(false)
      } else if (isAdmin) {
        // auto-seed silently for admin
        await fetch("/api/admin/seed-bonus", { method: "POST" })
        await loadQuestions()
      } else {
        setLoading(false)
      }
    }
    init()
  }, [status, isAdmin, isPaid, loadQuestions])

  async function resetSeed() {
    setSeeding(true)
    await fetch("/api/admin/seed-bonus?reset=true", { method: "POST" })
    setCurrentIndex(0)
    setSelected(null)
    setDone(false)
    await loadQuestions()
    setSeeding(false)
  }

  function handleAnswer(letter: string) {
    if (selected) return
    setSelected(letter)
    const correct = letter === questions[currentIndex].correctAnswer
    setAnsweredCorrectly(prev => {
      const next = [...prev]
      next[currentIndex] = correct
      return next
    })
  }

  function next() {
    if (currentIndex + 1 >= questions.length) {
      setDone(true)
    } else {
      setCurrentIndex(i => i + 1)
      setSelected(null)
    }
  }

  function prev() {
    if (currentIndex === 0) return
    setCurrentIndex(i => i - 1)
    setSelected(null)
  }

  function restart() {
    setCurrentIndex(0)
    setSelected(null)
    setAnsweredCorrectly(new Array(questions.length).fill(null))
    setDone(false)
  }

  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>טוען...</div>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div style={{ maxWidth: 500, margin: "0 auto", padding: "32px 18px" }}>
        <button onClick={() => router.push("/bonus")} style={{ marginBottom: 24, padding: "8px 16px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", cursor: "pointer", fontSize: 14 }}>
          חזור
        </button>
        <div style={{ textAlign: "center", paddingTop: 60 }}>
          <p style={{ color: "var(--muted)" }}>תוכן בקרוב</p>
        </div>
      </div>
    )
  }

  const q = questions[currentIndex]
  const topicImage = TOPIC_IMAGES[q?.topic]

  const score = answeredCorrectly.filter(v => v === true).length

  if (done) {
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 18px 100px" }}>
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>סיימת!</h2>
          <p style={{ fontSize: 18, color: "var(--muted)", marginBottom: 24 }}>
            {score} / {questions.length} נכונות · {pct}%
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={restart} style={{ padding: "12px 28px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}>
              שוב מההתחלה
            </button>
            <button onClick={() => router.push("/bonus")} style={{ padding: "12px 20px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, fontSize: 15, color: "var(--foreground)", cursor: "pointer" }}>
              חזור
            </button>
          </div>
        </div>
      </div>
    )
  }

  const answers = [
    { letter: "A", text: q.answerA },
    { letter: "B", text: q.answerB },
    { letter: "C", text: q.answerC },
    { letter: "D", text: q.answerD },
  ]

  return (
    <div style={{ maxWidth: 540, margin: "0 auto", padding: "24px 18px 100px" }} dir="rtl">
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <button onClick={() => router.push("/bonus")} style={{ padding: "7px 14px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", cursor: "pointer", fontSize: 13, flexShrink: 0 }}>
          חזור
        </button>
        <span style={{ color: "var(--muted)", fontSize: 13, flexShrink: 0 }}>שאלה {currentIndex + 1} / {questions.length}</span>
        <div style={{ flex: 1, height: 4, borderRadius: 4, background: "var(--card-border)", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#7c3aed", width: `${((currentIndex) / questions.length) * 100}%`, transition: "width 0.3s" }} />
        </div>
        {isAdmin && (
          <button onClick={resetSeed} disabled={seeding} style={{ padding: "5px 10px", background: "transparent", border: "1px solid var(--card-border)", borderRadius: 6, color: "var(--muted)", cursor: "pointer", fontSize: 11, flexShrink: 0 }}>
            {seeding ? "..." : "⟳ אפס"}
          </button>
        )}
      </div>

      {topicImage && (
        <div style={{ marginBottom: 20, borderRadius: 14, overflow: "hidden", background: "var(--card)", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={topicImage} alt={q.topic} style={{ width: "100%", maxHeight: 220, objectFit: "contain", display: "block" }} />
        </div>
      )}

      <div style={{ marginBottom: 4, fontSize: 12, color: "#a78bfa", fontWeight: 600 }}>{q.topic}</div>

      <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.6, marginBottom: 20, color: "var(--foreground)" }}>
        {q.question}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {answers.map(({ letter, text }) => {
          const isCorrect = letter === q.correctAnswer
          const isSelected = letter === selected
          let bg = "var(--card)"
          let border = "1px solid var(--card-border)"
          let color = "var(--foreground)"

          if (selected) {
            if (isCorrect) { bg = "#14532d"; border = "1px solid #22c55e"; color = "#86efac" }
            else if (isSelected) { bg = "#450a0a"; border = "1px solid #ef4444"; color = "#fca5a5" }
            else { color = "var(--muted)" }
          }

          return (
            <button
              key={letter}
              onClick={() => handleAnswer(letter)}
              disabled={!!selected}
              style={{
                width: "100%",
                padding: "14px 16px",
                borderRadius: 12,
                border,
                background: bg,
                color,
                cursor: selected ? "default" : "pointer",
                textAlign: "right",
                fontSize: 14,
                lineHeight: 1.5,
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontWeight: 800, minWidth: 20, color: selected && isCorrect ? "#22c55e" : selected && isSelected && !isCorrect ? "#ef4444" : "#7c3aed" }}>
                {ANSWER_LABELS[letter]}
              </span>
              <span>{text}</span>
            </button>
          )
        })}
      </div>

      {selected && q.explanation ? (
        <div style={{ marginTop: 14, padding: "12px 16px", borderRadius: 10, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", fontSize: 13, color: "var(--muted)", lineHeight: 1.6 }}>
          {q.explanation}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
        {currentIndex > 0 && (
          <button
            onClick={prev}
            style={{ flex: 1, padding: "14px", background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)", borderRadius: 12, fontSize: 15, fontWeight: 600, cursor: "pointer" }}
          >
            → הקודם
          </button>
        )}
        {selected && (
          <button
            onClick={next}
            style={{ flex: 2, padding: "14px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
          >
            {currentIndex + 1 >= questions.length ? "סיים" : "← הבא"}
          </button>
        )}
      </div>
    </div>
  )
}
