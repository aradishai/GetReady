import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const requests = await prisma.paymentRequest.findMany({
      include: { user: { select: { id: true, name: true, email: true, isPaid: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(requests)
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

    const { requestId, action } = await req.json()

    const request = await prisma.paymentRequest.update({
      where: { id: requestId },
      data: { status: action === "approve" ? "approved" : "rejected" },
    })

    if (action === "approve") {
      await prisma.user.update({
        where: { id: request.userId },
        data: { isPaid: true },
      })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "שגיאה בעדכון" }, { status: 500 })
  }
}
