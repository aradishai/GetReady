import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const { code } = await params
  const { score, correctAnswers, totalQuestions } = await req.json()

  const competition = await prisma.competition.findUnique({
    where: { code },
    include: { participants: true }
  })

  if (!competition) return NextResponse.json({ error: "תחרות לא נמצאה" }, { status: 404 })

  await prisma.competitionParticipant.update({
    where: { competitionId_userId: { competitionId: competition.id, userId: session.user.id } },
    data: { score, correctAnswers, totalQuestions, finishedAt: new Date() }
  })

  const updated = await prisma.competition.findUnique({
    where: { code },
    include: { participants: true }
  })

  const allFinished = updated!.participants.every(p => p.finishedAt !== null)
  if (allFinished) {
    await prisma.competition.update({ where: { code }, data: { status: "finished" } })
  }

  const results = updated!.participants
    .map(p => ({ userName: p.userName, score: p.score, correctAnswers: p.correctAnswers, finished: p.finishedAt !== null }))
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))

  return NextResponse.json({ success: true, allFinished, results })
}
