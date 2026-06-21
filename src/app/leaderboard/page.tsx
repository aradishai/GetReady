"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

interface LeaderboardUser {
  id: string
  name: string
  level: number
  totalPoints: number
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    // payment gate disabled
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isPaid) {
      fetch("/api/leaderboard")
        .then((r) => r.json())
        .then((data) => { setUsers(data); setLoading(false) })
    }
  }, [session])

  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)" }}>טוען דירוג...</div>
      </div>
    )
  }

  const myRank = users.findIndex((u) => u.id === session?.user?.id)

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>טבלת מובילים</h1>
        <p style={{ color: "var(--muted)", marginTop: 8 }}>
          {myRank >= 0 ? `הדירוג שלך: #${myRank + 1}` : ""}
        </p>
      </div>

      {/* Top 3 */}
      {users.length >= 3 && (
        <div style={{ display: "flex", gap: 12, marginBottom: 24, alignItems: "flex-end" }}>
          {[users[1], users[0], users[2]].map((u, i) => {
            const actualRank = i === 0 ? 2 : i === 1 ? 1 : 3
            const heights = [100, 130, 80]
            const colors = ["#9ca3af", "#f59e0b", "#b45309"]
            return (
              <div
                key={u.id}
                style={{
                  flex: 1,
                  background: "var(--card)",
                  border: `2px solid ${colors[i]}44`,
                  borderRadius: 16,
                  padding: 16,
                  textAlign: "center",
                  height: heights[i],
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <div style={{ fontSize: 24, fontWeight: 900, color: colors[i], marginBottom: 4 }}>
                  #{actualRank}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>
                  {u.name.split(" ")[0]}
                </div>
                <div style={{ color: "var(--muted)", fontSize: 12 }}>
                  {u.totalPoints.toLocaleString()} נק׳
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Full list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {users.map((u, i) => (
          <div
            key={u.id}
            style={{
              background: u.id === session?.user?.id ? "rgba(29,111,196,0.08)" : "var(--card)",
              border: `1px solid ${u.id === session?.user?.id ? "var(--primary)" : "var(--card-border)"}`,
              borderRadius: 12,
              padding: "14px 18px",
              display: "flex",
              alignItems: "center",
              gap: 14,
            }}
          >
            <div style={{ width: 28, textAlign: "center", fontWeight: 700, color: "var(--muted)", flexShrink: 0 }}>
              #{i + 1}
            </div>

            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: "50%",
                background: `hsl(${(u.name.charCodeAt(0) * 50) % 360}, 60%, 50%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 16,
                color: "#fff",
                flexShrink: 0,
              }}
            >
              {u.name[0]}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 15 }}>
                {u.name}
                {u.id === session?.user?.id && (
                  <span style={{ marginRight: 6, fontSize: 12, color: "var(--primary)", fontWeight: 400 }}>(אתה)</span>
                )}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 12 }}>רמה {u.level}</div>
            </div>

            <div style={{ textAlign: "left" }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--foreground)" }}>
                {u.totalPoints.toLocaleString()}
              </div>
              <div style={{ color: "var(--muted)", fontSize: 11 }}>נקודות</div>
            </div>
          </div>
        ))}
      </div>

      {users.length === 0 && (
        <div style={{ textAlign: "center", padding: "48px 0", color: "var(--muted)" }}>
          עדיין אין משתמשים בלידרבורד. היה הראשון!
        </div>
      )}
    </div>
  )
}
