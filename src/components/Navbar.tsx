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
    ...(session.user.isAdmin ? [{ href: "/admin", label: "ניהול" }] : []),
  ]

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
        }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-getready.png" alt="Get Ready" style={{ height: 72, width: "auto" }} />
            <span style={{ fontSize: 11, color: "#f5f0e8", textAlign: "center", letterSpacing: 0.3, marginTop: -6 }}>
              ערד ישי | חותם בעולם
            </span>
          </div>

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
              transition: "color 0.15s",
            }}
          >
            ☰
          </button>
        </div>

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

      {/* ── Inject bottom padding for admin bottom nav ── */}
      {session.user.isAdmin && <style>{`main { padding-bottom: 130px !important; }`}</style>}

      {/* ── Bottom Nav — admins only ── */}
      {session.user.isAdmin && (
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
      )}
    </>
  )
}
