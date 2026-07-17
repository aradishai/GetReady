import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false })

  const { questionId, courseId, isCorrect, bestStreak, bestSession } = await req.json()
  if (!questionId || !courseId) return NextResponse.json({ ok: false })

  await prisma.practiceAnswer.create({
    data: { userId: session.user.id, questionId, courseId, isCorrect },
  })

  if (bestStreak !== undefined || bestSession !== undefined) {
    const existing = await prisma.userCourseRecord.findUnique({
      where: { userId_courseId: { userId: session.user.id, courseId } },
    })
    await prisma.userCourseRecord.upsert({
      where: { userId_courseId: { userId: session.user.id, courseId } },
      update: {
        ...(bestStreak !== undefined && bestStreak > (existing?.bestStreak ?? 0) ? { bestStreak } : {}),
        ...(bestSession !== undefined && bestSession > (existing?.bestSession ?? 0) ? { bestSession } : {}),
      },
      create: {
        userId: session.user.id,
        courseId,
        bestStreak: bestStreak ?? 0,
        bestSession: bestSession ?? 0,
      },
    })
  }

  return NextResponse.json({ ok: true })
}
