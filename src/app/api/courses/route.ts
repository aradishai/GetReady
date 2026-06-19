import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      where: { isActive: true },
      include: { _count: { select: { questions: true, enrollments: true } } },
    })
    return NextResponse.json(courses)
  } catch {
    return NextResponse.json({ error: "שגיאה בטעינת קורסים" }, { status: 500 })
  }
}
