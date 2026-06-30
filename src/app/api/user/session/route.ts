import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session?.user?.id) return NextResponse.json({ ok: false })

  const rawUA = req.headers.get("user-agent") || "unknown"
  const ua = rawUA.slice(0, 200)
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    null

  await prisma.userSession.upsert({
    where: { userId_userAgent: { userId: session.user.id, userAgent: ua } },
    update: { lastActiveAt: new Date(), ip },
    create: { userId: session.user.id, userAgent: ua, ip },
  })

  return NextResponse.json({ ok: true })
}
