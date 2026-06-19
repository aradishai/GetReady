import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")

    const questions = await prisma.question.findMany({
      where: { isActive: true, ...(courseId ? { courseId } : {}) },
      select: { topic: true },
      distinct: ["topic"],
    })

    const topics = questions.map((q) => q.topic)
    return NextResponse.json(topics)
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
