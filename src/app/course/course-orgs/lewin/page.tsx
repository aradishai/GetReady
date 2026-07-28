"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

const COLOR = "#38bdf8"
const GREEN = "#4ade80"

type Action = {
  label: string
  first: string
  rest: string
}

type Stage = {
  order: number
  name: string
  goal: string
  actions: Action[]
}

const DEFAULT_STAGES: Stage[] = [
  {
    order: 1,
    name: "הפשרה (Unfreeze)",
    goal: "הכנת הארגון לשינוי ויצירת נכונות לבצע אותו",
    actions: [
      { label: "א", first: "הבנת",   rest: "הצורך בשינוי" },
      { label: "ב", first: "קביעת",  rest: "החזון ומה צריך להשתנות" },
      { label: "ג", first: "תכנון",  rest: "השינוי ובניית תוכנית פעולה" },
      { label: "ד", first: "ניתוח",  rest: "הכוחות הדוחפים והבולמים" },
      { label: "ה", first: "שכנוע",  rest: "וקידום השינוי" },
    ],
  },
  {
    order: 2,
    name: "שינוי / תנועה (Change)",
    goal: "יישום השינוי בפועל",
    actions: [
      { label: "א", first: "תקשור",  rest: "מהלכי השינוי" },
      { label: "ב", first: "שיתוף",  rest: "עובדים והאצלת סמכויות" },
      { label: "ג", first: "תגמול",  rest: "עובדים על המאמץ" },
      { label: "ד", first: "מענה",   rest: "לסיבת ההתנגדות" },
      { label: "ה", first: "קביעת",  rest: "הישגים קצרי טווח והכרזתם" },
    ],
  },
  {
    order: 3,
    name: "הקפאה (Refreeze)",
    goal: "הטמעת השינוי והפיכתו לשגרת העבודה",
    actions: [
      { label: "א", first: "מיסוד",  rest: "השינוי בשגרה הארגונית" },
      { label: "ב", first: "סיוע",   rest: "בהסתגלות למציאות החדשה" },
      { label: "ג", first: "הבלטת",  rest: "השפעת השינוי על הביצועים" },
      { label: "ד", first: "הנחכת",  rest: "ההצלחה בהיבטים התשואתיים" },
      { label: "ה", first: "תגמול",  rest: "העובדים על המאמץ והתוצאות" },
    ],
  },
]

type Difficulty = "easy" | "medium" | "hard"

const HIDE_COUNT: Record<Difficulty, number> = { easy: 2, medium: 3, hard: 4 }

function generateHiddenActions(difficulty: Difficulty, stageCount: number): Record<number, number[]> {
  const count = HIDE_COUNT[difficulty]
  const map: Record<number, number[]> = {}
  for (let i = 0; i < stageCount; i++) {
    const shuffled = [0, 1, 2, 3, 4].sort(() => Math.random() - 0.5)
    map[i] = shuffled.slice(0, count)
  }
  return map
}

// ────────────────────────────────────────────────────
// FILL EXERCISE
// ────────────────────────────────────────────────────
function FillExercise({ stages }: { stages: Stage[] }) {
  const [diff, setDiff] = useState<Difficulty>("easy")
  const [hiddenMap, setHiddenMap] = useState<Record<number, number[]>>(() => generateHiddenActions("easy", stages.length))
  const [stageIdx, setStageIdx] = useState(0)
  const [order] = useState(() => [...stages].sort(() => Math.random() - 0.5))
  const [answers, setAnswers] = useState<Record<number, Record<number, string>>>({})
  const [checked, setChecked] = useState<Record<number, boolean>>({})
  const [done, setDone] = useState(false)

  function reset(d: Difficulty = diff) {
    setStageIdx(0); setAnswers({}); setChecked({}); setDone(false)
    setHiddenMap(generateHiddenActions(d, stages.length))
  }

  const stage = order[stageIdx]
  const hiddenIndices = hiddenMap[stageIdx] ?? []
  const isChecked = !!checked[stageIdx]
  const curAnswers = answers[stageIdx] ?? {}
  const allAnswered = hiddenIndices.every(i => (curAnswers[i] ?? "").trim() !== "")

  function setAnswer(actionIdx: number, val: string) {
    if (isChecked) return
    setAnswers(prev => ({ ...prev, [stageIdx]: { ...(prev[stageIdx] ?? {}), [actionIdx]: val } }))
  }

  function next() {
    if (stageIdx < order.length - 1) setStageIdx(i => i + 1)
    else setDone(true)
  }

  if (done) {
    return (
      <div style={{ textAlign: "center", direction: "rtl", paddingTop: 20 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: COLOR, marginBottom: 16 }}>
          סיימת את כל {stages.length} השלבים!
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
        <span style={{ fontSize: 12, color: "var(--muted)" }}>שלב {stageIdx + 1} מתוך {order.length}</span>
      </div>
      <div style={{ background: "rgba(255,255,255,0.07)", borderRadius: 4, height: 4, marginBottom: 18, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${(stageIdx / stages.length) * 100}%`, background: COLOR, borderRadius: 4, transition: "width 0.3s" }} />
      </div>

      {/* Card */}
      <div style={{
        background: "linear-gradient(140deg, var(--card) 0%, var(--card-border) 100%)",
        border: `1.5px solid ${COLOR}44`, borderRadius: 14, padding: 16, marginBottom: 16,
      }}>
        <div style={{ fontSize: 22, fontWeight: 900, marginBottom: 14, color: COLOR }}>{stage.name}</div>

        {/* Goal */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 5 }}>מטרת השלב</div>
          <div style={{ padding: "8px 12px", borderRadius: 8, background: "rgba(255,255,255,0.06)", fontSize: 13, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.5 }}>
            {stage.goal}
          </div>
        </div>

        {/* Actions */}
        <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 10 }}>5 פעולות לביצועו</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stage.actions.map((action, actionIdx) => {
            const isHidden = hiddenIndices.includes(actionIdx)
            const userAnswer = curAnswers[actionIdx] ?? ""

            if (!isHidden) {
              return (
                <div key={actionIdx} style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLOR, flexShrink: 0 }}>{action.label}.</span>
                  <span style={{ fontSize: 13, fontWeight: 800, color: "var(--foreground)", lineHeight: 1.6 }}>
                    {action.first} {action.rest}
                  </span>
                </div>
              )
            }

            return (
              <div key={actionIdx}>
                <div style={{ display: "flex", gap: 8, alignItems: "baseline", marginBottom: 5 }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: COLOR, flexShrink: 0 }}>{action.label}.</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: "var(--foreground)" }}>{action.first}</span>
                </div>
                <textarea
                  value={userAnswer}
                  onChange={e => setAnswer(actionIdx, e.target.value)}
                  readOnly={isChecked}
                  placeholder="המשך המשפט..."
                  rows={1}
                  style={{
                    width: "100%", boxSizing: "border-box",
                    background: "rgba(255,255,255,0.06)",
                    border: "1.5px solid rgba(255,255,255,0.15)",
                    borderRadius: 8, color: "var(--foreground)", fontSize: 13,
                    padding: "7px 10px", resize: "none", direction: "rtl",
                    fontFamily: "inherit", lineHeight: 1.5, outline: "none",
                  }}
                />
                {isChecked && (
                  <div style={{ marginTop: 5, padding: "7px 10px", borderRadius: 8, background: "rgba(255,255,255,0.04)", border: `1px solid ${COLOR}33` }}>
                    <span style={{ fontSize: 11, color: "var(--muted)" }}>תשובה נכונה: </span>
                    <span style={{ fontSize: 13, fontWeight: 800, color: GREEN, lineHeight: 1.5 }}>
                      {action.first} {action.rest}
                    </span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Action buttons */}
      {!isChecked ? (
        <button
          disabled={!allAnswered}
          onClick={() => setChecked(prev => ({ ...prev, [stageIdx]: true }))}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: allAnswered ? COLOR : "rgba(255,255,255,0.1)", color: allAnswered ? "#0f172a" : "var(--muted)", fontWeight: 700, fontSize: 14, cursor: allAnswered ? "pointer" : "not-allowed" }}
        >
          בדוק
        </button>
      ) : (
        <button
          onClick={next}
          style={{ width: "100%", padding: "12px 0", borderRadius: 10, border: "none", background: COLOR, color: "#0f172a", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
        >
          {stageIdx < order.length - 1 ? "הבא" : "סיום"}
        </button>
      )}
    </div>
  )
}

// ────────────────────────────────────────────────────
// ADMIN EDIT MODE
// ────────────────────────────────────────────────────
function AdminEditMode({ stages, onSave, onCancel }: {
  stages: Stage[]
  onSave: (s: Stage[]) => void
  onCancel: () => void
}) {
  const [data, setData] = useState<Stage[]>(stages.map(s => ({ ...s, actions: s.actions.map(a => ({ ...a })) })))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")

  function updateStage(stageI: number, field: "name" | "goal", val: string) {
    setData(prev => prev.map((s, i) => i === stageI ? { ...s, [field]: val } : s))
  }

  function updateAction(stageI: number, actionI: number, field: "first" | "rest", val: string) {
    setData(prev => prev.map((s, i) =>
      i === stageI
        ? { ...s, actions: s.actions.map((a, j) => j === actionI ? { ...a, [field]: val } : a) }
        : s
    ))
  }

  async function save() {
    setSaving(true); setError("")
    try {
      const res = await fetch("/api/admin/lewin-stages", {
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
        <h1 style={{ fontSize: 18, fontWeight: 800, margin: 0 }}>עריכת שלבי לוין</h1>
        <button onClick={onCancel} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.2)", background: "transparent", color: "var(--muted)", cursor: "pointer", fontSize: 13 }}>
          ביטול
        </button>
      </div>

      {data.map((stage, stageI) => (
        <div key={stage.order} style={{ marginBottom: 28, padding: 16, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)", background: "var(--card)" }}>
          <div style={{ fontSize: 15, fontWeight: 800, color: COLOR, marginBottom: 14 }}>{stage.order}. עריכת שלב</div>

          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
            {(["name", "goal"] as const).map(field => (
              <div key={field}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 4 }}>
                  {field === "name" ? "שם השלב" : "מטרת השלב"}
                </div>
                <textarea
                  value={stage[field]}
                  onChange={e => updateStage(stageI, field, e.target.value)}
                  rows={field === "name" ? 1 : 2}
                  style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "var(--foreground)", fontSize: 13, padding: "7px 10px", resize: "vertical", direction: "rtl", fontFamily: "inherit", lineHeight: 1.5, outline: "none" }}
                />
              </div>
            ))}
          </div>

          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, marginBottom: 10 }}>5 פעולות לביצועו</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {stage.actions.map((action, actionI) => (
              <div key={actionI} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: COLOR, paddingTop: 8, flexShrink: 0 }}>{action.label}.</span>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                  <div style={{ display: "flex", gap: 6 }}>
                    <div style={{ flex: "0 0 90px" }}>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 3 }}>מילה ראשונה</div>
                      <input
                        value={action.first}
                        onChange={e => updateAction(stageI, actionI, "first", e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "var(--foreground)", fontSize: 13, padding: "6px 8px", direction: "rtl", fontFamily: "inherit", outline: "none" }}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 3 }}>המשך המשפט</div>
                      <input
                        value={action.rest}
                        onChange={e => updateAction(stageI, actionI, "rest", e.target.value)}
                        style={{ width: "100%", boxSizing: "border-box", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", borderRadius: 8, color: "var(--foreground)", fontSize: 13, padding: "6px 8px", direction: "rtl", fontFamily: "inherit", outline: "none" }}
                      />
                    </div>
                  </div>
                </div>
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
export default function LewinPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [stages, setStages] = useState<Stage[] | null>(null)
  const [editMode, setEditMode] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, router])

  useEffect(() => {
    fetch("/api/admin/lewin-stages")
      .then(r => r.json())
      .then(data => setStages(data.stages ?? DEFAULT_STAGES))
      .catch(() => setStages(DEFAULT_STAGES))
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
          style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, color: "var(--foreground)", cursor: "pointer", fontSize: 13, fontWeight: 600, padding: "7px 14px" }}
        >
          חזרה לקורס
        </button>
        {isAdmin && (
          <button
            onClick={() => setEditMode(true)}
            style={{ background: "transparent", border: `1px solid ${COLOR}66`, borderRadius: 10, color: COLOR, cursor: "pointer", fontSize: 12, fontWeight: 600, padding: "7px 14px" }}
          >
            עריכת תוכן
          </button>
        )}
      </div>

      <h1 style={{ fontSize: 20, fontWeight: 800, margin: "0 0 20px" }}>מודל השינוי של קורט לוין</h1>

      <FillExercise stages={stages} />
    </div>
  )
}
