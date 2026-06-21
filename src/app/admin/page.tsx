"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

type Tab = "users" | "payments" | "questions" | "courses"

interface User {
  id: string
  name: string
  email: string
  isPaid: boolean
  isAdmin: boolean
  level: number
  totalPoints: number
  createdAt: string
  _count: { testResults: number; paymentRequests: number }
}

interface PaymentRequest {
  id: string
  fullName: string
  email: string
  lastFourDigits: string
  note: string | null
  status: string
  createdAt: string
  user: { id: string; name: string; email: string; isPaid: boolean }
}

interface Question {
  id: string
  question: string
  topic: string
  difficulty: string
  sourceType: string
  examYear: string | null
  isActive: boolean
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
  const [tab, setTab] = useState<Tab>("payments")
  const [users, setUsers] = useState<User[]>([])
  const [payments, setPayments] = useState<PaymentRequest[]>([])
  const [questions, setQuestions] = useState<Question[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddQuestion, setShowAddQuestion] = useState(false)
  const [questionCourseFilter, setQuestionCourseFilter] = useState("all")
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
      fetch("/api/admin/payment-requests").then((r) => r.json()),
      fetch("/api/admin/questions").then((r) => r.json()),
      fetch("/api/admin/courses").then((r) => r.json()),
    ]).then(([u, p, q, c]) => {
      setUsers(u); setPayments(p); setQuestions(q); setCourses(c); setLoading(false)
    })
  }, [session])

  async function approvePayment(requestId: string, action: "approve" | "reject") {
    await fetch("/api/admin/payment-requests", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
    })
    setPayments((prev) => prev.map((p) => (p.id === requestId ? { ...p, status: action === "approve" ? "approved" : "rejected" } : p)))
    if (action === "approve") {
      const req = payments.find((p) => p.id === requestId)
      if (req) setUsers((prev) => prev.map((u) => (u.id === req.user.id ? { ...u, isPaid: true } : u)))
    }
  }

  async function togglePaid(userId: string, isPaid: boolean) {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, isPaid }),
    })
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isPaid } : u)))
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

  const pendingPayments = payments.filter((p) => p.status === "pending")
  const filteredQuestions = questionCourseFilter === "all"
    ? questions
    : questions.filter(q => {
        const c = courses.find(c => c.id === questionCourseFilter)
        return c ? q.course.name === c.name : true
      })
  const tabs: { key: Tab; label: string; badge?: number }[] = [
    { key: "payments", label: "בקשות תשלום", badge: pendingPayments.length },
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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 24 }}>
        {[
          { label: "משתמשים", value: users.length, color: "var(--primary)" },
          { label: "משלמים", value: users.filter((u) => u.isPaid).length, color: "var(--success)" },
          { label: "בקשות פתוחות", value: pendingPayments.length, color: "var(--warning)" },
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
        {tabs.map(({ key, label, badge }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "10px 16px", borderRadius: "8px 8px 0 0", border: "none",
              background: tab === key ? "var(--card)" : "transparent",
              color: tab === key ? "var(--foreground)" : "var(--muted)",
              cursor: "pointer", fontSize: 14, fontWeight: tab === key ? 600 : 400,
              borderBottom: tab === key ? "2px solid var(--primary)" : "2px solid transparent",
            }}
          >
            {label}
            {badge !== undefined && badge > 0 && (
              <span style={{ background: "var(--danger)", color: "#fff", borderRadius: "50%", width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700 }}>
                {badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Payments Tab */}
      {tab === "payments" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>
            בקשות תשלום {pendingPayments.length > 0 && <span style={{ color: "var(--warning)" }}>({pendingPayments.length} ממתינות)</span>}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {payments.map((p) => (
              <div key={p.id} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "14px 18px" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.fullName}</div>
                    <div style={{ color: "var(--muted)", fontSize: 13 }}>{p.email} • 4 ספרות: {p.lastFourDigits}</div>
                    {p.note && <div style={{ color: "var(--muted)", fontSize: 12, marginTop: 2 }}>הערה: {p.note}</div>}
                    <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>{new Date(p.createdAt).toLocaleDateString("he-IL")}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
                    {p.status === "pending" ? (
                      <>
                        <button onClick={() => approvePayment(p.id, "approve")} style={{ padding: "7px 16px", background: "var(--success)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                          אשר
                        </button>
                        <button onClick={() => approvePayment(p.id, "reject")} style={{ padding: "7px 14px", background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                          דחה
                        </button>
                      </>
                    ) : (
                      <span style={{ fontSize: 13, fontWeight: 600, color: p.status === "approved" ? "var(--success)" : "var(--danger)" }}>
                        {p.status === "approved" ? "אושר" : "נדחה"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {payments.length === 0 && <p style={{ color: "var(--muted)" }}>אין בקשות תשלום</p>}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {tab === "users" && (
        <div>
          <h3 style={{ fontWeight: 700, marginBottom: 14 }}>כל המשתמשים ({users.length})</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {users.map((u) => (
              <div key={u.id} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 12, padding: "12px 18px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{u.name} {u.isAdmin && <span style={{ fontSize: 11, color: "#f59e0b" }}>★ אדמין</span>}</div>
                  <div style={{ color: "var(--muted)", fontSize: 12 }}>{u.email} • רמה {u.level} • {u._count.testResults} מבחנים</div>
                </div>
                <button
                  onClick={() => togglePaid(u.id, !u.isPaid)}
                  style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: u.isPaid ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.1)", color: u.isPaid ? "var(--success)" : "var(--danger)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}
                >
                  {u.isPaid ? "פעיל" : "ממתין"}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Questions Tab */}
      {tab === "questions" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h3 style={{ fontWeight: 700, margin: 0 }}>שאלות ({filteredQuestions.length})</h3>
              <select
                value={questionCourseFilter}
                onChange={e => setQuestionCourseFilter(e.target.value)}
                style={selectStyle}
              >
                <option value="all">כל הקורסים</option>
                {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {questionCourseFilter !== "all" && (
                <button
                  onClick={() => {
                    const c = courses.find(c => c.id === questionCourseFilter)
                    if (c) deleteAllInCourse(c.id, c.name)
                  }}
                  style={{ padding: "8px 14px", background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "1px solid var(--danger)", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
                >
                  מחק הכל
                </button>
              )}
              <button
                onClick={() => setShowAddQuestion(!showAddQuestion)}
                style={{ padding: "8px 16px", background: "var(--primary)", color: "#fff", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13, fontWeight: 600 }}
              >
                + הוסף שאלה
              </button>
            </div>
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

          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {filteredQuestions.map((q) => (
              <div key={q.id} style={{ background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 10, padding: "10px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 500, fontSize: 14, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{q.question}</div>
                  <div style={{ color: "var(--muted)", fontSize: 11, marginTop: 2 }}>
                    {q.course.name} • {q.topic} •{" "}
                    <span style={{ color: q.difficulty === "Easy" ? "var(--success)" : q.difficulty === "Medium" ? "var(--warning)" : "var(--danger)" }}>
                      {q.difficulty === "Easy" ? "קל" : q.difficulty === "Medium" ? "בינוני" : "קשה"}
                    </span>
                  </div>
                </div>
                <button onClick={() => deleteQuestion(q.id)} style={{ padding: "6px 12px", background: "rgba(239,68,68,0.1)", color: "var(--danger)", border: "none", borderRadius: 8, cursor: "pointer", fontSize: 13 }}>
                  מחק
                </button>
              </div>
            ))}
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
