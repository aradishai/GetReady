import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const courseId = req.nextUrl.searchParams.get("courseId")
    if (!courseId) {
      return NextResponse.json({ error: "חסר courseId" }, { status: 400 })
    }

    const answers = await prisma.practiceAnswer.findMany({
      where: { courseId },
      select: {
        isCorrect: true,
        questionId: true,
        question: { select: { topic: true, question: true } },
      },
    })

    const topicMap: Record<string, { total: number; correct: number }> = {}
    const questionMap: Record<string, { question: string; topic: string; total: number; wrong: number }> = {}

    for (const a of answers) {
      const topic = a.question.topic
      if (!topicMap[topic]) topicMap[topic] = { total: 0, correct: 0 }
      topicMap[topic].total++
      if (a.isCorrect) topicMap[topic].correct++

      if (!questionMap[a.questionId]) {
        questionMap[a.questionId] = { question: a.question.question, topic, total: 0, wrong: 0 }
      }
      questionMap[a.questionId].total++
      if (!a.isCorrect) questionMap[a.questionId].wrong++
    }

    const weakTopics = Object.entries(topicMap)
      .map(([topic, { total, correct }]) => ({
        topic,
        total,
        correct,
        pct: Math.round((correct / total) * 100),
      }))
      .filter(t => t.total >= 5)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 3)

    const hardQuestions = Object.entries(questionMap)
      .map(([id, { question, topic, total, wrong }]) => ({
        id,
        question,
        topic,
        total,
        wrong,
        pct: Math.round(((total - wrong) / total) * 100),
      }))
      .filter(q => q.total >= 3)
      .sort((a, b) => a.pct - b.pct)
      .slice(0, 10)

    return NextResponse.json({ weakTopics, hardQuestions })
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
