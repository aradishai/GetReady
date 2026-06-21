import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const { courseId, answers, timeSpent } = await req.json()

    const correctAnswers = answers.filter((a: { isCorrect: boolean }) => a.isCorrect).length
    const score = Math.round((correctAnswers / answers.length) * 100)

    const pointsEarned = correctAnswers * 4

    const result = await prisma.testResult.create({
      data: {
        userId: session.user.id,
        courseId,
        score,
        totalQuestions: answers.length,
        correctAnswers,
        timeSpent: timeSpent || null,
        answers: {
          create: answers.map((a: {
            questionId: string
            userAnswer: string
            isCorrect: boolean
            timeSpent?: number
          }) => ({
            questionId: a.questionId,
            userAnswer: a.userAnswer,
            isCorrect: a.isCorrect,
            timeSpent: a.timeSpent || null,
          })),
        },
      },
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalPoints: { increment: pointsEarned },
        lastStudyDate: new Date(),
      },
    })

    return NextResponse.json({ success: true, resultId: result.id, score, pointsEarned })
  } catch {
    return NextResponse.json({ error: "שגיאה בשמירת תוצאות" }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: "לא מחובר" }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const resultId = searchParams.get("id")

    if (resultId) {
      const result = await prisma.testResult.findFirst({
        where: { id: resultId, userId: session.user.id },
        include: {
          answers: {
            include: {
              question: {
                select: {
                  question: true,
                  answerA: true,
                  answerB: true,
                  answerC: true,
                  answerD: true,
                  correctAnswer: true,
                  explanation: true,
                  topic: true,
                  difficulty: true,
                },
              },
            },
          },
          course: { select: { name: true } },
        },
      })
      return NextResponse.json(result)
    }

    const courseId = searchParams.get("courseId")
    const results = await prisma.testResult.findMany({
      where: { userId: session.user.id, ...(courseId ? { courseId } : {}) },
      include: { course: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
      take: 10,
    })

    return NextResponse.json(results)
  } catch {
    return NextResponse.json({ error: "שגיאה בטעינת תוצאות" }, { status: 500 })
  }
}
