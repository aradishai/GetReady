import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const { courseId, topic, position } = await req.json()
    if (!courseId || !topic || position === undefined) {
      return NextResponse.json({ error: "חסרים פרמטרים" }, { status: 400 })
    }

    const { count } = await prisma.question.updateMany({
      where: { courseId, topic },
      data: { position: Number(position) },
    })

    return NextResponse.json({ success: true, count })
  } catch (e) {
    console.error("position update error:", e)
    return NextResponse.json({ error: "שגיאה בעדכון מיקום" }, { status: 500 })
  }
}
