"use client"

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"
import { usePathname } from "next/navigation"
import { BookOpen, Trophy, User, LogOut, Shield, Zap } from "lucide-react"

export default function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()

  if (!session) return null

  const navLinks = [
    { href: "/dashboard", label: "בית", icon: BookOpen },
    { href: "/practice", label: "תרגול", icon: Zap },
    { href: "/leaderboard", label: "דירוג", icon: Trophy },
    { href: "/profile", label: "פרופיל", icon: User },
  ]

  return (
    <nav
      style={{
        background: "#ffffff",
        borderBottom: "1px solid var(--card-border)",
        position: "sticky",
        top: 0,
        zIndex: 50,
        boxShadow: "0 1px 8px rgba(99,102,241,0.07)",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "0 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          height: 62,
        }}
      >
        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <span
            style={{
              fontSize: 22,
              fontWeight: 700,
              background: "linear-gradient(135deg, #6366f1, #f43f5e)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              letterSpacing: -0.5,
            }}
          >
            Study Arena
          </span>
        </Link>

        <div style={{ display: "flex", gap: 4 }}>
          {navLinks.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                color: pathname === href ? "#ffffff" : "var(--muted)",
                background: pathname === href ? "var(--primary)" : "transparent",
                transition: "all 0.15s",
              }}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
          {session.user.isAdmin && (
            <Link
              href="/admin"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                padding: "7px 14px",
                borderRadius: 10,
                textDecoration: "none",
                fontSize: 14,
                fontWeight: 500,
                color: pathname === "/admin" ? "#ffffff" : "#d97706",
                background: pathname === "/admin" ? "#d97706" : "rgba(245,158,11,0.08)",
              }}
            >
              <Shield size={15} />
              ניהול
            </Link>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 13, color: "var(--muted)" }}>
            {session.user.name}
          </span>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "6px 12px",
              borderRadius: 8,
              border: "1px solid var(--card-border)",
              background: "transparent",
              color: "var(--muted)",
              cursor: "pointer",
              fontSize: 13,
            }}
          >
            <LogOut size={14} />
            יציאה
          </button>
        </div>
      </div>
    </nav>
  )
}
