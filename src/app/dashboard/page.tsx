"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface UserData {
  name: string
}

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [user, setUser] = useState<UserData | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isPaid)
      fetch("/api/user/me").then(r => r.json()).then(setUser)
  }, [session])

  if (status === "loading" || !user) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "60vh" }}>
        <div style={{ color: "var(--muted)", fontSize: 16 }}>טוען...</div>
      </div>
    )
  }

  return (
    <div style={{ padding: "32px 18px 140px" }}>

      {/* Greeting */}
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 24px", lineHeight: 1.2 }}>
        שלום, {user.name}
      </h1>

      {/* Course Cards — 2x2, compact */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, maxWidth: 320 }}>
        {[
          { id: "course-psychodiag", img: "/icon-green.png",  name: "פסיכודיאגנוסטיקה"  },
          { id: "course-social",     img: "/icon-yellow.png", name: "פסיכולוגיה חברתית" },
          { id: "course-iyut",       img: "/icon-purple.png", name: "אישיות"              },
          { id: "course-assessment", img: "/icon-orange.png", name: "אבחון ומיון"         },
        ].map(({ id, img, name }) => (
          <Link key={id} href={`/course/${id}`} style={{ textDecoration: "none", display: "block" }}>
            <div
              style={{
                aspectRatio: "311 / 499",
                overflow: "hidden",
                borderRadius: 14,
                cursor: "pointer",
                transition: "transform 0.15s ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)" }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={img} alt={name} style={{ width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
            </div>
          </Link>
        ))}
      </div>

    </div>
  )
}
