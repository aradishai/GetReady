import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }
    const { searchParams } = new URL(req.url)
    const requestedCourseId = searchParams.get("courseId")

    if (!session.user.isAdmin) {
      const isSocial = requestedCourseId === "course-social"
      if (isSocial && session.user.isSocialLocked) {
        return NextResponse.json({ error: "גישה אסורה" }, { status: 403 })
      }
      if (!isSocial && !session.user.isPaid) {
        return NextResponse.json({ error: "גישה אסורה" }, { status: 403 })
      }
    }
    const topic = searchParams.get("topic")
    const difficulty = searchParams.get("difficulty")
    const sourceType = searchParams.get("sourceType")
    const limit = parseInt(searchParams.get("limit") || "10")

    // Fetch specific questions by IDs (competition mode)
    const idsParam = searchParams.get("ids")
    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean)
      const questions = await prisma.question.findMany({
        where: { id: { in: ids } },
        select: { id: true, question: true, answerA: true, answerB: true, answerC: true, answerD: true, correctAnswer: true, explanation: true, topic: true, difficulty: true, sourceType: true, examYear: true },
      })
      const ordered = ids.map(id => questions.find(q => q.id === id)).filter(Boolean)
      return NextResponse.json(ordered)
    }

    const where: Record<string, unknown> = { isActive: true }
    if (requestedCourseId) where.courseId = requestedCourseId
    if (topic && topic !== "all") where.topic = topic
    if (difficulty && difficulty !== "all") where.difficulty = difficulty
    if (sourceType && sourceType !== "all") where.sourceType = sourceType

    // Count-only mode for progress tracking
    if (searchParams.get("countOnly") === "true") {
      const count = await prisma.question.count({ where })
      return NextResponse.json({ count })
    }

    const questions = await prisma.question.findMany({
      where,
      select: {
        id: true,
        question: true,
        answerA: true,
        answerB: true,
        answerC: true,
        answerD: true,
        correctAnswer: true,
        explanation: true,
        topic: true,
        difficulty: true,
        sourceType: true,
        examYear: true,
      },
    })

    // Shuffle and limit
    const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, limit)

    return NextResponse.json(shuffled)
  } catch {
    return NextResponse.json({ error: "שגיאה בטעינת שאלות" }, { status: 500 })
  }
}
