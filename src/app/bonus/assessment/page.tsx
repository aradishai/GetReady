"use client"

import { useEffect, useState, useCallback, useRef } from "react"
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

// ─── Memory Game ───────────────────────────────────────────────────────────

const MMPI_PAIRS = [
  { id: 1,  num: "1",  def: "מוקד בנוגע לבריאות" },
  { id: 2,  num: "2",  def: "דכאון" },
  { id: 3,  num: "3",  def: "תלונות גופניות, הכחשה של בעיות נפשיות" },
  { id: 4,  num: "4",  def: "התנהגות אנטי חברתית" },
  { id: 5,  num: "5",  def: "תחומי עניין לא סטנדרטיים לפי המגדר" },
  { id: 6,  num: "6",  def: "חשדנות" },
  { id: 7,  num: "7",  def: "חרדה" },
  { id: 8,  num: "8",  def: "מחשבות סותרות" },
  { id: 9,  num: "9",  def: "מרץ רב" },
  { id: 10, num: "10", def: "ביישן, לא מיומן חברתית" },
]

interface MemCard {
  uid: string
  pairId: number
  kind: "num" | "def"
  content: string
  matched: boolean
}

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function makeCards(): MemCard[] {
  const cards: MemCard[] = []
  for (const p of MMPI_PAIRS) {
    cards.push({ uid: `n${p.id}`, pairId: p.id, kind: "num", content: p.num, matched: false })
    cards.push({ uid: `d${p.id}`, pairId: p.id, kind: "def", content: p.def, matched: false })
  }
  return shuffled(cards)
}

function MemoryGame({ onComplete }: { onComplete: (wrong: number) => void }) {
  const [cards, setCards] = useState<MemCard[]>(() => makeCards())
  const [flipped, setFlipped] = useState<string[]>([])
  const [wrong, setWrong] = useState(0)
  const [matched, setMatched] = useState(0)
  const [checking, setChecking] = useState(false)
  const wrongRef = useRef(0)
  const matchedRef = useRef(0)

  useEffect(() => {
    if (flipped.length !== 2) return
    const [u1, u2] = flipped
    const c1 = cards.find(c => c.uid === u1)!
    const c2 = cards.find(c => c.uid === u2)!

    if (c1.pairId === c2.pairId) {
      setCards(prev => prev.map(c => c.uid === u1 || c.uid === u2 ? { ...c, matched: true } : c))
      setFlipped([])
      matchedRef.current += 1
      setMatched(matchedRef.current)
      if (matchedRef.current === 10) {
        setTimeout(() => onComplete(wrongRef.current), 700)
      }
    } else {
      setChecking(true)
      setTimeout(() => {
        wrongRef.current += 1
        setWrong(wrongRef.current)
        setFlipped([])
        setChecking(false)
      }, 900)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped])

  function flip(uid: string) {
    if (checking) return
    const card = cards.find(c => c.uid === uid)!
    if (card.matched || flipped.includes(uid) || flipped.length >= 2) return
    setFlipped(prev => [...prev, uid])
  }

  return (
    <div dir="rtl" style={{ padding: "0 0 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#a78bfa" }}>משחק זיכרון — MMPI</span>
        <span style={{ fontSize: 11, color: "var(--muted)" }}>
          {matched}/10 · {wrong} טעויות
        </span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6 }}>
        {cards.map(card => {
          const isUp = flipped.includes(card.uid) || card.matched
          return (
            <div
              key={card.uid}
              onClick={() => flip(card.uid)}
              style={{
                height: 68,
                borderRadius: 9,
                cursor: card.matched || isUp ? "default" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "4px 5px",
                textAlign: "center",
                transition: "background 0.2s, border 0.2s",
                background: card.matched ? "#14532d" : isUp ? "#1e1535" : "#0f0c1a",
                border: card.matched
                  ? "1px solid #22c55e"
                  : isUp
                    ? "1px solid #7c3aed"
                    : "1px solid rgba(124,58,237,0.25)",
                userSelect: "none",
              }}
            >
              {isUp ? (
                card.kind === "num" ? (
                  <span style={{ fontSize: 24, fontWeight: 900, color: card.matched ? "#86efac" : "#c4b5fd" }}>
                    {card.content}
                  </span>
                ) : (
                  <span style={{ fontSize: 9, lineHeight: 1.35, color: card.matched ? "#86efac" : "#e9e3ff" }}>
                    {card.content}
                  </span>
                )
              ) : (
                <span style={{ fontSize: 20, color: "rgba(167,139,250,0.25)" }}>?</span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Assessment Page ────────────────────────────────────────────────────────

type Phase = "quiz" | "memory" | "done"

export default function AssessmentPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isAdmin = session?.user?.isAdmin ?? false
  const isPaid = (session?.user as { isPaid?: boolean })?.isPaid ?? false

  const [questions, setQuestions] = useState<Question[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selected, setSelected] = useState<string | null>(null)
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean[]>([])
  const [phase, setPhase] = useState<Phase>("quiz")
  const [memoryWrong, setMemoryWrong] = useState(0)
  const [loading, setLoading] = useState(true)
  const [seeding, setSeeding] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !isAdmin && !isPaid) router.push("/dashboard")
  }, [status, isAdmin, isPaid, router])

  const loadQuestions = useCallback(async () => {
    setLoading(true)
    const res = await fetch("/api/questions?courseId=bonus&ordered=true")
    const data = await res.json()
    if (Array.isArray(data) && data.length > 0) {
      setQuestions(data)
      setAnsweredCorrectly(new Array(data.length).fill(null))
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    if (status !== "authenticated") return
    if (!isAdmin && !isPaid) return
    const init = async () => {
      setLoading(true)
      const res = await fetch("/api/questions?courseId=bonus&ordered=true")
      const data = await res.json()
      if (Array.isArray(data) && data.length > 0) {
        setQuestions(data)
        setAnsweredCorrectly(new Array(data.length).fill(null))
        setLoading(false)
      } else if (isAdmin) {
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
    setPhase("quiz")
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
      setPhase("memory")
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
    setMemoryWrong(0)
    setPhase("quiz")
  }

  // ── Loading ──
  if (status === "loading" || loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>טוען...</div>
      </div>
    )
  }

  // ── Empty ──
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

  // ── Done ──
  if (phase === "done") {
    const score = answeredCorrectly.filter(v => v === true).length
    const pct = Math.round((score / questions.length) * 100)
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "32px 18px 100px" }}>
        <div style={{ textAlign: "center", paddingTop: 32 }}>
          <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>סיימת!</h2>
          <p style={{ fontSize: 16, color: "var(--muted)", marginBottom: 6 }}>
            שאלות: {score} / {questions.length} נכונות · {pct}%
          </p>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 28 }}>
            זיכרון: הושלם עם {memoryWrong} טעויות
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

  // ── Memory Game ──
  if (phase === "memory") {
    return (
      <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 14px 70px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          <button onClick={() => router.push("/bonus")} style={{ padding: "5px 11px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 7, color: "var(--foreground)", cursor: "pointer", fontSize: 12 }}>
            חזור
          </button>
          <span style={{ color: "var(--muted)", fontSize: 12 }}>שלב 11 — משחק זיכרון</span>
        </div>
        <MemoryGame onComplete={(w) => { setMemoryWrong(w); setPhase("done") }} />
      </div>
    )
  }

  // ── Quiz ──
  const q = questions[currentIndex]
  const topicImage = TOPIC_IMAGES[q?.topic]

  const answers = [
    { letter: "A", text: q.answerA },
    { letter: "B", text: q.answerB },
    { letter: "C", text: q.answerC },
    { letter: "D", text: q.answerD },
  ]

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 14px 70px" }} dir="rtl">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <button onClick={() => router.push("/bonus")} style={{ padding: "5px 11px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 7, color: "var(--foreground)", cursor: "pointer", fontSize: 12, flexShrink: 0 }}>
          חזור
        </button>
        <span style={{ color: "var(--muted)", fontSize: 12, flexShrink: 0 }}>שאלה {currentIndex + 1} / {questions.length}</span>
        <div style={{ flex: 1, height: 3, borderRadius: 4, background: "var(--card-border)", overflow: "hidden" }}>
          <div style={{ height: "100%", background: "#7c3aed", width: `${(currentIndex / questions.length) * 100}%`, transition: "width 0.3s" }} />
        </div>
        {isAdmin && (
          <button onClick={resetSeed} disabled={seeding} style={{ padding: "4px 8px", background: "transparent", border: "1px solid var(--card-border)", borderRadius: 6, color: "var(--muted)", cursor: "pointer", fontSize: 10, flexShrink: 0 }}>
            {seeding ? "..." : "⟳ אפס"}
          </button>
        )}
      </div>

      {topicImage && (
        <div style={{ marginBottom: 10, borderRadius: 12, overflow: "hidden", background: "var(--card)", border: "1px solid var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={topicImage} alt={q.topic} style={{ width: "100%", maxHeight: 130, objectFit: "contain", display: "block" }} />
        </div>
      )}

      <div style={{ marginBottom: 3, fontSize: 10, color: "#a78bfa", fontWeight: 600 }}>{q.topic}</div>

      <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.5, marginBottom: 12, color: "var(--foreground)" }}>
        {q.question}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
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
                padding: "10px 12px",
                borderRadius: 10,
                border,
                background: bg,
                color,
                cursor: selected ? "default" : "pointer",
                textAlign: "right",
                fontSize: 13,
                lineHeight: 1.4,
                display: "flex",
                gap: 8,
                alignItems: "flex-start",
                transition: "all 0.15s",
              }}
            >
              <span style={{ fontWeight: 800, minWidth: 18, color: selected && isCorrect ? "#22c55e" : selected && isSelected && !isCorrect ? "#ef4444" : "#7c3aed" }}>
                {ANSWER_LABELS[letter]}
              </span>
              <span>{text}</span>
            </button>
          )
        })}
      </div>

      {selected && q.explanation ? (
        <div style={{ marginTop: 8, padding: "9px 12px", borderRadius: 8, background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)", fontSize: 12, color: "var(--muted)", lineHeight: 1.5 }}>
          {q.explanation}
        </div>
      ) : null}

      <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
        {currentIndex > 0 && (
          <button onClick={prev} style={{ flex: 1, padding: "11px", background: "var(--card)", color: "var(--foreground)", border: "1px solid var(--card-border)", borderRadius: 10, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            → הקודם
          </button>
        )}
        {selected && (
          <button onClick={next} style={{ flex: 2, padding: "11px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
            {currentIndex + 1 >= questions.length ? "למשחק הזיכרון ←" : "← הבא"}
          </button>
        )}
      </div>
    </div>
  )
}
