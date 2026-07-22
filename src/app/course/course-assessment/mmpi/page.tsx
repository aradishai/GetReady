"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const MMPI_PAIRS = [
  { id: 1,  num: "1",  def: "מוטרד בנוגע לבריאות" },
  { id: 2,  num: "2",  def: "דכאון" },
  { id: 3,  num: "3",  def: "תלונות סומטיות, הכחשה של בעיות נפשיות" },
  { id: 4,  num: "4",  def: "התנהגות אנטי חברתית" },
  { id: 5,  num: "5",  def: "תחומי עניין לא סטנדרטיים לפי המגדר" },
  { id: 6,  num: "6",  def: "חשדנות" },
  { id: 7,  num: "7",  def: "חרדה" },
  { id: 8,  num: "8",  def: "מחשבות טורדניות" },
  { id: 9,  num: "9",  def: "מצב רוח מאני" },
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

export default function MmpiMemoryPage() {
  const router = useRouter()
  const { status } = useSession()

  const [cards, setCards] = useState<MemCard[]>(() => makeCards())
  const [flipped, setFlipped] = useState<string[]>([])
  const [wrong, setWrong] = useState(0)
  const [matched, setMatched] = useState(0)
  const [checking, setChecking] = useState(false)
  const [done, setDone] = useState(false)
  const wrongRef = useRef(0)
  const matchedRef = useRef(0)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

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
        setTimeout(() => setDone(true), 700)
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

  function restart() {
    setCards(makeCards())
    setFlipped([])
    wrongRef.current = 0
    matchedRef.current = 0
    setWrong(0)
    setMatched(0)
    setChecking(false)
    setDone(false)
  }

  const visibleCards = cards.filter(c => !c.matched)
  const foundPairs = MMPI_PAIRS.filter(p => cards.some(c => c.pairId === p.id && c.matched))
                               .sort((a, b) => a.id - b.id)

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "12px 14px 70px" }} dir="rtl">
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <button
          onClick={() => router.push("/course/course-assessment")}
          style={{ padding: "5px 11px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 7, color: "var(--foreground)", cursor: "pointer", fontSize: 12 }}
        >
          חזור
        </button>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa" }}>משחק זיכרון — סקאלות MMPI</span>
      </div>

      {done ? (
        <div style={{ textAlign: "center", paddingTop: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🎉</div>
          <h2 style={{ fontSize: 22, fontWeight: 800, marginBottom: 8 }}>כל הכבוד!</h2>
          <p style={{ color: "var(--muted)", marginBottom: 24 }}>הושלם עם {wrong} טעויות</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
            <button onClick={restart} style={{ padding: "11px 24px", background: "#7c3aed", color: "#fff", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              שחק שוב
            </button>
            <button onClick={() => router.push("/course/course-assessment")} style={{ padding: "11px 20px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, fontSize: 14, color: "var(--foreground)", cursor: "pointer" }}>
              חזור לקורס
            </button>
          </div>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>התאם כל מספר סקאלה להגדרה שלה</span>
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{matched}/10 · {wrong} טעויות</span>
          </div>

          {visibleCards.length > 0 && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 6, marginBottom: 16 }}>
              {visibleCards.map(card => {
                const isUp = flipped.includes(card.uid)
                return (
                  <div
                    key={card.uid}
                    onClick={() => flip(card.uid)}
                    style={{
                      height: 80,
                      borderRadius: 9,
                      cursor: isUp ? "default" : "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "4px 5px",
                      textAlign: "center",
                      transition: "background 0.2s, border 0.2s",
                      background: isUp ? "#1e1535" : "#0f0c1a",
                      border: isUp ? "1px solid #7c3aed" : "1px solid rgba(124,58,237,0.25)",
                      userSelect: "none",
                    }}
                  >
                    {isUp ? (
                      card.kind === "num" ? (
                        <span style={{ fontSize: 24, fontWeight: 900, color: "#c4b5fd" }}>{card.content}</span>
                      ) : (
                        <span style={{ fontSize: 11, lineHeight: 1.35, color: "#e9e3ff" }}>{card.content}</span>
                      )
                    ) : (
                      <span style={{ fontSize: 20, color: "rgba(167,139,250,0.25)" }}>?</span>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {foundPairs.length > 0 && (
            <div style={{ borderRadius: 12, overflow: "hidden", border: "1px solid rgba(124,58,237,0.25)" }}>
              {foundPairs.map((p, i) => (
                <div
                  key={p.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "36px 1fr",
                    alignItems: "center",
                    padding: "9px 14px",
                    background: i % 2 === 0 ? "rgba(124,58,237,0.06)" : "transparent",
                    borderBottom: i < foundPairs.length - 1 ? "1px solid rgba(124,58,237,0.1)" : "none",
                  }}
                >
                  <span style={{ fontSize: 17, fontWeight: 900, color: "#a78bfa", textAlign: "center" }}>{p.num}</span>
                  <span style={{ fontSize: 12, color: "var(--foreground)", lineHeight: 1.4 }}>{p.def}</span>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
