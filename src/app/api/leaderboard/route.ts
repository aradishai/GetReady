import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const courseId = searchParams.get("courseId")

    if (courseId) {
      const results = await prisma.testResult.groupBy({
        by: ["userId"],
        where: { courseId },
        _sum: { score: true },
        _count: { id: true },
        orderBy: { _sum: { score: "desc" } },
        take: 20,
      })

      const enriched = await Promise.all(
        results.map(async (r) => {
          const user = await prisma.user.findUnique({
            where: { id: r.userId },
            select: { id: true, name: true, level: true, xp: true },
          })
          return { ...user, totalScore: r._sum.score, testCount: r._count.id }
        })
      )
      return NextResponse.json(enriched)
    }

    const users = await prisma.user.findMany({
      where: { isPaid: true },
      select: { id: true, name: true, level: true, xp: true, totalPoints: true },
      orderBy: { totalPoints: "desc" },
      take: 20,
    })

    return NextResponse.json(users)
  } catch {
    return NextResponse.json({ error: "שגיאה בטעינת לידרבורד" }, { status: 500 })
  }
}
