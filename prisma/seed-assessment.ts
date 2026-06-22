import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "path"
import { QUESTIONS_ASSESSMENT } from "../src/data/q-assessment"

const adapter = new PrismaBetterSqlite3({ url: path.resolve(process.cwd(), "prisma/dev.db") })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 מוסיף שאלות לקורס אבחון ומיון...")

  let created = 0
  for (const q of QUESTIONS_ASSESSMENT) {
    await prisma.question.create({
      data: {
        courseId: "course-assessment",
        question: q.question,
        answerA: q.answerA,
        answerB: q.answerB,
        answerC: q.answerC,
        answerD: q.answerD,
        correctAnswer: q.correctAnswer,
        explanation: q.explanation,
        topic: q.topic,
        difficulty: q.difficulty,
        sourceType: q.sourceType ?? "Textbook",
        isActive: true,
      },
    })
    created++
  }

  console.log(`✅ נוצרו ${created} שאלות לקורס אבחון ומיון`)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
