"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const COLOR = "#38bdf8"
const GREEN = "#4ade80"

type Stage = {
  order: number
  name: string
  paei: string
  phase: string
  focus: string
  crisis: string
  solution: string
}

const STAGES: Stage[] = [
  {
    order: 1,
    name: "חיזור",
    paei: "paEi",
    phase: "צמיחה",
    focus: "רעיון יזמי (E) של המייסדים",
    crisis: "\"או שזה רק רומן?\" – הרעיון לא יוצא לפועל כי ההתלהבות דעכה או שהמייסד פנה לעיסוק אחר",
    solution: "מעבר מהחלום לעשייה בפועל (שלב הינקות)",
  },
  {
    order: 2,
    name: "ינקות",
    paei: "Paei",
    phase: "צמיחה",
    focus: "ביצועיזם (P); עבודה קשה, הוצאת הרעיון לפועל",
    crisis: "\"מוות מוקדם\" – נסיבות רגולטוריות (חוסר אישורים) או נסיבות חיצוניות/פיננסיות (חוסר תקציב/הלוואות)",
    solution: "גיוס משאבים, קבלת אישורים והתגברות על מכשולים טכניים",
  },
  {
    order: 3,
    name: "זינוק",
    paei: "PaEi",
    phase: "צמיחה",
    focus: "שילוב של יצירתיות (E) וביצוע (P); התרחבות וצמיחה מהירה",
    crisis: "\"מלכודת המייסד\" – המייסד לא משחרר שליטה, קורס תחת העומס, או מתקשה להתמודד עם הבירוקרטיה הנחוצה",
    solution: "המייסד לוקח צעד אחורה ומביא מנכ\"ל מקצועי לניהול הארגון",
  },
  {
    order: 4,
    name: "התבגרות",
    paei: "pAEi",
    phase: "צמיחה",
    focus: "בניית תשתית ארגונית מסודרת (A) לצד יזמות (E)",
    crisis: "\"משבר גירושים\" – קצר ומאבקי כוח בין המנכ\"ל המקצועי לבעלים או בין המייסדים לבין עצמם",
    solution: "גישור או מכירת חלק מהארגון",
  },
  {
    order: 5,
    name: "שיא",
    paei: "PAEI",
    phase: "צמיחה",
    focus: "איזון בין שליטה לגמישות, פרו-אקטיביות, יצירתיות ואינטגרציה פנימית וחיצונית",
    crisis: "אי יישום המאפיינים (כמו קיפאון או חוסר פרו-אקטיביות) מוביל למחצית השנייה של החיים",
    solution: "יישום המאפיינים גמישות, פרו-אקטיביות, יצירתיות ואינטגרציה פנימית וחיצונית",
  },
  {
    order: 6,
    name: "רגיעה",
    paei: "PAeI",
    phase: "הזדקנות",
    focus: "הארגון נראה בשיאו (רווחים גבוהים), אך היצירתיות (e) מתחילה לקטון",
    crisis: "שאננות, תחושת ביטחון מופרזת והפסקת השקעה במחקר ופיתוח",
    solution: "הסתמכות על הצלחות העבר והתעלמות מהצורך להתחדש",
  },
  {
    order: 7,
    name: "אריסטוקרטיה",
    paei: "pAeI",
    phase: "הזדקנות",
    focus: "עייפות, אדישות כלפי לקוחות ודגש על טקסים וסמלי סטטוס (\"ארמונות מתפוררים\")",
    crisis: "אובדן הביצועיזם (p) והיצירתיות (e); הארגון מתנתק מהשטח",
    solution: "שיתופי פעולה עם ארגונים מזדקנים אחרים או קניית סטארטאפים",
  },
  {
    order: 8,
    name: "בירוקרטיה מוקדמת",
    paei: "A-i-",
    phase: "הזדקנות",
    focus: "אין ביצועים או יזמות; נשארים רק חוקים ומעט אינטגרציה פנימית חסרת תועלת",
    crisis: "המשך הדעיכה הטבעית והיעדר כוח אדם ביצועיסטי",
    solution: "מכירת חטיבות או נכסים כדי להרוויח זמן כמו בנייני חברה או זכויות שידור",
  },
  {
    order: 9,
    name: "בירוקרטיה",
    paei: "--A-",
    phase: "הזדקנות",
    focus: "הארגון מורכב אך ורק מחוקים ונהלים חונקים; מנותק לחלוטין מהעולם",
    crisis: "הגעה לשלב הסופי לפני קריסה; איבוד כל תפקוד ניהולי פרט למינהל",
    solution: "ניסיון \"לסחוט\" את הכסף האחרון שנשאר ומכירת שאריות נכסים",
  },
  {
    order: 10,
    name: "מוות",
    paei: "----",
    phase: "הזדקנות",
    focus: "סוף מחזור החיים הארגוני",
    crisis: "לאור כל השלבים שקדמו לו",
    solution: "אין – הארגון חדל מלהתקיים",
  },
]

type Prop = "name" | "paei" | "focus" | "crisis" | "solution"

const PROP_LABELS_GROWTH: Record<Prop, string> = {
  name: "שם השלב",
  paei: "אותיות השלב",
  focus: "מיקוד השלב",
  crisis: "משבר השלב",
  solution: "איך ניתן לפתור את המשבר",
}

const PROP_LABELS_AGING: Record<Prop, string> = {
  name: "שם השלב",
  paei: "אותיות השלב",
  focus: "תיאור השלב",
  crisis: "איך הגענו לשלב",
  solution: "ניסיון לפתרון",
}

const ALL_PROPS: Prop[] = ["name", "paei", "focus", "crisis", "solution"]

type Difficulty = "easy" | "medium" | "hard"

const HIDE_COUNT: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 }

function generateHiddenProps(difficulty: Difficulty): Record<number, Prop[]> {
  const count = HIDE_COUNT[difficulty]
  const map: Record<number, Prop[]> = {}
  for (let i = 0; i < 10; i++) {
    const shuffled = [...ALL_PROPS].sort(() => Math.random() - 0.5)
    map[i] = shuffled.slice(0, count)
  }
  return map
}

// ────────────────────────────────────────────────────
// TIMELINE EXERCISE — drag to sort
// ────────────────────────────────────────────────────
function TimelineExercise({ stages }: { stages: Stage[] }) {
  const [items, setItems] = useState(() => [...stages].sort(() => Math.random() - 0.5).map(s => s.name))
  const [checked, setChecked] = useState(false)
  const [dragIdx, setDragIdx] = useState<number | null>(null)
  const [overIdx, setOverIdx] = useState<number | null>(null)

  // touch refs
  const touchFromIdx = useRef<number | null>(null)
  const touchOverIdx = useRef<number | null>(null)
  const ghostEl = useRef<HTMLDivElement | null>(null)

  function reorder(from: number, to: number) {
    setItems(prev => {
      const next = [...prev]
      const [removed] = next.splice(from, 1)
      next.splice(to, 0, removed)
      return next
    })
  }

  // ── desktop drag ──
  function onDragStart(idx: number) { setDragIdx(idx) }
  function onDragEnter(idx: number) { if (dragIdx !== null && dragIdx !== idx) setOverIdx(idx) }
  function onDragOver(e: React.DragEvent) { e.preventDefault() }
  function onDrop(idx: number) {
    if (dragIdx !== null && dragIdx !== idx) reorder(dragIdx, idx)
    setDragIdx(null); setOverIdx(null)
  }
  function onDragEnd() { setDragIdx(null); setOverIdx(null) }

  // ── touch drag ──
  function onTouchStart(e: React.TouchEvent<HTMLDivElement>, idx: number) {
    touchFromIdx.current = idx
    touchOverIdx.current = idx
    setDragIdx(idx)
    const touch = e.touches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const ghost = e.currentTarget.cloneNode(true) as HTMLDivElement
    ghost.style.cssText = [
      "position:fixed",
      `left:${rect.left}px`,
      `top:${rect.top}px`,
      `width:${rect.width}px`,
      "opacity:0.92",
      "pointer-events:none",
      "z-index:9999",
      "box-shadow:0 10px 32px rgba(0,0,0,0.55)",
      "border-radius:10px",
      `transform:translateY(${touch.clientY - rect.top - rect.height / 2}px)`,
    ].join(";")
    document.body.appendChild(ghost)
    ghostEl.current = ghost
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault()
    const touch = e.touches[0]
    if (ghostEl.current) {
      const w = ghostEl.current.offsetWidth
      ghostEl.current.style.left = `${touch.clientX - w / 2}px`
      ghostEl.current.style.top = `${touch.clientY - ghostEl.current.offsetHeight / 2}px`
      ghostEl.current.style.transform = ""
    }
    // find element under finger
    if (ghostEl.current) ghostEl.current.style.visibility = "hidden"
    const el = document.elementFromPoint(touch.clientX, touch.clientY)
    if (ghostEl.current) ghostEl.current.style.visibility = ""
    let node = el as HTMLElement | null
    while (node) {
      const attr = node.getAttribute?.("data-drag-idx")
      if (attr !== null && attr !== undefined) {
        const i = parseInt(attr)
        touchOverIdx.current = i
        setOverIdx(i)
        break
      }
      node = node.parentElement
    }
  }

  function onTouchEnd() {
    if (ghostEl.current) { document.body.removeChild(ghostEl.current); ghostEl.current = null }
    const from = touchFromIdx.current
    const to = touchOverIdx.current
    if (from !== null && to !== null && from !== to) reorder(from, to)
    touchFromIdx.current = null; touchOverIdx.current = null
    setDragIdx(null); setOverIdx(null)
  }

  const score = items.filter((name, i) => name === stages[i].name).length

  function reset() {
    setItems([...stages].sort(() => Math.random() - 0.5).map(s => s.name))
    setChecked(false)
  }

  return (
    <div style={{ direction: "rtl" }}>
      <div style={{ display: "flex", flexDirection: "column", gap: 5, marginBottom: 20 }}>
        {items.map((name, i) => {
          const isCorrect = checked && name === stages[i].name
          const isWrong   = checked && name !== stages[i].name
          const isOver    = !checked && overIdx === i && dragIdx !== null && dragIdx !== i
          const isDragging = dragIdx === i

          return (
            <div
              key={name}
              data-drag-idx={i}
              draggable={!checked}
              onDragStart={() => onDragStart(i)}
              onDragEnter={() => onDragEnter(i)}
              onDragOver={onDragOver}
              onDrop={() => onDrop(i)}
              onDragEnd={onDragEnd}
              onTouchStart={e => onTouchStart(e, i)}
              onTouchMove={onTouchMove}
              onTouchEnd={onTouchEnd}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "7px 10px",
                borderRadius: 10,
                border: `1.5px solid ${isCorrect ? "#4ade80" : isWrong ? "#f87171" : isOver ? COLOR : "rgba(255,255,255,0.13)"}`,
                background: isCorrect ? "rgba(74,222,128,0.1)" : isWrong ? "rgba(248,113,113,0.09)" : isOver ? `${COLOR}18` : "var(--card)",
                opacity: isDragging ? 0.3 : 1,
                cursor: checked ? "default" : "grab",
                userSelect: "none",
                touchAction: "none",
                transition: "border-color 0.1s, background 0.1s, opacity 0.1s",
              }}
            >
              {!checked && (
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 18, lineHeight: 1, flexShrink: 0 }}>⠿</span>
              )}
              <span style={{ fontSize: 14, fontWeight: 600, flex: 1 }}>{name}</span>
              {isCorrect && <span style={{ color: "#4ade80", fontWeight: 700 }}>✓</span>}
              {isWrong   && <span style={{ color: "#f87171", fontSize: 12 }}>{stages[i].name}</span>}
            </div>
          )
        })}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        {!checked ? (
          <button
            onClick={() => setChecked(true)}
            style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: "none", background: COLOR, color: "#0f172a", fontSize: 14, fontWeight: 700, cursor: "pointer" }}
          >
            בדוק
          </button>
        ) : (
          <>
            <div style={{ flex: 1, textAlign: "center", padding: "11px 0", background: "rgba(255,255,255,0.06)", borderRadius: 10, fontSize: 15, fontWeight: 800, color: score === stages.length ? GREEN : COLOR }}>
              {score}/{stages.length} נכון
            </div>
            <button onClick={reset} style={{ flex: 1, padding: "11px 0", borderRadius: 10, border: `1.5px solid ${COLOR}`, background: "transparent", color: COLOR, fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
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
function FillExercise({ stages }: { stages: Stage[] }) {
  const [diff, setDiff] = useState<Difficulty>("easy")
  const [hiddenPropsMap, setHiddenPropsMap] = useState<Record<number, Prop[]>>(() => generateHiddenProps("easy"))
  const [stageIdx, setStageIdx] = useState(0)
  const [order] = useState(() => [...stages].sort(() => Math.random() - 0.5))
  const [answers, setAnswers] = useState<Record<number, Partial<Record<Prop, string>>>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [done, setDone] = useState(false)

  function reset(d: Difficulty = diff) {
    setStageIdx(0); setAnswers({}); setChecked({}); setDone(false)
    setHiddenPropsMap(generateHiddenProps(d))
  }

  const stage = order[stageIdx]
  const hidden = hiddenPropsMap[stageIdx] ?? []
  const nameIsHidden = hidden.includes("name")
  const isChecked = !!checked[stageIdx]
  const curAnswers = answers[stageIdx] ?? {}
  const allAnswered = hidden.every(p => (curAnswers[p] ?? "").trim() !== "")
  const propLabels = stage.phase === "צמיחה" ? PROP_LABELS_GROWTH : PROP_LABELS_AGING

  function setAnswer(prop: Prop, val: string) {
    if (isChecked) return
    setAnswers(prev => ({ ...prev, [stageIdx]: { ...(prev[stageIdx] ?? {}), [prop]: val } }))
  }

  function nextStage() {
    if (stageIdx < order.length - 1) setStageIdx(i => i + 1); else setDone(true)
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", direction: "rtl", paddingTop: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: COLOR, marginBottom: 16 }}>סיימת את כל 10 השלבים!</div>
        <button onClick={() => reset()} style={{ padding: "12px 32px", borderRadius: 12, border: "none", background: COLOR, color: "#0f172a", fontWeight: 700, fontSize: 15, cursor: "pointer" }}>
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
          <button key={d} onClick={() => { setDiff(d); reset(d) }} style={{
            flex: 1, padding: "7px 0", borderRadius: 8,
            border: `1.5px solid ${diff === d ? COLOR : "rgba(255,255,255,0.12)"}`,
            background: diff === d ? `${COLOR}22` : "transparent",
            color: diff === d ? COLOR : "var(--muted)", fontWeight: 700, fontSize: 13, cursor: "pointer",
          }}>
            {d === "easy" ? "קל" : d === "medium" ? "בינוני" : "קשה"}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: "var(--muted)" }}>שלב {stageIdx + 1} מתוך {order.length}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 4, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(stageIdx / 10) * 100}%`, background: COLOR, borderRadius: 4, transition: "width 0.3s" }} />
      </div>

      {/* Stage card */}
      <div style={{
        background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
        border: `1.5px solid ${COLOR}44`, borderRadius: 14, padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontSize: 26, fontWeight: 900, marginBottom: 18, color: nameIsHidden ? "rgba(255,255,255,0.3)" : COLOR }}>
          {nameIsHidden ? "???" : stage.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ALL_PROPS.map(prop => {
            const isHidden = hidden.includes(prop)
            const correctVal = stage[prop]
            const userAnswer = curAnswers[prop] ?? ""

            return (
              <div key={prop}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 5 }}>{propLabels[prop]}</div>
                {!isHidden ? (
                  <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", fontSize: 13, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.5 }}>
                    {correctVal}
                  </div>
                ) : (
                  <div>
                    <textarea
                      value={userAnswer}
                      onChange={e => setAnswer(prop, e.target.value)}
                      readOnly={isChecked}
                      placeholder="כתוב תשובה..."
                      rows={2}
                      style={{
                        width: "100%", boxSizing: "border-box",
                        background: "rgba(255,255,255,0.06)",
                        border: "1.5px solid rgba(255,255,255,0.15)",
                        borderRadius: 8, color: "var(--foreground)", fontSize: 13,
                        padding: "8px 12px", resize: "none", direction: "rtl",
                        fontFamily: "inherit", lineHeight: 1.5, outline: "none",
                      }}
                    />
                    {isChecked && (
                      <div style={{ marginTop: 6, padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${COLOR}33` }}>
                        <span style={{ fontSize: 11, color: "var(--muted)" }}>תשובה נכונה: </span>
                        <span style={{ fontSize: 13, fontWeight: 800, color: GREEN, lineHeight: 1.5 }}>{correctVal}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action */}
      {!isChecked ? (
        <button disabled={!allAnswered} onClick={() => setChecked(prev => ({ ...prev, [stageIdx]: true }))}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: allAnswered ? COLOR : "rgba(255,255,255,0.1)", color: allAnswered ? "#0f172a" : "var(--muted)", fontWeight: 700, fontSize: 14, cursor: allAnswered ? "pointer" : "not-allowed" }}>
          בדוק
        </button>
      ) : (
        <button onClick={nextStage}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLOR, color: "#0f172a", fontWeight: 700, fontSize: 14, cursor: "pointer" }}>
          {stageIdx < order.length - 1 ? "הבא" : "סיום"}
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────
// ADMIN EDIT MODE
// ────────────────────────────────────────────────────
const EDIT_FIELDS: { key: keyof Stage; label: string }[] = [
  { key: "name",     label: "שם השלב" },
  { key: "paei",     label: "אותיות" },
  { key: "phase",    label: "שלב (צמיחה / הזדקנות)" },
  { key: "focus",    label: "מיקוד / תיאור" },
  { key: "crisis",   label: "משבר / כניסה לשלב" },
  { key: "solution", label: "פתרון / ניסיון" },
]

function AdminEditMode({ stages, onSave, onCancel }: {
  stages: Stage[]
  onSave: (s: Stage[]) => void
  onCancel: () => void
}) {
  const [data, setData] = useState<Stage[]>(stages.map(s => ({ ...s })))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function update(idx: number, field: keyof Stage, val: string) {
    setData(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s))
  }

  async function save() {
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/lifecycle-stages", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stages: data }),
      })
      if (res.ok) onSave(data)
      else setError("שגיאה בשמירה")
    } catch {
      setError("שגיאה בשמירה")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 14px 80px", direction: "rtl" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>עריכת שלבי מחזור החיים</h1>
        <button onClick={onCancel} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 13 }}>
          ביטול
        </button>
      </div>

      {data.map((stage, idx) => (
        <div key={stage.order} style={{ marginBottom: 24, padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "var(--card)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLOR, marginBottom: 14 }}>
            {stage.order}. {stage.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EDIT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <textarea
                  value={stage[key]}
                  onChange={e => update(idx, key, e.target.value)}
                  rows={key === "name" || key === "paei" || key === "phase" ? 1 : 3}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, color: "var(--foreground)", fontSize: 13,
                    padding: "7px 10px", resize: "vertical", direction: "rtl",
                    fontFamily: "inherit", lineHeight: 1.5, outline: "none",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      ))}

      {error && <div style={{ color: "#f87171", marginBottom: 12, fontSize: 13 }}>{error}</div>}

      <button
        onClick={save}
        disabled={saving}
        style={{ width: "100%", padding: "13px 0", borderRadius: 12, border: "none", background: saving ? "rgba(255,255,255,0.1)" : GREEN, color: "#0f172a", fontWeight: 800, fontSize: 15, cursor: saving ? "not-allowed" : "pointer" }}
      >
        {saving ? "שומר..." : "שמור הכל"}
      </button>
    </div>
  )
}

// ────────────────────────────────────────────────────
// MAIN PAGE
// ────────────────────────────────────────────────────
type Tab = "timeline" | "fill"

export default function LifecyclePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [tab, setTab] = useState<Tab>("timeline")
  const [stages, setStages] = useState<Stage[] | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    fetch("/api/admin/lifecycle-stages")
      .then(r => r.json())
      .then(data => setStages(data.stages ?? STAGES))
      .catch(() => setStages(STAGES))
  }, [])

  if (status === "loading" || !stages) return null

  const isAdmin = !!(session?.user as { isAdmin?: boolean })?.isAdmin

  if (editMode && isAdmin) {
    return (
      <AdminEditMode
        stages={stages}
        onSave={s => { setStages(s); setEditMode(false) }}
        onCancel={() => setEditMode(false)}
      />
    )
  }

  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "12px 14px 60px", direction: "rtl" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
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
          }}
        >
          חזרה לקורס
        </button>
        {isAdmin && (
          <button
            onClick={() => setEditMode(true)}
            style={{
              background: "transparent",
              border: `1px solid ${COLOR}66`,
              borderRadius: 10,
              color: COLOR,
              cursor: "pointer",
              fontSize: 12,
              fontWeight: 600,
              padding: "7px 14px",
            }}
          >
            עריכת תוכן
          </button>
        )}
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>מחזור החיים הארגוני</h1>

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

      {tab === "timeline" ? <TimelineExercise stages={stages} /> : <FillExercise stages={stages} />}
    </div>
  )
}
