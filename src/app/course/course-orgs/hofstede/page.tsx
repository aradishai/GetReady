"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const COLOR = "#38bdf8"
const GREEN = "#4ade80"

type Dimension = {
  order: number
  name: string
  checks: string
  high: string
  low: string
  israel: string
}

const DEFAULT_DIMENSIONS: Dimension[] = [
  {
    order: 1,
    name: "מרחק עוצמה",
    checks: "עד כמה מכבדים היררכיה, סמכות ומרחק בין מנהלים לעובדים",
    high: "היררכיה חזקה, כבוד לסמכות, מרחק בין מנהל לעובד",
    low: "שוויוניות, נגישות למנהלים, פחות פורמליות",
    israel: "13 – נמוך מאוד",
  },
  {
    order: 2,
    name: "אינדיבידואליזם",
    checks: "האם הפרט או הקבוצה נמצאים במרכז",
    high: "הצלחה אישית, תחרותיות, אחריות אישית",
    low: "קבוצה, משפחה, חמולה, טובת הכלל",
    israel: "56 – בינוני, נוטה לאינדיבידואליזם",
  },
  {
    order: 3,
    name: "מוטיבציה להשיג ולהצליח",
    checks: "עד כמה התרבות הישגית ותחרותית",
    high: "תחרותיות, הישגיות, הצלחה",
    low: "פחות תחרות, דגש על איכות חיים ושיתוף פעולה",
    israel: "47 – יחסית גבוה",
  },
  {
    order: 4,
    name: "הימנעות מאי־ודאות",
    checks: "עד כמה אנשים זקוקים לחוקים, נהלים וודאות",
    high: "הרבה חוקים ונהלים, סדר, צורך בוודאות",
    low: "גמישות, סובלנות לאי־ודאות, פחות נהלים",
    israel: "81 – גבוה (יש הרבה חוקים, אך לא תמיד מצייתים להם)",
  },
]

type Prop = "name" | "checks" | "high" | "low" | "israel"

const PROP_LABELS: Record<Prop, string> = {
  name: "שם הממד",
  checks: "מה הוא בודק",
  high: "מדד גבוה",
  low: "מדד נמוך",
  israel: "מצבה של ישראל",
}

const ALL_PROPS: Prop[] = ["name", "checks", "high", "low", "israel"]

type Difficulty = "easy" | "medium" | "hard"

const HIDE_COUNT: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 }

function generateHiddenProps(difficulty: Difficulty): Record<number, Prop[]> {
  const count = HIDE_COUNT[difficulty]
  const map: Record<number, Prop[]> = {}
  for (let i = 0; i < 4; i++) {
    const shuffled = [...ALL_PROPS].sort(() => Math.random() - 0.5)
    map[i] = shuffled.slice(0, count)
  }
  return map
}

// ────────────────────────────────────────────────────
// FILL EXERCISE
// ────────────────────────────────────────────────────
function FillExercise({ dimensions }: { dimensions: Dimension[] }) {
  const [diff, setDiff] = useState<Difficulty>("easy")
  const [hiddenPropsMap, setHiddenPropsMap] = useState<Record<number, Prop[]>>(() => generateHiddenProps("easy"))
  const [dimIdx, setDimIdx] = useState(0)
  const [order] = useState(() => [...dimensions].sort(() => Math.random() - 0.5))
  const [answers, setAnswers] = useState<Record<number, Partial<Record<Prop, string>>>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [done, setDone] = useState(false)

  function reset(d: Difficulty = diff) {
    setDimIdx(0); setAnswers({}); setChecked({}); setDone(false)
    setHiddenPropsMap(generateHiddenProps(d))
  }

  const dim = order[dimIdx]
  const hidden = hiddenPropsMap[dimIdx] ?? []
  const nameIsHidden = hidden.includes("name")
  const isChecked = !!checked[dimIdx]
  const curAnswers = answers[dimIdx] ?? {}
  const allAnswered = hidden.every(p => (curAnswers[p] ?? "").trim() !== "")

  function setAnswer(prop: Prop, val: string) {
    if (isChecked) return
    setAnswers(prev => ({ ...prev, [dimIdx]: { ...(prev[dimIdx] ?? {}), [prop]: val } }))
  }

  function next() {
    if (dimIdx < order.length - 1) setDimIdx(i => i + 1); else setDone(true)
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", direction: "rtl", paddingTop: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: COLOR, marginBottom: 16 }}>
          סיימת את כל {dimensions.length} הממדים!
        </div>
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
        <span style={{ fontSize: 12, color: "var(--muted)" }}>ממד {dimIdx + 1} מתוך {order.length}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 4, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(dimIdx / dimensions.length) * 100}%`, background: COLOR, borderRadius: 4, transition: "width 0.3s" }} />
      </div>

      {/* Card */}
      <div style={{
        background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
        border: `1.5px solid ${COLOR}44`, borderRadius: 14, padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 18, color: nameIsHidden ? "rgba(255,255,255,0.3)" : COLOR }}>
          {nameIsHidden ? "???" : dim.name}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {ALL_PROPS.map(prop => {
            const isHidden = hidden.includes(prop)
            const correctVal = dim[prop]
            const userAnswer = curAnswers[prop] ?? ""

            return (
              <div key={prop}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 5 }}>{PROP_LABELS[prop]}</div>
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
        <button
          disabled={!allAnswered}
          onClick={() => setChecked(prev => ({ ...prev, [dimIdx]: true }))}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: allAnswered ? COLOR : "rgba(255,255,255,0.1)", color: allAnswered ? "#0f172a" : "var(--muted)", fontWeight: 700, fontSize: 14, cursor: allAnswered ? "pointer" : "not-allowed" }}
        >
          בדוק
        </button>
      ) : (
        <button
          onClick={next}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLOR, color: "#0f172a", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          {dimIdx < order.length - 1 ? "הבא" : "סיום"}
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────
// ADMIN EDIT MODE
// ────────────────────────────────────────────────────
const EDIT_FIELDS: { key: keyof Dimension; label: string }[] = [
  { key: "name",   label: "שם הממד" },
  { key: "checks", label: "מה הוא בודק" },
  { key: "high",   label: "מדד גבוה" },
  { key: "low",    label: "מדד נמוך" },
  { key: "israel", label: "מצבה של ישראל" },
]

function AdminEditMode({ dimensions, onSave, onCancel }: {
  dimensions: Dimension[]
  onSave: (d: Dimension[]) => void
  onCancel: () => void
}) {
  const [data, setData] = useState<Dimension[]>(dimensions.map(d => ({ ...d })))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function update(idx: number, field: keyof Dimension, val: string) {
    setData(prev => prev.map((d, i) => i === idx ? { ...d, [field]: val } : d))
  }

  async function save() {
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/hofstede-dimensions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dimensions: data }),
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
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>עריכת ממדי הופשטדה</h1>
        <button onClick={onCancel} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 13 }}>
          ביטול
        </button>
      </div>

      {data.map((dim, idx) => (
        <div key={dim.order} style={{ marginBottom: 24, padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "var(--card)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLOR, marginBottom: 14 }}>
            {dim.order}. {dim.name}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {EDIT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>{label}</div>
                <textarea
                  value={dim[key] as string}
                  onChange={e => update(idx, key, e.target.value)}
                  rows={key === "name" || key === "israel" ? 1 : 2}
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
export default function HofstedePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [dimensions, setDimensions] = useState<Dimension[] | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    fetch("/api/admin/hofstede-dimensions")
      .then(r => r.json())
      .then(data => setDimensions(data.dimensions ?? DEFAULT_DIMENSIONS))
      .catch(() => setDimensions(DEFAULT_DIMENSIONS))
  }, [])

  if (status === "loading" || !dimensions) return null

  const isAdmin = !!(session?.user as { isAdmin?: boolean })?.isAdmin

  if (editMode && isAdmin) {
    return (
      <AdminEditMode
        dimensions={dimensions}
        onSave={d => { setDimensions(d); setEditMode(false) }}
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

      <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>המודל של הופשטדה</h1>

      <FillExercise dimensions={dimensions} />
    </div>
  )
}
