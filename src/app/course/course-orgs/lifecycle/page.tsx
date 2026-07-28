"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const COLOR = "#38bdf8"

const STAGES = [
  {
    order: 1,
    name: "חיזור",
    paei: "paEi",
    phase: "צמיחה",
    driver: "יזמות (E)",
    feature: "גיבוש רעיון לפני הקמת הארגון",
    crisis: "כיבוי התשוקה / מוות מוקדם",
  },
  {
    order: 2,
    name: "ינקות",
    paei: "Paei",
    phase: "צמיחה",
    driver: "ביצוע (P)",
    feature: "מעבר לעשייה מעשית, מעשים מקדימים תכנון",
    crisis: "מוות מוקדם (חוסר משאבים)",
  },
  {
    order: 3,
    name: "זינוק",
    paei: "PaEi",
    phase: "צמיחה",
    driver: "ביצוע ויזמות (P+E)",
    feature: "צמיחה מהירה וזיהוי הזדמנויות",
    crisis: "מלכודת המייסד",
  },
  {
    order: 4,
    name: "התבגרות",
    paei: "pAEi",
    phase: "צמיחה",
    driver: "מינהול ויזמות (A+E)",
    feature: "בניית מבנה ונהלים, כאבי גדילה",
    crisis: "גירושין (מייסד מול מקצוענים)",
  },
  {
    order: 5,
    name: "שיא",
    paei: "PAEI",
    phase: "צמיחה",
    driver: "כל ארבעת התפקידים מאוזנים",
    feature: "איזון בין יעילות לחדשנות",
    crisis: "שמירה על השיא לאורך זמן",
  },
  {
    order: 6,
    name: "רגיעה",
    paei: "PAeI",
    phase: "הזדקנות",
    driver: "ביצוע, מינהול ותיאום (ירידה ב-E)",
    feature: "שביעות רצון, ירידה בחדשנות",
    crisis: "תחילת הדעיכה הסמויה",
  },
  {
    order: 7,
    name: "אריסטוקרטיה",
    paei: "pAeI",
    phase: "הזדקנות",
    driver: "מינהול ותיאום (A+I)",
    feature: "יוקרה ופורמליות, הסתמכות על עבר",
    crisis: "ניתוק מהמציאות העסקית",
  },
  {
    order: 8,
    name: "בירוקרטיה מוקדמת",
    paei: "A-i-",
    phase: "הזדקנות",
    driver: "מינהול (A)",
    feature: "מאבקי כוח, האשמות פנימיות",
    crisis: "פוליטיקה פנים-ארגונית",
  },
  {
    order: 9,
    name: "בירוקרטיה",
    paei: "--A-",
    phase: "הזדקנות",
    driver: "מינהול בלבד (A)",
    feature: "נוהלים נוקשים, ריחוק מהלקוח",
    crisis: "תלות מוחלטת בגורם חיצוני",
  },
  {
    order: 10,
    name: "מוות",
    paei: "----",
    phase: "הזדקנות",
    driver: "אין תפקיד פעיל",
    feature: "הפסקת פעילות ופירוק",
    crisis: "אין דרך חזרה",
  },
]

type Prop = "paei" | "phase" | "driver" | "feature" | "crisis"
const PROP_LABELS: Record<Prop, string> = {
  paei: "קוד PAEI",
  phase: "שלב",
  driver: "כוח מניע",
  feature: "מאפיין מרכזי",
  crisis: "משבר / סיכון",
}

const ALL_PROPS: Prop[] = ["paei", "phase", "driver", "feature", "crisis"]

function getOptions(prop: Prop, correct: string, count = 4): string[] {
  const all = STAGES.map(s => s[prop]).filter((v, i, a) => a.indexOf(v) === i)
  const distractors = all.filter(v => v !== correct)
  const picked: string[] = []
  const shuffled = [...distractors].sort(() => Math.random() - 0.5)
  for (const d of shuffled) {
    if (picked.length >= count - 1) break
    picked.push(d)
  }
  return [correct, ...picked].sort(() => Math.random() - 0.5)
}

// ────────────────────────────────────────────────────
// TIMELINE EXERCISE
// ────────────────────────────────────────────────────
function TimelineExercise() {
  const [order, setOrder] = useState<(string | null)[]>(() => Array(10).fill(null))
  const [shuffled] = useState(() => [...STAGES].sort(() => Math.random() - 0.5))
  const [checked, setChecked] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const usedSlots = new Set(order.filter(Boolean))
  const correct = order.filter((n, i) => n === STAGES[i].name).length

  function handleCardClick(name: string) {
    if (checked) return
    if (selected === name) { setSelected(null); return }
    setSelected(name)
  }

  function handleSlotClick(idx: number) {
    if (checked) return
    if (!selected) return
    const newOrder = [...order]
    // If there's already something in this slot, move it back (swap or clear)
    const prevIdx = newOrder.indexOf(selected)
    if (prevIdx !== -1) newOrder[prevIdx] = null
    // If slot had something, move that back to free
    newOrder[idx] = selected
    setOrder(newOrder)
    setSelected(null)
  }

  function removeFromSlot(idx: number) {
    if (checked) return
    const newOrder = [...order]
    newOrder[idx] = null
    setOrder(newOrder)
  }

  function reset() {
    setOrder(Array(10).fill(null))
    setChecked(false)
    setSelected(null)
  }

  const allFilled = order.every(Boolean)

  return (
    <div style={{ direction: "rtl" }}>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 16, lineHeight: 1.5 }}>
        סדר את 10 שלבי מחזור החיים לפי סדרם — מחיזור עד מוות.
        <br />לחץ על שם שלב ואז על המיקום הנכון.
      </p>

      {/* Slots */}
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
        {STAGES.map((stage, i) => {
          const placed = order[i]
          const isCorrect = checked && placed === stage.name
          const isWrong = checked && placed !== null && placed !== stage.name
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <div style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: i < 5 ? `${COLOR}22` : "rgba(248,113,113,0.15)",
                border: `1.5px solid ${i < 5 ? COLOR : "#f87171"}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: i < 5 ? COLOR : "#f87171",
                flexShrink: 0,
              }}>
                {i + 1}
              </div>
              <div
                onClick={() => placed ? removeFromSlot(i) : handleSlotClick(i)}
                style={{
                  flex: 1,
                  minHeight: 38,
                  border: `1.5px dashed ${isCorrect ? "#4ade80" : isWrong ? "#f87171" : placed ? COLOR : "rgba(255,255,255,0.2)"}`,
                  borderRadius: 8,
                  background: isCorrect ? "rgba(74,222,128,0.12)" : isWrong ? "rgba(248,113,113,0.12)" : placed ? `${COLOR}18` : "transparent",
                  display: "flex",
                  alignItems: "center",
                  paddingRight: 12,
                  cursor: placed ? "pointer" : selected ? "pointer" : "default",
                  fontSize: 14,
                  fontWeight: placed ? 600 : 400,
                  color: placed ? "var(--foreground)" : "var(--muted)",
                  transition: "all 0.15s",
                }}
              >
                {placed ?? "לחץ למיקום"}
                {placed && !checked && (
                  <span style={{ marginRight: "auto", marginLeft: 8, fontSize: 10, color: "var(--muted)" }}>✕</span>
                )}
                {isCorrect && <span style={{ marginRight: "auto", marginLeft: 8 }}>✓</span>}
                {isWrong && <span style={{ marginRight: "auto", marginLeft: 8, color: "#f87171", fontSize: 11 }}>✕ {stage.name}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Stage cards */}
      {!checked && (
        <>
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
            {selected ? `בחרת: "${selected}" — לחץ על מיקום` : "בחר שלב:"}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {shuffled.map(s => {
              const isPlaced = usedSlots.has(s.name)
              const isSel = selected === s.name
              return (
                <button
                  key={s.name}
                  disabled={isPlaced}
                  onClick={() => handleCardClick(s.name)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: `1.5px solid ${isSel ? COLOR : isPlaced ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.2)"}`,
                    background: isSel ? `${COLOR}30` : isPlaced ? "rgba(255,255,255,0.04)" : "var(--card)",
                    color: isPlaced ? "var(--muted)" : "var(--foreground)",
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: isPlaced ? "not-allowed" : "pointer",
                    opacity: isPlaced ? 0.4 : 1,
                    transition: "all 0.12s",
                  }}
                >
                  {s.name}
                </button>
              )
            })}
          </div>
        </>
      )}

      {/* Buttons */}
      <div style={{ display: "flex", gap: 10 }}>
        {!checked ? (
          <button
            disabled={!allFilled}
            onClick={() => setChecked(true)}
            style={{
              flex: 1,
              padding: "11px 0",
              borderRadius: 10,
              border: "none",
              background: allFilled ? COLOR : "rgba(255,255,255,0.1)",
              color: allFilled ? "#0f172a" : "var(--muted)",
              fontSize: 14,
              fontWeight: 700,
              cursor: allFilled ? "pointer" : "not-allowed",
            }}
          >
            בדוק
          </button>
        ) : (
          <>
            <div style={{ flex: 1, textAlign: "center", padding: "11px 0", background: "rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 15, fontWeight: 800, color: correct === 10 ? "#4ade80" : COLOR }}>
              {correct}/10 נכון
            </div>
            <button
              onClick={reset}
              style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1.5px solid ${COLOR}`, background: "transparent", color: COLOR, fontSize: 14, fontWeight: 700, cursor: "pointer" }}
            >
              נסה שוב
            </button>
          </>
        )}
      </div>
    </div>
  )
}

// ────────────────────────────────────────────────────
// FILL IN EXERCISE
// ────────────────────────────────────────────────────
type Difficulty = "easy" | "medium" | "hard"

const HIDDEN_BY_DIFFICULTY: Record<Difficulty, Prop[]> = {
  easy: ["feature", "crisis"],
  medium: ["driver", "feature", "crisis"],
  hard: ["phase", "driver", "feature", "crisis"],
}

interface StageOptions {
  paei: string[]
  phase: string[]
  driver: string[]
  feature: string[]
  crisis: string[]
}

function buildOptions(stage: typeof STAGES[0]): StageOptions {
  return {
    paei: getOptions("paei", stage.paei),
    phase: ["צמיחה", "הזדקנות"],
    driver: getOptions("driver", stage.driver),
    feature: getOptions("feature", stage.feature),
    crisis: getOptions("crisis", stage.crisis),
  }
}

function FillExercise() {
  const [diff, setDiff] = useState<Difficulty>("easy")
  const [stageIdx, setStageIdx] = useState(0)
  const [order] = useState(() => [...STAGES].sort(() => Math.random() - 0.5))
  const [answers, setAnswers] = useState<Record<number, Partial<Record<Prop, string>>>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [optionsMap] = useState<StageOptions[]>(() => STAGES.map(s => buildOptions(s)))
  const [done, setDone] = useState(false)

  function reset() {
    setStageIdx(0)
    setAnswers({})
    setChecked({})
    setDone(false)
  }

  const stage = order[stageIdx]
  const stageOriginalIdx = STAGES.findIndex(s => s.name === stage.name)
  const opts = optionsMap[stageOriginalIdx]
  const hidden = HIDDEN_BY_DIFFICULTY[diff]
  const shown = ALL_PROPS.filter(p => !hidden.includes(p))
  const isChecked = !!checked[stageIdx]

  const curAnswers = answers[stageIdx] ?? {}
  const allAnswered = hidden.every(p => curAnswers[p] !== undefined)

  function setAnswer(prop: Prop, val: string) {
    if (isChecked) return
    setAnswers(prev => ({ ...prev, [stageIdx]: { ...(prev[stageIdx] ?? {}), [prop]: val } }))
  }

  function checkStage() {
    setChecked(prev => ({ ...prev, [stageIdx]: true }))
  }

  function nextStage() {
    if (stageIdx < order.length - 1) {
      setStageIdx(i => i + 1)
    } else {
      setDone(true)
    }
  }

  // Score
  const totalChecked = Object.keys(checked).length
  const totalCorrect = Object.entries(checked).filter(([idxStr]) => {
    const idx = parseInt(idxStr)
    const s = order[idx]
    const ans = answers[idx] ?? {}
    return hidden.every(p => ans[p] === s[p])
  }).length

  if (done) {
    return (
      <div style={{ textAlign: "center", direction: "rtl", paddingTop: 20 }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>
          {totalCorrect === 10 ? "🏆" : totalCorrect >= 7 ? "⭐" : "📚"}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: totalCorrect === 10 ? "#4ade80" : COLOR, marginBottom: 8 }}>
          {totalCorrect}/10 שלבים נכונים
        </div>
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 24 }}>
          {totalCorrect === 10 ? "מושלם! שלטת בכל שלבי מחזור החיים" :
            totalCorrect >= 7 ? "טוב מאוד! עוד קצת תרגול ותגיע לשלמות" :
              "המשך להתאמן — מחזור החיים דורש חזרות"}
        </div>
        <button
          onClick={reset}
          style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: COLOR, color: "#0f172a", fontWeight: 700, fontSize: 15, cursor: "pointer" }}
        >
          תרגל שוב
        </button>
      </div>
    )
  }

  return (
    <div style={{ direction: "rtl" }}>
      {/* Difficulty */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {(["easy", "medium", "hard"] as Difficulty[]).map(d => (
          <button
            key={d}
            onClick={() => { setDiff(d); reset() }}
            style={{
              flex: 1,
              padding: "7px 0",
              borderRadius: 8,
              border: `1.5px solid ${diff === d ? COLOR : "rgba(255,255,255,0.12)"}`,
              background: diff === d ? `${COLOR}22` : "transparent",
              color: diff === d ? COLOR : "var(--muted)",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {d === "easy" ? "קל" : d === "medium" ? "בינוני" : "קשה"}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>שלב {stageIdx + 1} מתוך {order.length}</span>
        <span style={{ fontSize: 12, color: COLOR, fontWeight: 700 }}>{totalCorrect}/{totalChecked} נכון</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 4, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(stageIdx / 10) * 100}%`, background: COLOR, borderRadius: 4, transition: "width 0.3s" }} />
      </div>

      {/* Stage card */}
      <div style={{
        background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
        border: `1.5px solid ${COLOR}44`,
        borderRadius: 14,
        padding: 16,
        marginBottom: 16,
      }}>
        <div style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: COLOR }}>{stage.name}</div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {ALL_PROPS.map(prop => {
            const isHidden = hidden.includes(prop)
            const correctVal = stage[prop]
            const answer = curAnswers[prop]
            const isRight = isChecked && answer === correctVal
            const isWrong = isChecked && answer !== undefined && answer !== correctVal
            const options = opts[prop]

            return (
              <div key={prop} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600 }}>{PROP_LABELS[prop]}</div>
                {!isHidden ? (
                  <div style={{
                    padding: "7px 12px",
                    borderRadius: 8,
                    background: "rgba(255,255,255,0.06)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "var(--foreground)",
                  }}>
                    {correctVal}
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    {options.map(opt => {
                      const isSel = answer === opt
                      const bg = isSel && isWrong ? "rgba(248,113,113,0.2)"
                        : opt === correctVal && isChecked ? "rgba(74,222,128,0.2)"
                          : isSel ? `${COLOR}22`
                            : "transparent"
                      const border = isSel && isWrong ? "#f87171"
                        : opt === correctVal && isChecked ? "#4ade80"
                          : isSel ? COLOR
                            : "rgba(255,255,255,0.12)"
                      return (
                        <button
                          key={opt}
                          onClick={() => setAnswer(prop, opt)}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 8,
                            border: `1.5px solid ${border}`,
                            background: bg,
                            color: "var(--foreground)",
                            fontSize: 13,
                            fontWeight: isSel || (opt === correctVal && isChecked) ? 600 : 400,
                            cursor: isChecked ? "default" : "pointer",
                            textAlign: "right",
                            transition: "all 0.12s",
                          }}
                        >
                          {opt}
                          {opt === correctVal && isChecked && " ✓"}
                          {isSel && isWrong && " ✗"}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action */}
      {!isChecked ? (
        <button
          disabled={!allAnswered}
          onClick={checkStage}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background: allAnswered ? COLOR : "rgba(255,255,255,0.1)",
            color: allAnswered ? "#0f172a" : "var(--muted)",
            fontWeight: 700,
            fontSize: 14,
            cursor: allAnswered ? "pointer" : "not-allowed",
          }}
        >
          בדוק
        </button>
      ) : (
        <button
          onClick={nextStage}
          style={{
            width: "100%",
            padding: "12px 0",
            borderRadius: 10,
            border: "none",
            background: COLOR,
            color: "#0f172a",
            fontWeight: 700,
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {stageIdx < order.length - 1 ? "הבא ←" : "סיום"}
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────
type Tab = "timeline" | "fill"

export default function LifecyclePage() {
  const router = useRouter()
  const { status } = useSession()
  const [tab, setTab] = useState<Tab>("timeline")

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  if (status === "loading") return null

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 14px 60px", direction: "rtl" }}>
      <button
        onClick={() => router.push("/course/course-orgs")}
        style={{
          background: "var(--card)",
          border: "1px solid var(--card-border)",
          borderRadius: 10,
          color: "var(--foreground)",
          cursor: "pointer",
          fontSize: 13,
          fontWeight: 600,
          padding: "7px 14px",
          marginBottom: 16,
        }}
      >
        ← חזרה לקורס
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ fontSize: 24 }}>🔄</span>
        <h1 style={{ fontSize: 20, fontWeight: 800, margin: 0 }}>מחזור החיים הארגוני</h1>
      </div>
      <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 20 }}>
        תרגולים אינטראקטיביים — מודל אדיג&#39;ס
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {([["timeline", "ציר זמן"], ["fill", "מלא את החסר"]] as [Tab, string][]).map(([t, label]) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: "9px 0",
              borderRadius: 10,
              border: `1.5px solid ${tab === t ? COLOR : "rgba(255,255,255,0.12)"}`,
              background: tab === t ? `${COLOR}22` : "var(--card)",
              color: tab === t ? COLOR : "var(--muted)",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "timeline" ? <TimelineExercise /> : <FillExercise />}
    </div>
  )
}
