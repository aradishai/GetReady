import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const answers = await prisma.practiceAnswer.findMany({
      where: { courseId: "course-social" },
      orderBy: { createdAt: "asc" },
      select: {
        userId: true,
        isCorrect: true,
        user: { select: { name: true } },
      },
    })

    const byUser: Record<string, { name: string; answers: boolean[] }> = {}
    for (const a of answers) {
      if (!byUser[a.userId]) byUser[a.userId] = { name: a.user.name, answers: [] }
      byUser[a.userId].answers.push(a.isCorrect)
    }

    const leaderboard = Object.entries(byUser).map(([userId, { name, answers: ans }]) => {
      let best = 0, cur = 0
      for (const correct of ans) {
        cur = correct ? cur + 1 : 0
        if (cur > best) best = cur
      }
      return { userId, name, streak: best, total: ans.length }
    })

    leaderboard.sort((a, b) => b.streak - a.streak)
    return NextResponse.json(leaderboard.slice(0, 3))
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
