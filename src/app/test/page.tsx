"use client"

import { useEffect, useState, useRef, useCallback } from "react"
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

interface CompParticipant {
  userId: string
  userName: string
  score: number | null
  correctAnswers: number | null
  totalQuestions: number | null
  finished: boolean
}

type Answer = "A" | "B" | "C" | "D"
type Phase = "setup" | "test" | "submitting" | "results"

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
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const courseId      = searchParams.get("courseId") || ""
  const competitionCode = searchParams.get("competitionCode") || ""

  const [phase, setPhase]               = useState<Phase>(competitionCode ? "test" : "setup")
  const [difficulty, setDifficulty]     = useState("all")
  const [timeLimitPerQ, setTimeLimitPerQ] = useState(0)
  const [joinMode, setJoinMode]         = useState<"solo" | "join">("solo")
  const [joinCode, setJoinCode]         = useState("")
  const [joinError, setJoinError]       = useState("")
  const [createError, setCreateError]   = useState("")
  const [creatingRoom, setCreatingRoom] = useState(false)

  const [questions, setQuestions] = useState<Question[]>([])
  const [answers, setAnswers]     = useState<Record<number, Answer>>({})
  const [current, setCurrent]     = useState(0)
  const [loading, setLoading]     = useState(competitionCode ? true : false)
  const [timeLeft, setTimeLeft]   = useState<number | null>(null)
  const startTime = useRef(Date.now())

  // Competition state
  const [compParticipants, setCompParticipants] = useState<CompParticipant[]>([])
  const [finishedCount, setFinishedCount]       = useState(0)
  const [compResults, setCompResults]           = useState<CompParticipant[]>([])
  const [allFinished, setAllFinished]           = useState(false)

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login")
    // payment gate disabled
  }, [authStatus, session, router])

  // Load competition questions on mount
  useEffect(() => {
    if (!competitionCode || authStatus !== "authenticated") return
    setLoading(true)
    fetch(`/api/competition/${competitionCode}`)
      .then(r => r.json())
      .then(async data => {
        const ids: string[] = data.questionIds
        if (!ids.length) { setLoading(false); return }
        const qs = await fetch(`/api/questions?ids=${ids.join(",")}`).then(r => r.json())
        setQuestions(Array.isArray(qs) ? qs : [])
        setCompParticipants(data.participants)
        setFinishedCount(data.participants.filter((p: CompParticipant) => p.finished).length)
        startTime.current = Date.now()
        setLoading(false)
      })
  }, [competitionCode, authStatus])

  // Poll competition status during test
  const pollComp = useCallback(async () => {
    if (!competitionCode) return
    const data = await fetch(`/api/competition/${competitionCode}`).then(r => r.json())
    const finished = data.participants.filter((p: CompParticipant) => p.finished).length
    setFinishedCount(finished)
    setCompParticipants(data.participants)
    if (data.allFinished && phase === "submitting") {
      setCompResults(data.participants.sort((a: CompParticipant, b: CompParticipant) => (b.score ?? 0) - (a.score ?? 0)))
      setAllFinished(true)
      setPhase("results")
    }
  }, [competitionCode, phase])

  useEffect(() => {
    if (!competitionCode || phase !== "submitting") return
    const interval = setInterval(pollComp, 2500)
    return () => clearInterval(interval)
  }, [competitionCode, phase, pollComp])

  // Timer
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

  async function createRoom() {
    setCreatingRoom(true)
    setCreateError("")
    try {
      const res = await fetch("/api/competition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ courseId: courseId || null, difficulty }),
      })
      const data = await res.json()
      if (data.code) router.push(`/competition/${data.code}`)
      else { setCreateError(data.error || "שגיאה ביצירת חדר"); setCreatingRoom(false) }
    } catch {
      setCreateError("שגיאת רשת — נסה שוב"); setCreatingRoom(false)
    }
  }

  async function joinRoom() {
    if (!joinCode.trim()) return
    const code = joinCode.trim().toUpperCase()
    const joinRes = await fetch(`/api/competition/${code}/join`, { method: "POST" })
    if (joinRes.ok) router.push(`/competition/${code}`)
    else setJoinError("קוד לא נמצא — נסה שוב")
  }

  function selectAnswer(key: Answer) {
    setAnswers(a => ({ ...a, [current]: key }))
  }

  async function submitTest() {
    setPhase("submitting")
    const correct = questions.filter((q, i) => (answers[i] || "A") === q.correctAnswer).length
    const total = questions.length
    const score = Math.round((correct / total) * 100)
    const timeSpent = Math.round((Date.now() - startTime.current) / 1000)

    if (competitionCode) {
      // Competition mode: submit to competition finish
      const res = await fetch(`/api/competition/${competitionCode}/finish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, correctAnswers: correct, totalQuestions: total }),
      })
      const data = await res.json()
      if (data.allFinished) {
        setCompResults(data.results)
        setAllFinished(true)
        setPhase("results")
      }
      // else keep polling (useEffect above)
    } else {
      // Normal mode: save result
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

        {/* Time per question (solo only) */}
        {joinMode === "solo" && (
          <div style={{ marginBottom: 28 }}>
            <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>זמן לשאלה</div>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {TIME_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setTimeLimitPerQ(opt.value)} style={btnBase(timeLimitPerQ === opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Mode selector */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>מצב משחק</div>
          <div style={{ display: "flex", gap: 10 }}>
            <button onClick={() => setJoinMode("solo")} style={btnBase(joinMode === "solo")}>יחיד</button>
            <button onClick={() => setJoinMode("join")} style={btnBase(joinMode === "join")}>תחרות עם חברים</button>
          </div>
        </div>

        {/* Competition options */}
        {joinMode === "join" && (
          <div style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 14, padding: 20, marginBottom: 28 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <button
                onClick={createRoom}
                disabled={creatingRoom}
                style={{ width: "100%", padding: "13px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer" }}
              >
                {creatingRoom ? "יוצר חדר..." : "צור חדר חדש"}
              </button>
              {createError && <div style={{ color: "var(--danger)", fontSize: 13, textAlign: "center" }}>{createError}</div>}
              <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 13 }}>או</div>
              <div style={{ display: "flex", gap: 8 }}>
                <input
                  value={joinCode}
                  onChange={e => { setJoinCode(e.target.value.toUpperCase()); setJoinError("") }}
                  placeholder="הכנס קוד (4 ספרות)"
                  maxLength={4}
                  style={{
                    flex: 1, padding: "12px 14px", background: "var(--muted-bg)", border: `1px solid ${joinError ? "var(--danger)" : "var(--card-border)"}`,
                    borderRadius: 10, color: "var(--foreground)", fontSize: 16, fontFamily: "monospace", letterSpacing: 4, textAlign: "center",
                  }}
                />
                <button
                  onClick={joinRoom}
                  style={{ padding: "12px 18px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, color: "var(--foreground)", cursor: "pointer", fontSize: 14, fontWeight: 600 }}
                >
                  הצטרף
                </button>
              </div>
              {joinError && <div style={{ color: "var(--danger)", fontSize: 13 }}>{joinError}</div>}
            </div>
          </div>
        )}

        {joinMode === "solo" && (
          <button
            onClick={startTest}
            disabled={loading}
            style={{ width: "100%", padding: "16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12, fontSize: 17, fontWeight: 700, cursor: loading ? "wait" : "pointer" }}
          >
            {loading ? "טוען שאלות..." : "התחל מבחן"}
          </button>
        )}
      </div>
    )
  }

  /* ── WAITING FOR RESULTS ── */
  if (phase === "submitting") {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "60vh", gap: 16 }}>
        <div style={{ color: "#fff", fontSize: 18, fontWeight: 700 }}>סיימת! ממתין לשאר...</div>
        {competitionCode && compParticipants.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", gap: 8, width: "100%", maxWidth: 360 }}>
            {compParticipants.map(p => (
              <div key={p.userId} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "10px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: 600 }}>{p.userName}</span>
                <span style={{ fontSize: 13, color: p.finished ? "var(--success)" : "var(--muted)" }}>
                  {p.finished ? "✓ סיים" : "בתהליך..."}
                </span>
              </div>
            ))}
          </div>
        )}
        {!competitionCode && <div style={{ color: "var(--muted)" }}>שומר תוצאות...</div>}
      </div>
    )
  }

  /* ── COMPETITION RESULTS POPUP ── */
  if (phase === "results" && competitionCode) {
    const myScore = compResults.find(p => p.userId === session?.user?.id)
    const winner = compResults[0]
    const iWon = winner?.userId === session?.user?.id

    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: "80vh" }}>
        <div style={{
          background: "var(--card)",
          border: `2px solid ${iWon ? "var(--warning)" : "var(--card-border)"}`,
          borderRadius: 24,
          padding: "40px 32px",
          maxWidth: 440,
          width: "100%",
          boxShadow: iWon ? "0 0 40px rgba(234,179,8,0.3)" : "none",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{iWon ? "🏆" : "🎯"}</div>
          <h2 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>
            {iWon ? "ניצחת!" : `${winner?.userName} ניצח!`}
          </h2>
          <p style={{ color: "var(--muted)", marginBottom: 28 }}>תוצאות התחרות</p>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 28 }}>
            {compResults.map((p, i) => (
              <div key={p.userId} style={{
                background: i === 0 ? "rgba(234,179,8,0.08)" : "var(--muted-bg)",
                border: `1.5px solid ${i === 0 ? "rgba(234,179,8,0.4)" : "var(--card-border)"}`,
                borderRadius: 12,
                padding: "12px 18px",
                display: "flex",
                alignItems: "center",
                gap: 12,
              }}>
                <span style={{ fontSize: 20, width: 28 }}>{i === 0 ? "🥇" : i === 1 ? "🥈" : "🥉"}</span>
                <span style={{ flex: 1, fontWeight: 700, textAlign: "right" }}>{p.userName}</span>
                <span style={{ fontWeight: 800, color: i === 0 ? "var(--warning)" : "var(--foreground)", fontSize: 18 }}>
                  {p.score !== null ? `${Math.round(p.score)}%` : "—"}
                </span>
                <span style={{ color: "var(--muted)", fontSize: 13 }}>
                  {p.correctAnswers}/{p.totalQuestions}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={() => router.push(courseId ? `/course/${courseId}` : "/dashboard")}
            style={{ width: "100%", padding: "14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 12, fontSize: 16, fontWeight: 700, cursor: "pointer" }}
          >
            חזרה לקורס
          </button>
        </div>
      </div>
    )
  }

  if (loading || questions.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "#fff" }}>{loading ? "טוען שאלות..." : "אין שאלות זמינות"}</div>
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
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {competitionCode && (
            <div style={{ fontSize: 13, color: "var(--muted)", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 8, padding: "5px 12px" }}>
              {finishedCount}/{compParticipants.length} סיימו
            </div>
          )}
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
