import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const [totals, corrects, courses] = await Promise.all([
      prisma.practiceAnswer.groupBy({
        by: ["userId", "courseId"],
        _count: { id: true },
      }),
      prisma.practiceAnswer.groupBy({
        by: ["userId", "courseId"],
        where: { isCorrect: true },
        _count: { id: true },
      }),
      prisma.course.findMany({ select: { id: true, name: true } }),
    ])

    const courseMap = Object.fromEntries(courses.map((c) => [c.id, c.name]))

    const correctMap: Record<string, number> = {}
    for (const r of corrects) {
      correctMap[`${r.userId}__${r.courseId}`] = r._count.id
    }

    const stats: Record<string, { courseId: string; courseName: string; total: number; correct: number }[]> = {}
    for (const r of totals) {
      const key = `${r.userId}__${r.courseId}`
      if (!stats[r.userId]) stats[r.userId] = []
      stats[r.userId].push({
        courseId: r.courseId,
        courseName: courseMap[r.courseId] ?? r.courseId,
        total: r._count.id,
        correct: correctMap[key] ?? 0,
      })
    }

    return NextResponse.json(stats)
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
