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
      <h1 style={{ fontSize: 28, fontWeight: 800, margin: "0 0 28px", lineHeight: 1.2 }}>
        שלום, {user.name}
      </h1>

      {/* Course Cards — fixed-width centered container, 2x2 grid, all cards identical size */}
      <div style={{ maxWidth: 340, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
          {[
            { id: "course-social",     img: "/icon-yellow.png",     name: "פסיכולוגיה חברתית" },
            { id: "course-psychodiag", img: "/icon-psychodiag.jpg", name: "פסיכודיאגנוסטיקה"  },
            { id: "course-assessment", img: "/icon-orange.png",     name: "אבחון ומיון"         },
            { id: "course-iyut",       img: "/icon-iyut.png",       name: "אישיות"              },
          ].map(({ id, img, name }) => (
            <Link key={id} href={`/course/${id}`} style={{ textDecoration: "none", display: "block" }}>
              <div
                style={{
                  position: "relative",
                  width: "100%",
                  paddingBottom: "160.5%",
                  overflow: "hidden",
                  borderRadius: 14,
                  cursor: "pointer",
                  transition: "transform 0.15s ease",
                  background: "transparent",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.04)" }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)" }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img} alt={name} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "fill", display: "block" }} />
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  )
}
