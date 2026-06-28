"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserData {
  name: string
  isPaid: boolean
  isSocialLocked: boolean
}

const ALL_COURSES = [
  { id: "course-social",     img: "/icon-social.jpeg",     name: "פסיכולוגיה חברתית" },
  { id: "course-psychodiag", img: "/icon-psychodiag.jpg",  name: "פסיכודיאגנוסטיקה"  },
  { id: "course-chevrot",    img: "/icon-chevrot.jpg",     name: "חברות בישראל",        adminOnly: true },
  { id: "course-assessment", img: "/icon-assessment.jpeg", name: "אבחון ומיון"         },
  { id: "course-iyut",       img: "/icon-iyut.jpeg",       name: "אישיות"              },
  { id: "course-orgs",       img: "/icon-orgs.jpeg",       name: "ארגונים"             },
] as { id: string; img: string; name: string; adminOnly?: boolean }[]

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
  }, [status, session, router])

  useEffect(() => {
    if (session?.user)
      fetch("/api/user/me").then(r => r.json()).then(setUser)
  }, [session])

  if (status === "loading" || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>טוען...</div>
      </div>
    )
  }

  const isAdmin = session?.user?.isAdmin ?? false

  const courses = ALL_COURSES.filter(c => isAdmin || !c.adminOnly)

  function isLocked(courseId: string): boolean {
    if (isAdmin) return false
    if (courseId === "course-social") return user?.isSocialLocked ?? false
    return !(user?.isPaid ?? false)
  }

  return (
    <div style={{ padding: "32px 18px 140px" }}>

      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 28px", lineHeight: 1.2 }}>
        שלום, {user.name}
      </h1>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: 10,
        maxWidth: 520,
        margin: "0 auto",
      }}>
        {courses.map(({ id, img, name }) => {
          const locked = isLocked(id)
          const card = (
            <div
              style={{
                width: "100%",
                aspectRatio: "160 / 257",
                overflow: "hidden",
                borderRadius: 14,
                cursor: locked ? "default" : "pointer",
                transition: "transform 0.15s ease",
                background: "transparent",
                position: "relative",
              }}
              onMouseEnter={e => { if (!locked) (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
              {locked && (
                <div style={{
                  position: "absolute", inset: 0,
                  background: "rgba(2,5,9,0.62)",
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center", gap: 4,
                  borderRadius: 14,
                }}>
                  <span style={{ fontSize: 28 }}>🔒</span>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: 600, textAlign: "center", padding: "0 6px" }}>
                    {id === "course-social" ? "נעול" : "חבילה שלמה"}
                  </span>
                </div>
              )}
            </div>
          )

          return locked ? (
            <div key={id}>{card}</div>
          ) : (
            <Link key={id} href={`/course/${id}`} style={{ textDecoration: "none", display: "block" }}>
              {card}
            </Link>
          )
        })}
      </div>

    </div>
  )
}
