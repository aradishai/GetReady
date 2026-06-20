"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { useState } from "react"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)

  if (!session) return null

  const navLinks = [
    { href: "/dashboard", label: "בית" },
    { href: "/leaderboard", label: "דירוג" },
    ...(session.user.isAdmin ? [{ href: "/admin", label: "ניהול" }] : []),
  ]

  return (
    <>
      {/* Top Header */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "var(--card)",
          borderBottom: "1px solid var(--card-border)",
          boxShadow: "0 2px 16px rgba(56,189,248,0.10)",
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "8px 24px",
            height: 100,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-getready.png"
            alt="Get Ready"
            style={{ height: 180, width: "auto", display: "block" }}
          />

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              fontSize: 30,
              cursor: "pointer",
              color: menuOpen ? "var(--primary)" : "var(--muted)",
              lineHeight: 1,
              padding: "6px 10px",
            }}
          >
            ☰
          </button>
        </div>

        {/* Dropdown */}
        {menuOpen && (
          <>
            <div onClick={() => setMenuOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 40 }} />
            <div
              style={{
                position: "absolute",
                top: "100%",
                left: 20,
                zIndex: 50,
                background: "var(--card)",
                border: "1px solid var(--card-border)",
                borderRadius: 12,
                boxShadow: "0 8px 24px rgba(56,189,248,0.12)",
                minWidth: 200,
                overflow: "hidden",
              }}
            >
              <div style={{ padding: "12px 16px", fontSize: 13, color: "var(--muted)", borderBottom: "1px solid var(--card-border)" }}>
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

      {/* Bottom Nav */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          right: 0,
          left: 0,
          zIndex: 45,
          background: "var(--card)",
          borderTop: "1px solid var(--card-border)",
          boxShadow: "0 -2px 12px rgba(56,189,248,0.07)",
        }}
      >
        <div
          style={{
            maxWidth: 700,
            margin: "0 auto",
            display: "flex",
            alignItems: "stretch",
            height: 116,
          }}
        >
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
