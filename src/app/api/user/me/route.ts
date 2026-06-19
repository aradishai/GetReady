import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        isAdmin: true,
        isPaid: true,
        xp: true,
        level: true,
        coins: true,
        totalPoints: true,
        streak: true,
        lastStudyDate: true,
        createdAt: true,
        achievements: true,
        _count: { select: { testResults: true } },
      },
    })

    return NextResponse.json(user)
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
