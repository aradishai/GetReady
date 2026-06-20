"use client"

import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"

interface Course {
  id: string
  name: string
  description: string
}

export default function TestSelectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState<Course[]>([])

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login")
    if (status === "authenticated" && !session.user.isPaid) router.push("/payment")
  }, [status, session, router])

  useEffect(() => {
    if (session?.user?.isPaid) {
      fetch("/api/courses").then((r) => r.json()).then(setCourses)
    }
  }, [session])

  const courseIds = ["course-iyut", "course-social", "course-psychodiag"]
  const displayCourses = courses.filter((c) => courseIds.includes(c.id))

  return (
    <div style={{ maxWidth: 680, margin: "0 auto", padding: "40px 16px" }}>
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, margin: 0 }}>בחר את הקורס בו תרצה להיבחן</h1>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {displayCourses.map((course) => (
          <Link
            key={course.id}
            href={`/test?courseId=${course.id}`}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--card)",
              border: "1px solid var(--card-border)",
              borderRadius: 20,
              padding: "36px 24px",
              textDecoration: "none",
              fontSize: 22,
              fontWeight: 700,
              color: "var(--foreground)",
              transition: "border-color 0.15s",
            }}
          >
            {course.name}
          </Link>
        ))}
      </div>
    </div>
  )
}
