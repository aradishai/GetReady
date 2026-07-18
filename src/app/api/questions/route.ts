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
      const dbUser = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { isPaid: true, isSocialLocked: true },
      })
      const isSocial = requestedCourseId === "course-social"
      if (isSocial && dbUser?.isSocialLocked) {
        return NextResponse.json({ error: "גישה אסורה" }, { status: 403 })
      }
      if (!isSocial && !dbUser?.isPaid) {
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

    const topicsParam = searchParams.get("topics")
    const where: Record<string, unknown> = { isActive: true }
    if (requestedCourseId) where.courseId = requestedCourseId
    if (topicsParam) {
      const topicList = topicsParam.split(",").filter(Boolean)
      if (topicList.length > 0) where.topic = { in: topicList }
    } else if (topic && topic !== "all") {
      where.topic = topic
    }
    if (difficulty && difficulty !== "all") where.difficulty = difficulty
    if (sourceType && sourceType !== "all") where.sourceType = sourceType

    // Count-only mode for progress tracking
    if (searchParams.get("countOnly") === "true") {
      const count = await prisma.question.count({ where })
      return NextResponse.json({ count })
    }

    const ordered = searchParams.get("ordered") === "true"

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
        position: true,
      },
      ...(ordered ? { orderBy: { position: "asc" } } : {}),
    })

    if (ordered) {
      return NextResponse.json(questions)
    }

    // Guarantee at least one question per topic, then fill remaining slots randomly
    const byTopic: Record<string, typeof questions> = {}
    for (const q of questions) {
      if (!byTopic[q.topic]) byTopic[q.topic] = []
      byTopic[q.topic].push(q)
    }

    const guaranteed: typeof questions = []
    const pool: typeof questions = []
    for (const topicQs of Object.values(byTopic)) {
      const rand = topicQs.sort(() => Math.random() - 0.5)
      guaranteed.push(rand[0])
      pool.push(...rand.slice(1))
    }

    const slots = Math.max(0, limit - guaranteed.length)
    const extra = pool.sort(() => Math.random() - 0.5).slice(0, slots)
    const shuffled = [...guaranteed, ...extra].sort(() => Math.random() - 0.5).slice(0, limit)

    return NextResponse.json(shuffled)
  } catch {
    return NextResponse.json({ error: "שגיאה בטעינת שאלות" }, { status: 500 })
  }
}
