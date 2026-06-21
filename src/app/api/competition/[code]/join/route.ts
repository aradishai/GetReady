import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(_req: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ error: "לא מחובר" }, { status: 401 })

  const { code } = await params
  const competition = await prisma.competition.findUnique({ where: { code } })

  if (!competition) return NextResponse.json({ error: "תחרות לא נמצאה" }, { status: 404 })
  if (competition.status !== "waiting") return NextResponse.json({ error: "התחרות כבר התחילה" }, { status: 400 })

  await prisma.competitionParticipant.upsert({
    where: { competitionId_userId: { competitionId: competition.id, userId: session.user.id } },
    create: { competitionId: competition.id, userId: session.user.id, userName: session.user.name ?? "אנונימי" },
    update: {},
  })

  return NextResponse.json({ success: true })
}
