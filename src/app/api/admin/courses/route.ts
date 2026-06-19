import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const courses = await prisma.course.findMany({
      include: { _count: { select: { questions: true, enrollments: true } } },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(courses)
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
    const course = await prisma.course.create({ data })
    return NextResponse.json({ success: true, course })
  } catch {
    return NextResponse.json({ error: "שגיאה ביצירת קורס" }, { status: 500 })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const { id, ...data } = await req.json()
    const course = await prisma.course.update({ where: { id }, data })
    return NextResponse.json({ success: true, course })
  } catch {
    return NextResponse.json({ error: "שגיאה בעדכון קורס" }, { status: 500 })
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
    if (!id) return NextResponse.json({ error: "חסר ID" }, { status: 400 })

    await prisma.course.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: "שגיאה במחיקת קורס" }, { status: 500 })
  }
}
