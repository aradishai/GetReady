import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }
    if (!session.user.isPaid && !session.user.isAdmin) {
      return NextResponse.json({ error: "גישה אסורה" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")
    const topic = searchParams.get("topic")
    const difficulty = searchParams.get("difficulty")
    const sourceType = searchParams.get("sourceType")
    const limit = parseInt(searchParams.get("limit") || "10")

    const where: Record<string, unknown> = { isActive: true }
    if (courseId) where.courseId = courseId
    if (topic && topic !== "all") where.topic = topic
    if (difficulty && difficulty !== "all") where.difficulty = difficulty
    if (sourceType && sourceType !== "all") where.sourceType = sourceType

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
