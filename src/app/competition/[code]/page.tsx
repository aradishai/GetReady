"use client"

import { useEffect, useState, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"

interface Participant {
  userId: string
  userName: string
  score: number | null
  correctAnswers: number | null
  totalQuestions: number | null
  finished: boolean
}

interface CompetitionState {
  code: string
  status: string
  hostId: string
  isHost: boolean
  participants: Participant[]
  allFinished: boolean
}

export default function CompetitionLobby() {
  const { data: session, status: authStatus } = useSession()
  const router = useRouter()
  const params = useParams()
  const code = params.code as string

  const [comp, setComp] = useState<CompetitionState | null>(null)
  const [starting, setStarting] = useState(false)
  const [copied, setCopied] = useState(false)

  const fetchComp = useCallback(async () => {
    const res = await fetch(`/api/competition/${code}`)
    if (!res.ok) return
    const data = await res.json()
    setComp(data)
    if (data.status === "active") {
      router.push(`/test?competitionCode=${code}`)
    }
  }, [code, router])

  useEffect(() => {
    if (authStatus === "unauthenticated") router.push("/login")
  }, [authStatus, router])

  useEffect(() => {
    if (authStatus !== "authenticated") return
    fetchComp()
    const interval = setInterval(fetchComp, 3000)
    return () => clearInterval(interval)
  }, [authStatus, fetchComp])

  async function startCompetition() {
    setStarting(true)
    await fetch(`/api/competition/${code}/start`, { method: "POST" })
    router.push(`/test?competitionCode=${code}`)
  }

  function copyCode() {
    navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (!comp) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>טוען...</div>
      </div>
    )
  }

  return (
    <div style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 8 }}>חדר תחרות</h1>
      <p style={{ color: "var(--muted)", fontSize: 14, marginBottom: 32 }}>
        {comp.isHost ? "שתף את הקוד עם החברים שלך" : "ממתין להתחלה..."}
      </p>

      {/* Code display */}
      <div
        onClick={copyCode}
        style={{
          background: "var(--card)",
          border: "2px solid var(--primary)",
          borderRadius: 16,
          padding: "20px 28px",
          textAlign: "center",
          cursor: "pointer",
          marginBottom: 32,
          transition: "opacity 0.15s",
        }}
      >
        <div style={{ fontSize: 13, color: "var(--muted)", marginBottom: 6 }}>קוד הצטרפות</div>
        <div style={{ fontSize: 48, fontWeight: 900, letterSpacing: 12, color: "var(--primary)", fontFamily: "monospace" }}>
          {code}
        </div>
        <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
          {copied ? "✓ הועתק!" : "לחץ להעתקה"}
        </div>
      </div>

      {/* Participants */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 14, color: "var(--muted)", marginBottom: 10 }}>
          משתתפים ({comp.participants.length})
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {comp.participants.map(p => (
            <div
              key={p.userId}
              style={{
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: 10,
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--success)" }} />
                <span style={{ fontWeight: 600 }}>{p.userName}</span>
                {p.userId === comp.hostId && (
                  <span style={{ fontSize: 11, color: "var(--warning)", fontWeight: 700 }}>מארח</span>
                )}
              </div>
              <span style={{ fontSize: 12, color: "var(--muted)" }}>מחכה...</span>
            </div>
          ))}
        </div>
      </div>

      {/* Start button (host only) */}
      {comp.isHost && (
        <button
          onClick={startCompetition}
          disabled={starting || comp.participants.length < 2}
          style={{
            width: "100%",
            padding: "16px",
            background: comp.participants.length < 2 ? "var(--card)" : "var(--primary)",
            color: comp.participants.length < 2 ? "var(--muted)" : "#fff",
            border: comp.participants.length < 2 ? "1px solid var(--card-border)" : "none",
            borderRadius: 12,
            fontSize: 17,
            fontWeight: 700,
            cursor: comp.participants.length < 2 ? "not-allowed" : "pointer",
          }}
        >
          {starting ? "מתחיל..." : comp.participants.length < 2 ? "ממתין לעוד משתתפים..." : "התחל תחרות!"}
        </button>
      )}

      {!comp.isHost && (
        <div style={{ textAlign: "center", color: "var(--muted)", fontSize: 14 }}>
          ממתין למארח שיתחיל את התחרות...
        </div>
      )}
    </div>
  )
}
