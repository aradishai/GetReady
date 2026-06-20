"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"

interface Answer {
  id: string
  userAnswer: string
  isCorrect: boolean
  question: {
    question: string
    answerA: string
    answerB: string
    answerC: string
    answerD: string
    correctAnswer: string
    explanation: string
    topic: string
    difficulty: string
  }
}

interface Result {
  id: string
  score: number
  totalQuestions: number
  correctAnswers: number
  createdAt: string
  course: { name: string }
  answers: Answer[]
}

export default function ResultsPage() {
  const params = useParams()
  const [result, setResult] = useState<Result | null>(null)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/results?id=${params.id}`)
      .then((r) => r.json())
      .then((data) => { setResult(data); setLoading(false) })
  }, [params.id])

  if (loading || !result) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>טוען תוצאות...</div>
      </div>
    )
  }

  const { score, totalQuestions, correctAnswers, answers } = result
  const wrong = totalQuestions - correctAnswers
  const scoreColor = score >= 80 ? "var(--success)" : score >= 60 ? "var(--warning)" : "var(--danger)"

  const topicStats: Record<string, { correct: number; total: number }> = {}
  for (const a of answers) {
    const t = a.question.topic
    if (!topicStats[t]) topicStats[t] = { correct: 0, total: 0 }
    topicStats[t].total++
    if (a.isCorrect) topicStats[t].correct++
  }

  const labelMap: Record<string, string> = { A: "א", B: "ב", C: "ג", D: "ד" }

  return (
    <div style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px" }}>
      {/* Score Card */}
      <div style={{ background: "var(--card)", border: `2px solid ${scoreColor}44`, borderRadius: 24, padding: 36, textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: scoreColor, lineHeight: 1, marginBottom: 8 }}>{score}%</div>
        <div style={{ fontSize: 20, fontWeight: 600, marginBottom: 20 }}>
          {score >= 90 ? "מצוין!" : score >= 80 ? "כל הכבוד!" : score >= 60 ? "לא רע, המשך להתאמן" : "יש מה לשפר, אל תוותר"}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 32 }}>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--success)" }}>{correctAnswers}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>נכון</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--danger)" }}>{wrong}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>טעות</div>
          </div>
          <div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "var(--foreground)" }}>{totalQuestions}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>סה״כ</div>
          </div>
        </div>
      </div>

      {/* Topic Breakdown */}
      <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 16, padding: 20, marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: 16 }}>ביצועים לפי נושא</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {Object.entries(topicStats).map(([topic, stats]) => {
            const pct = Math.round((stats.correct / stats.total) * 100)
            return (
              <div key={topic}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                  <span style={{ fontSize: 13 }}>{topic}</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--warning)" : "var(--danger)" }}>
                    {stats.correct}/{stats.total} ({pct}%)
                  </span>
                </div>
                <div style={{ background: "var(--card-border)", borderRadius: 4, height: 6, overflow: "hidden" }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: pct >= 80 ? "var(--success)" : pct >= 60 ? "var(--warning)" : "var(--danger)", transition: "width 0.5s" }} />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Answers Review */}
      <h3 style={{ fontWeight: 700, marginBottom: 12, fontSize: 16 }}>סקירת שאלות</h3>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
        {answers.map((a, i) => (
          <div key={a.id} style={{ background: "var(--card)", border: `1px solid ${a.isCorrect ? "rgba(16,185,129,0.3)" : "rgba(239,68,68,0.3)"}`, borderRadius: 12, overflow: "hidden" }}>
            <button
              onClick={() => setExpanded(expanded === a.id ? null : a.id)}
              style={{ width: "100%", padding: "14px 18px", background: "transparent", border: "none", cursor: "pointer", display: "flex", alignItems: "center", gap: 12, color: "var(--foreground)", textAlign: "right" }}
            >
              <span style={{ fontSize: 16, color: a.isCorrect ? "var(--success)" : "var(--danger)" }}>
                {a.isCorrect ? "✓" : "✗"}
              </span>
              <span style={{ flex: 1, fontSize: 14, fontWeight: 500 }}>
                {i + 1}. {a.question.question.slice(0, 80)}{a.question.question.length > 80 ? "..." : ""}
              </span>
              <span style={{ color: "var(--muted)", fontSize: 12 }}>{expanded === a.id ? "▲" : "▼"}</span>
            </button>

            {expanded === a.id && (
              <div style={{ padding: "0 18px 16px", borderTop: "1px solid var(--card-border)" }}>
                <p style={{ fontSize: 15, fontWeight: 500, margin: "14px 0 12px" }}>{a.question.question}</p>
                {(["A", "B", "C", "D"] as const).map((key) => {
                  const text = a.question[`answer${key}` as keyof typeof a.question] as string
                  const isCorrect = key === a.question.correctAnswer
                  const isUserAnswer = key === a.userAnswer
                  return (
                    <div
                      key={key}
                      style={{
                        padding: "8px 12px", borderRadius: 8, marginBottom: 6, fontSize: 14,
                        background: isCorrect ? "rgba(16,185,129,0.1)" : isUserAnswer && !isCorrect ? "rgba(239,68,68,0.1)" : "transparent",
                        border: isCorrect ? "1px solid var(--success)" : isUserAnswer && !isCorrect ? "1px solid var(--danger)" : "1px solid transparent",
                        display: "flex", gap: 8,
                      }}
                    >
                      <span style={{ fontWeight: 700, color: isCorrect ? "var(--success)" : isUserAnswer ? "var(--danger)" : "var(--muted)" }}>
                        {labelMap[key]}
                      </span>
                      {text}
                      {isCorrect && <span style={{ marginRight: "auto", color: "var(--success)", fontSize: 12 }}>✓ נכון</span>}
                      {isUserAnswer && !isCorrect && <span style={{ marginRight: "auto", color: "var(--danger)", fontSize: 12 }}>← הבחירה שלך</span>}
                    </div>
                  )
                })}
                <div style={{ marginTop: 10, padding: "10px 12px", background: "rgba(99,102,241,0.06)", borderRadius: 8, fontSize: 13, lineHeight: 1.6, color: "var(--muted)" }}>
                  <strong style={{ color: "var(--primary)" }}>הסבר:</strong> {a.question.explanation}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Actions */}
      <div style={{ display: "flex", gap: 12 }}>
        <Link
          href="/dashboard"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "13px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 12, textDecoration: "none", color: "var(--foreground)", fontWeight: 600, fontSize: 14 }}
        >
          בית
        </Link>
        <Link
          href="/test"
          style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "13px", background: "var(--primary)", borderRadius: 12, textDecoration: "none", color: "#fff", fontWeight: 600, fontSize: 14 }}
        >
          מבחן חדש
        </Link>
      </div>
    </div>
  )
}
