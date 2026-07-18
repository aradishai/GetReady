"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"

const BONUS_SECTIONS = [
  { id: "assessment", label: "אבחון ומיון", color: "#eab308", coming: false },
]

export default function BonusPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const isPaid = (session?.user as { isPaid?: boolean })?.isPaid ?? false
  const isAdmin = session?.user?.isAdmin ?? false

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !isAdmin && !isPaid) router.push("/dashboard")
  }, [status, isAdmin, isPaid, router])

  return (
    <div style={{ maxWidth: 500, margin: "0 auto", padding: "32px 18px 100px" }}>
      <button
        onClick={() => router.push("/dashboard")}
        style={{ marginBottom: 24, padding: "8px 16px", background: "var(--card)", border: "1px solid var(--card-border)", borderRadius: 8, color: "var(--foreground)", cursor: "pointer", fontSize: 14 }}
      >
        חזור
      </button>

      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 28 }}>שאלות בונוס</h1>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {BONUS_SECTIONS.map(s => (
          <button
            key={s.id}
            onClick={() => !s.coming && router.push(`/bonus/${s.id}`)}
            style={{
              width: "100%",
              padding: "20px 24px",
              borderRadius: 14,
              border: `1px solid ${s.color}44`,
              background: `${s.color}11`,
              cursor: s.coming ? "default" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 12,
              opacity: s.coming ? 0.5 : 1,
            }}
          >
            <span style={{ fontSize: 17, fontWeight: 700, color: s.color }}>{s.label}</span>
            {s.coming ? (
              <span style={{ fontSize: 12, color: "var(--muted)" }}>בקרוב</span>
            ) : (
              <span style={{ fontSize: 18, color: s.color }}>←</span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
