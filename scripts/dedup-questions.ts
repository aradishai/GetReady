import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const questions = await prisma.question.findMany({
    select: { id: true, courseId: true, question: true, createdAt: true },
    orderBy: { createdAt: "asc" },
  })

  // Group by courseId + question text
  const seen = new Map<string, string>() // key → first id
  const toDelete: string[] = []

  for (const q of questions) {
    const key = `${q.courseId}||${q.question}`
    if (seen.has(key)) {
      toDelete.push(q.id)
    } else {
      seen.set(key, q.id)
    }
  }

  if (toDelete.length === 0) {
    console.log("אין כפולות, הכל תקין")
    return
  }

  console.log(`נמצאו ${toDelete.length} שאלות כפולות — מוחק...`)
  await prisma.question.deleteMany({ where: { id: { in: toDelete } } })
  console.log(`נמחקו ${toDelete.length} כפולות`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
