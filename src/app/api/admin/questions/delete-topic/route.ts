import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const { courseId, topic } = await req.json()
    if (!courseId || !topic) {
      return NextResponse.json({ error: "חסרים פרמטרים" }, { status: 400 })
    }

    const result = await prisma.question.deleteMany({
      where: { courseId, topic },
    })

    return NextResponse.json({ success: true, count: result.count })
  } catch {
    return NextResponse.json({ error: "שגיאה במחיקת נושא" }, { status: 500 })
  }
}
