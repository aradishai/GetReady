import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  return Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("")
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const { courseId, difficulty } = await req.json()

  let code: string
  let attempts = 0
  do {
    code = generateCode()
    const existing = await prisma.competition.findUnique({ where: { code } })
    if (!existing) break
    attempts++
  } while (attempts < 10)

  const competition = await prisma.competition.create({
    data: {
      code: code!,
      hostId: session.user.id,
      courseId: courseId || null,
      difficulty: difficulty || "all",
      participants: {
        create: { userId: session.user.id, userName: session.user.name ?? "אנונימי" }
      }
    }
  })

  return NextResponse.json({ code: competition.code, competitionId: competition.id })
}
