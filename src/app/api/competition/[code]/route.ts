import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const { code } = await params
  const competition = await prisma.competition.findUnique({
    where: { code },
    include: { participants: { orderBy: { joinedAt: "asc" } } }
  })

  if (!competition) return NextResponse.json({ error: "תחרות לא נמצאה" }, { status: 404 })

  const allFinished = competition.participants.length > 0 &&
    competition.participants.every(p => p.finishedAt !== null)

  return NextResponse.json({
    code: competition.code,
    status: competition.status,
    hostId: competition.hostId,
    courseId: competition.courseId,
    difficulty: competition.difficulty,
    questionIds: JSON.parse(competition.questionIds),
    participants: competition.participants.map(p => ({
      userId: p.userId,
      userName: p.userName,
      score: p.score,
      correctAnswers: p.correctAnswers,
      totalQuestions: p.totalQuestions,
      finished: p.finishedAt !== null,
      finishedAt: p.finishedAt,
    })),
    allFinished,
    isHost: competition.hostId === session.user.id,
  })
}
