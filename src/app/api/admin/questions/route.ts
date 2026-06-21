import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")

    const questions = await prisma.question.findMany({
      where: courseId ? { courseId } : {},
      include: { course: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(questions)
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const data = await req.json()

    const question = await prisma.question.create({ data })
    return NextResponse.json({ success: true, question })
  } catch {
    return NextResponse.json({ error: "שגיאה ביצירת שאלה" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const { id, ...data } = await req.json()
    const question = await prisma.question.update({ where: { id }, data })
    return NextResponse.json({ success: true, question })
  } catch {
    return NextResponse.json({ error: "שגיאה בעדכון שאלה" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    const courseId = searchParams.get("courseId")

    if (courseId && !id) {
      const { count } = await prisma.question.deleteMany({ where: { courseId } })
      return NextResponse.json({ success: true, count })
    }

    if (!id) return NextResponse.json({ error: "חסר ID" }, { status: 400 })
    await prisma.question.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "שגיאה במחיקת שאלה" }, { status: 500 })
  }
}
