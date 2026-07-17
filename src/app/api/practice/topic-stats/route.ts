import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const courseId = new URL(req.url).searchParams.get("courseId")
  if (!courseId) return NextResponse.json({ error: "חסר courseId" }, { status: 400 })

  const [answers, record, allTopicsRaw] = await Promise.all([
    prisma.practiceAnswer.findMany({
      where: { userId: session.user.id, courseId },
      select: { isCorrect: true, questionId: true, question: { select: { topic: true } } },
    }),
    prisma.userCourseRecord.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    }),
    prisma.question.findMany({
      where: { courseId, isActive: true },
      select: { topic: true },
      distinct: ["topic"],
    }),
  ])

  const allTopics = allTopicsRaw.map((q) => q.topic)

  const practiceDone = new Set(answers.map((a) => a.questionId)).size

  const byTopic: Record<string, { total: number; correct: number }> = {}
  for (const a of answers) {
    const t = a.question.topic
    if (!byTopic[t]) byTopic[t] = { total: 0, correct: 0 }
    byTopic[t].total++
    if (a.isCorrect) byTopic[t].correct++
  }

  // All course topics — practiced ones get stats, unpracticed show as null
  const topics = allTopics.map((topic) => {
    const s = byTopic[topic]
    if (!s || s.total === 0) return { topic, total: 0, correct: 0, pct: null }
    return { topic, total: s.total, correct: s.correct, pct: Math.round((s.correct / s.total) * 100) }
  }).sort((a, b) => {
    // Unpracticed last, then sort by pct ascending (weakest first)
    if (a.pct === null && b.pct === null) return a.topic.localeCompare(b.topic)
    if (a.pct === null) return 1
    if (b.pct === null) return -1
    return a.pct - b.pct
  })

  return NextResponse.json({
    topics,
    practiceDone,
    bestStreak: record?.bestStreak ?? 0,
    bestSession: record?.bestSession ?? 0,
  })
}
