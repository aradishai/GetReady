"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"

interface UserStats {
  totalPoints: number
  level: number
  _count: { testResults: number }
}

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [avgScore, setAvgScore] = useState<number | null>(null)

  useEffect(() => {
    if (!session?.user?.isPaid) return
    fetch("/api/user/me").then(r => r.json()).then(setStats)
    fetch("/api/results").then(r => r.json()).then((results: { score: number }[]) => {
      if (Array.isArray(results) && results.length > 0)
        setAvgScore(Math.round(results.reduce((a, r) => a + r.score, 0) / results.length))
      else setAvgScore(0)
    })
  }, [session])

  if (!session) return null

  const navLinks = [
    { href: "/dashboard", label: "בית" },
    { href: "/leaderboard", label: "דירוג" },
    ...(session.user.isAdmin ? [{ href: "/admin", label: "ניהול" }] : []),
  ]

  const SEP = (
    <span style={{ color: "rgba(255,255,255,0.12)", margin: "0 10px", fontWeight: 300, fontSize: 16 }}>|</span>
  )

  return (
    <>
      {/* ── Top Header ── */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: "rgba(2,5,9,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px",
          height: 72,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
        }}>

          {/* Logo — right (RTL start) */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-getready.png"
            alt="Get Ready"
            style={{ height: 110, width: "auto", flexShrink: 0 }}
          />

          {/* Stats — center */}
          <div style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            direction: "ltr",
            gap: 0,
            fontSize: 13,
            letterSpacing: 0.1,
            overflow: "hidden",
          }}>
            {stats !== null && avgScore !== null ? (
              <>
                <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 15 }}>{stats.totalPoints}</span>
                <span style={{ color: "#93c5fd", marginLeft: 5 }}>נקודות</span>
                {SEP}
                <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 15 }}>{stats._count.testResults}</span>
                <span style={{ color: "#93c5fd", marginLeft: 5 }}>מבחנים</span>
                {SEP}
                <span style={{ color: "#93c5fd", marginRight: 5 }}>רמה</span>
                <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 15 }}>{stats.level}</span>
                {SEP}
                <span style={{ color: "#38bdf8", fontWeight: 800, fontSize: 15 }}>{avgScore}%</span>
                <span style={{ color: "#93c5fd", marginLeft: 5 }}>התקדמות</span>
              </>
            ) : (
              <span style={{ color: "rgba(255,255,255,0.1)", fontSize: 12 }}>···</span>
            )}
          </div>

          {/* Hamburger — left (RTL end) */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: 28,
              cursor: "pointer",
              color: menuOpen ? "#38bdf8" : "rgba(255,255,255,0.45)",
              lineHeight: 1,
              padding: "4px 6px",
              flexShrink: 0,
              transition: "color 0.15s",
            }}
          >
            ☰
          </button>
        </div>

        {/* Dropdown */}
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
            <div style={{
              position: "absolute",
              top: "100%",
              left: 20,
              zIndex: 50,
              background: "rgba(4,8,20,0.97)",
              border: "1px solid rgba(56,189,248,0.12)",
              borderRadius: 12,
              boxShadow: "0 12px 40px rgba(0,0,0,0.5)",
              minWidth: 200,
              overflow: "hidden",
              backdropFilter: "blur(24px)",
            }}>
              <div style={{ padding: "12px 16px", fontSize: 13, color: "rgba(255,255,255,0.4)", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {session.user.name}
              </div>
              <button
                onClick={() => { setMenuOpen(false); signOut({ callbackUrl: "/login" }) }}
                style={{ width: "100%", padding: "12px 16px", background: "none", border: "none", textAlign: "right", fontSize: 14, fontWeight: 600, color: "var(--danger)", cursor: "pointer" }}
              >
                יציאה מהחשבון
              </button>
            </div>
          </>
        )}
      </header>

      {/* ── Bottom Nav ── */}
      <nav style={{
        position: "fixed",
        bottom: 0,
        right: 0,
        left: 0,
        zIndex: 45,
        background: "rgba(2,5,9,0.82)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderTop: "1px solid rgba(255,255,255,0.04)",
      }}>
        <div style={{ maxWidth: 700, margin: "0 auto", display: "flex", alignItems: "stretch", height: 116 }}>
          {navLinks.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                textDecoration: "none",
                fontSize: 16,
                fontWeight: pathname === href ? 700 : 500,
                color: pathname === href ? "var(--foreground)" : "rgba(240,217,168,0.5)",
                borderTop: pathname === href ? "3px solid var(--foreground)" : "3px solid transparent",
                transition: "all 0.15s",
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>
    </>
  )
}
