"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type Tab = "users" | "questions" | "courses"

interface User {
  id: string
  name: string
  email: string
  isPaid: boolean
  isSocialLocked: boolean
  isAdmin: boolean
  level: number
  totalPoints: number
  createdAt: string
  _count: { testResults: number; paymentRequests: number; sessions: number }
}

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
  isActive: boolean
  position: number
  course: { name: string }
}

interface Course {
  id: string
  name: string
  description: string
  price: number
  isActive: boolean
  _count: { questions: number; enrollments: number }
}

export default function AdminPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [tab, setTab] = useState<Tab>("users")
  const [users, setUsers] = useState<User[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [openCourseIds, setOpenCourseIds] = useState<Set<string>>(new Set())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Partial<Question>>({})
  const [newQ, setNewQ] = useState({
    courseId: "", question: "", answerA: "", answerB: "", answerC: "", answerD: "",
    correctAnswer: "A", explanation: "", topic: "", difficulty: "Medium",
    sourceType: "Generated", examYear: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isAdmin) router.push("/dashboard")
  }, [status, session, router])

  useEffect(() => {
    if (!session?.user?.isAdmin) return
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/questions").then((r) => r.json()),
      fetch("/api/admin/courses").then((r) => r.json()),
    ]).then(([u, q, c]) => {
      setUsers(u); setQuestions(q); setCourses(c); setLoading(false)
    })
  }, [session])

  async function togglePaid(userId: string, isPaid: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isPaid }),
    })
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isPaid } : u)))
  }

  async function deleteUser(userId: string, userName: string) {
    if (!confirm(`למחוק את המשתמש "${userName}"? פעולה זו אינה הפיכה.`)) return
    await fetch(`/api/admin/users?userId=${userId}`, { method: "DELETE" })
    setUsers((prev) => prev.filter((u) => u.id !== userId))
  }

  async function toggleSocialLocked(userId: string, isSocialLocked: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isSocialLocked }),
    })
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isSocialLocked } : u)))
  }

  async function deleteQuestion(id: string) {
    if (!confirm("למחוק שאלה זו?")) return
    await fetch(`/api/admin/questions?id=${id}`, { method: "DELETE" })
    setQuestions((prev) => prev.filter((q) => q.id !== id))
  }

  async function deleteAllInCourse(courseId: string, courseName: string) {
    if (!confirm(`למחוק את כל השאלות של "${courseName}"?`)) return
    await fetch(`/api/admin/questions?courseId=${courseId}`, { method: "DELETE" })
    setQuestions(prev => prev.filter(q => q.course.name !== courseName))
  }

  async function saveQuestion() {
    if (!editingId) return
    const res = await fetch("/api/admin/questions", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingId, ...editData }),
    })
    if (res.ok) {
      setQuestions(prev => prev.map(q => q.id === editingId ? { ...q, ...editData } : q))
      setEditingId(null)
      setEditData({})
    }
  }

  async function addQuestion() {
    const res = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newQ, examYear: newQ.examYear || null }),
    })
    if (res.ok) {
      const data = await res.json()
      setQuestions((prev) => [data.question, ...prev])
      setShowAddQuestion(false)
      setNewQ({ courseId: "", question: "", answerA: "", answerB: "", answerC: "", answerD: "", correctAnswer: "A", explanation: "", topic: "", difficulty: "Medium", sourceType: "Generated", examYear: "" })
    }
  }

  const COURSE_COLORS: Record<string, string> = {
    "course-psychodiag": "#22c55e",
    "course-social": "#f97316",
    "course-iyut": "#a855f7",
    "course-assessment": "#eab308",
    "course-chevrot": "#ef4444",
    "course-orgs": "#38bdf8",
  }
  const tabs: { key: Tab; label: string }[] = [
    { key: "users", label: "משתמשים" },
    { key: "questions", label: "שאלות" },
    { key: "courses", label: "קורסים" },
  ]

  const inputStyle = { width: "100%", padding: "8px 12px", background: "var(--muted-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", fontSize: 13 }
  const selectStyle = { padding: "8px 12px", background: "var(--muted-bg)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", fontSize: 13 }

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>טוען...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 16px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 24 }}>אדמין פאנל</h1>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "משתמשים", value: users.length, color: "var(--primary)" },
          { label: "שאלות", value: questions.length, color: "var(--accent)" },
        ].map(({ label, value, color }) => (
          <div key={label} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 14, padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 28, fontWeight: 800, color }}>{value}</div>
            <div style={{ color: "var(--muted)", fontSize: 13 }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20, borderBottom: "1px solid var(--card-border)" }}>
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              padding: "10px 16px", borderRadius: "8px 8px 0 0", border: "none",
              background: tab === key ? "var(--card)" : "transparent",
              color: tab === key ? "var(--foreground)" : "var(--muted)",
              cursor: "pointer", fontSize: 14, fontWeight: tab === key ? 600 : 400,
              borderBottom: tab === key ? "2px solid var(--primary)" : "2px solid transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Users Tab */}
      {tab === "users" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>כל המשתמשים ({users.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map((u) => (
              <div key={u.id} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "12px 14px" }}>
                {/* Info row */}
                <div style={{ marginBottom: 10 }}>
                  <div style={{ fontWeight: 600, fontSize: 14, display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                    {u.name}
                    {u.isAdmin && <span style={{ fontSize: 11, color: "#f59e0b" }}>★ אדמין</span>}
                    {u._count.sessions > 1 && (
                      <span style={{ fontSize: 11, fontWeight: 700, color: "#f59e0b", background: "rgba(245,158,11,0.12)", padding: "2px 7px", borderRadius: 6 }}>
                        {u._count.sessions} מכשירים
                      </span>
                    )}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 3, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {u.email}
                  </div>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 1 }}>
                    רמה {u.level} • {u._count.testResults} מבחנים
                  </div>
                </div>
                {/* Actions row */}
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  <button
                    onClick={() => toggleSocialLocked(u.id, !u.isSocialLocked)}
                    style={{
                      flex: 1, minWidth: 90, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                      background: u.isSocialLocked ? "rgba(239,68,68,0.12)" : "rgba(16,185,129,0.12)",
                      color: u.isSocialLocked ? "var(--danger)" : "var(--success)",
                    }}
                  >
                    חברתית {u.isSocialLocked ? "🔒" : "✓"}
                  </button>
                  <button
                    onClick={() => togglePaid(u.id, !u.isPaid)}
                    style={{
                      flex: 1, minWidth: 100, padding: "6px 8px", borderRadius: 8, border: "none", cursor: "pointer", fontSize: 11, fontWeight: 600,
                      background: u.isPaid ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.06)",
                      color: u.isPaid ? "var(--primary)" : "var(--muted)",
                    }}
                  >
                    חבילה שלמה {u.isPaid ? "✓" : "🔒"}
                  </button>
                  {!u.isAdmin && (
                    <button
                      onClick={() => deleteUser(u.id, u.name)}
                      style={{
                        padding: "6px 12px", borderRadius: 8, border: "1px solid var(--danger)", cursor: "pointer", fontSize: 11, fontWeight: 600,
                        background: "rgba(239,68,68,0.08)", color: "var(--danger)",
                      }}
                    >
                      מחק
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {tab === "questions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <h3 style={{ fontWeight: 700, margin: 0 }}>שאלות ({questions.length})</h3>
            <button
              onClick={() => setShowAddQuestion(!showAddQuestion)}
              style={{ padding: "8px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
            >
              + הוסף שאלה
            </button>
          </div>

          {showAddQuestion && courses.length > 0 && (
            <div style={{ background: "var(--card)", border: "1px solid var(--primary)", borderRadius: 14, padding: 20, marginBottom: 16 }}>
              <h4 style={{ margin: "0 0 14px", fontWeight: 700 }}>שאלה חדשה</h4>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                <div style={{ gridColumn: "1/-1" }}>
                  <select value={newQ.courseId} onChange={(e) => setNewQ({ ...newQ, courseId: e.target.value })} style={{ ...selectStyle, width: "100%" }}>
                    <option value="">בחר קורס</option>
                    {courses.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: "1/-1" }}>
                  <textarea value={newQ.question} onChange={(e) => setNewQ({ ...newQ, question: e.target.value })} placeholder="שאלה" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                {[{ key: "answerA", label: "תשובה א" }, { key: "answerB", label: "תשובה ב" }, { key: "answerC", label: "תשובה ג" }, { key: "answerD", label: "תשובה ד" }].map(({ key, label }) => (
                  <input key={key} value={newQ[key as keyof typeof newQ]} onChange={(e) => setNewQ({ ...newQ, [key]: e.target.value })} placeholder={label} style={inputStyle} />
                ))}
                <div style={{ gridColumn: "1/-1" }}>
                  <textarea value={newQ.explanation} onChange={(e) => setNewQ({ ...newQ, explanation: e.target.value })} placeholder="הסבר" rows={2} style={{ ...inputStyle, resize: "vertical" }} />
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ fontSize: 12, color: "var(--muted)" }}>תשובה נכונה:</label>
                  <select value={newQ.correctAnswer} onChange={(e) => setNewQ({ ...newQ, correctAnswer: e.target.value })} style={selectStyle}>
                    {["A", "B", "C", "D"].map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
                <input value={newQ.topic} onChange={(e) => setNewQ({ ...newQ, topic: e.target.value })} placeholder="נושא" style={inputStyle} />
                <select value={newQ.difficulty} onChange={(e) => setNewQ({ ...newQ, difficulty: e.target.value })} style={selectStyle}>
                  <option value="Easy">קל</option>
                  <option value="Medium">בינוני</option>
                  <option value="Hard">קשה</option>
                </select>
                <select value={newQ.sourceType} onChange={(e) => setNewQ({ ...newQ, sourceType: e.target.value })} style={selectStyle}>
                  <option value="Generated">תרגול</option>
                  <option value="PreviousExam">מבחן קודם</option>
                  <option value="LecturerQuestion">שאלת מרצה</option>
                </select>
                <input value={newQ.examYear} onChange={(e) => setNewQ({ ...newQ, examYear: e.target.value })} placeholder="שנה (2024A)" style={inputStyle} />
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button onClick={addQuestion} style={{ padding: "8px 20px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13 }}>שמור</button>
                <button onClick={() => setShowAddQuestion(false)} style={{ padding: "8px 16px", background: "transparent", color: "var(--muted)", border: "1px solid var(--card-border)", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>ביטול</button>
              </div>
            </div>
          )}

          {/* Course accordions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {courses.map(course => {
              const courseQs = questions.filter(q => q.course.name === course.name)
              const isOpen = openCourseIds.has(course.id)
              const color = COURSE_COLORS[course.id] ?? "var(--primary)"

              return (
                <div key={course.id} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${isOpen ? color + "55" : "var(--card-border)"}` }}>
                  {/* Accordion header */}
                  <button
                    onClick={() => {
                      setOpenCourseIds(prev => {
                        const next = new Set(prev)
                        if (next.has(course.id)) next.delete(course.id)
                        else next.add(course.id)
                        return next
                      })
                    }}
                    style={{
                      width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                      padding: "14px 18px", background: isOpen ? `${color}14` : "var(--card)",
                      border: "none", cursor: "pointer", gap: 12, transition: "background 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ width: 10, height: 10, borderRadius: "50%", background: color, flexShrink: 0, display: "inline-block" }} />
                      <span style={{ fontSize: 16, fontWeight: 700, color: "var(--foreground)" }}>{course.name}</span>
                      <span style={{ fontSize: 12, padding: "2px 9px", borderRadius: 10, background: `${color}22`, color, border: `1px solid ${color}44`, fontWeight: 600 }}>
                        {courseQs.length} שאלות
                      </span>
                    </div>
                    <span style={{ fontSize: 18, color: isOpen ? color : "var(--muted)", lineHeight: 1 }}>{isOpen ? "▲" : "▼"}</span>
                  </button>

                  {/* Questions list */}
                  {isOpen && (
                    <div style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: 12, background: "rgba(0,0,0,0.15)" }}>
                      {courseQs.length === 0 ? (
                        <p style={{ color: "var(--muted)", fontSize: 13, margin: 0 }}>אין שאלות בקורס זה עדיין.</p>
                      ) : courseQs.map((q, idx) => {
                        const isEditing = editingId === q.id
                        const data = isEditing ? { ...q, ...editData } : q
                        const diffColor = q.difficulty === "Easy" ? "var(--success)" : q.difficulty === "Medium" ? "var(--warning)" : "var(--danger)"
                        const diffLabel = q.difficulty === "Easy" ? "קל" : q.difficulty === "Medium" ? "בינוני" : "קשה"
                        const answerKeys = ["A", "B", "C", "D"] as const
                        const answerLabels = { A: "א", B: "ב", C: "ג", D: "ד" }
                        const answerFields = { A: "answerA", B: "answerB", C: "answerC", D: "answerD" } as const

                        return (
                          <div key={q.id} style={{ background: "var(--card)", border: `1px solid ${isEditing ? "var(--primary)" : "var(--card-border)"}`, borderRadius: 14, padding: "16px 18px" }}>
                            {/* Header row */}
                            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, marginBottom: 12 }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                                <span style={{ fontSize: 13, fontWeight: 800, color, minWidth: 28 }}>#{idx + 1}</span>
                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: `${diffColor}22`, color: diffColor, border: `1px solid ${diffColor}44` }}>{diffLabel}</span>
                                <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, background: "rgba(56,189,248,0.1)", color: "var(--primary)", border: "1px solid rgba(56,189,248,0.3)" }}>{q.topic}</span>
                              </div>
                              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                                {isEditing ? (
                                  <>
                                    <button onClick={saveQuestion} style={{ padding: "5px 14px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 700 }}>שמור</button>
                                    <button onClick={() => { setEditingId(null); setEditData({}) }} style={{ padding: "5px 12px", background: "transparent", color: "var(--muted)", border: "1px solid var(--card-border)", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>ביטול</button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => { setEditingId(q.id); setEditData({}) }} style={{ padding: "5px 12px", background: "rgba(56,189,248,0.1)", color: "var(--primary)", border: "1px solid rgba(56,189,248,0.3)", borderRadius: 7, cursor: "pointer", fontSize: 12, fontWeight: 600 }}>עריכה</button>
                                    <button onClick={() => deleteQuestion(q.id)} style={{ padding: "5px 10px", background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "none", borderRadius: 7, cursor: "pointer", fontSize: 12 }}>מחק</button>
                                  </>
                                )}
                              </div>
                            </div>

                            {/* Question text */}
                            {isEditing ? (
                              <textarea
                                value={String(data.question ?? "")}
                                onChange={e => setEditData(d => ({ ...d, question: e.target.value }))}
                                rows={2}
                                style={{ ...inputStyle, marginBottom: 10, fontSize: 15, fontWeight: 600, resize: "vertical" }}
                              />
                            ) : (
                              <p style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.6, margin: "0 0 12px" }}>{q.question}</p>
                            )}

                            {/* Answers */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 7, marginBottom: 10 }}>
                              {answerKeys.map(key => {
                                const field = answerFields[key]
                                const isCorrect = data.correctAnswer === key
                                return (
                                  <div key={key} style={{ display: "flex", alignItems: isEditing ? "flex-start" : "center", gap: 8 }}>
                                    {isEditing ? (
                                      <>
                                        <button
                                          onClick={() => setEditData(d => ({ ...d, correctAnswer: key }))}
                                          style={{ width: 24, height: 24, borderRadius: "50%", border: "none", background: isCorrect ? "var(--success)" : "var(--card-border)", color: "#fff", fontSize: 12, fontWeight: 700, cursor: "pointer", flexShrink: 0, marginTop: 6 }}
                                        >
                                          {answerLabels[key]}
                                        </button>
                                        <textarea
                                          value={String(data[field] ?? "")}
                                          onChange={e => setEditData(d => ({ ...d, [field]: e.target.value }))}
                                          rows={1}
                                          style={{ ...inputStyle, flex: 1, resize: "vertical", fontSize: 13, border: isCorrect ? "1px solid var(--success)" : "1px solid var(--card-border)" }}
                                        />
                                      </>
                                    ) : (
                                      <div style={{
                                        display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", borderRadius: 9, width: "100%",
                                        background: isCorrect ? "rgba(16,185,129,0.1)" : "rgba(255,255,255,0.03)",
                                        border: `1px solid ${isCorrect ? "var(--success)" : "var(--card-border)"}`,
                                      }}>
                                        <span style={{ width: 22, height: 22, borderRadius: "50%", background: isCorrect ? "var(--success)" : "var(--card-border)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                                          {answerLabels[key]}
                                        </span>
                                        <span style={{ fontSize: 13 }}>{q[field]}</span>
                                      </div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>

                            {/* Explanation */}
                            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "8px 12px", borderRight: "3px solid var(--primary)" }}>
                              <div style={{ fontSize: 11, color: "var(--primary)", fontWeight: 600, marginBottom: 3 }}>הסבר</div>
                              {isEditing ? (
                                <textarea
                                  value={String(data.explanation ?? "")}
                                  onChange={e => setEditData(d => ({ ...d, explanation: e.target.value }))}
                                  rows={2}
                                  style={{ ...inputStyle, resize: "vertical", fontSize: 13 }}
                                />
                              ) : (
                                <div style={{ fontSize: 13, color: "var(--muted)", lineHeight: 1.5 }}>{q.explanation}</div>
                              )}
                            </div>

                            {/* Position */}
                            {isEditing && (
                              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <span style={{ fontSize: 12, color: "var(--muted)" }}>מיקום (0 = אוטומטי):</span>
                                <input
                                  type="number"
                                  value={data.position ?? 0}
                                  onChange={e => setEditData(d => ({ ...d, position: Number(e.target.value) }))}
                                  style={{ ...inputStyle, width: 80, fontSize: 13 }}
                                />
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Courses Tab */}
      {tab === "courses" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>קורסים ({courses.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {courses.map((c) => (
              <div key={c.id} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "14px 18px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: 600 }}>{c.name}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{c.description}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 4 }}>{c._count.questions} שאלות • {c._count.enrollments} נרשמים • {c.price}₪</div>
                </div>
                <span style={{ fontSize: 12, color: c.isActive ? "var(--success)" : "var(--muted)" }}>
                  {c.isActive ? "● פעיל" : "○ לא פעיל"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
