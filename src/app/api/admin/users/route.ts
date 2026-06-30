import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        isPaid: true,
        isSocialLocked: true,
        isAdmin: true,
        xp: true,
        level: true,
        totalPoints: true,
        createdAt: true,
        _count: {
          select: {
            testResults: true,
            paymentRequests: true,
            sessions: { where: { lastActiveAt: { gt: since } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const { userId, isPaid, isSocialLocked, isAdmin } = await req.json()

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(isPaid !== undefined ? { isPaid } : {}),
        ...(isSocialLocked !== undefined ? { isSocialLocked } : {}),
        ...(isAdmin !== undefined ? { isAdmin } : {}),
      },
    })

    return NextResponse.json({ success: true, user: updated })
  } catch {
    return NextResponse.json({ error: "שגיאה בעדכון" }, { status: 500 })
  }
}
