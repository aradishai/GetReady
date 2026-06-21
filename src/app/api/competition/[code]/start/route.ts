import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const QUESTION_COUNT = 25

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const { code } = await params
  const competition = await prisma.competition.findUnique({ where: { code } })

  if (!competition) return NextResponse.json({ error: "תחרות לא נמצאה" }, { status: 404 })
  if (competition.hostId !== session.user.id) return NextResponse.json({ error: "רק המארח יכול להתחיל" }, { status: 403 })
  if (competition.status !== "waiting") return NextResponse.json({ error: "התחרות כבר התחילה" }, { status: 400 })

  const where: Record<string, unknown> = { isActive: true }
  if (competition.courseId) where.courseId = competition.courseId
  if (competition.difficulty !== "all") where.difficulty = competition.difficulty

  const questions = await prisma.question.findMany({ where, select: { id: true } })
  const shuffled = questions.sort(() => Math.random() - 0.5).slice(0, QUESTION_COUNT)
  const questionIds = shuffled.map(q => q.id)

  await prisma.competition.update({
    where: { code },
    data: { status: "active", questionIds: JSON.stringify(questionIds) }
  })

  return NextResponse.json({ success: true, questionIds })
}
