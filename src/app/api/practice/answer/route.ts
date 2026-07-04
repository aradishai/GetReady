import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false })

  const { questionId, courseId, isCorrect } = await req.json()
  if (!questionId || !courseId) return NextResponse.json({ ok: false })

  await prisma.practiceAnswer.create({
    data: { userId: session.user.id, questionId, courseId, isCorrect },
  })

  return NextResponse.json({ ok: true })
}
