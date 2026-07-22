import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const EXAM_SCHEDULE = [
  { id: "course-iyut",       name: "אישיות",            date: "2026-07-24" },
  { id: "course-orgs",       name: "ארגונים",           date: "2026-07-29" },
  { id: "course-psychodiag", name: "פסיכודיאגנוסטיקה", date: "2026-08-07" },
]

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

    const today = new Date().toISOString().split("T")[0]
    const next = EXAM_SCHEDULE.find(e => e.date >= today)
    if (!next) return NextResponse.json({ next: null, weakTopics: [], hardQuestions: [] })

    const answers = await prisma.practiceAnswer.findMany({
      where: { courseId: next.id },
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
      .slice(0, 5)

    return NextResponse.json({ next: { id: next.id, name: next.name, date: next.date }, weakTopics, hardQuestions })
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
