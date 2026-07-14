import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const allDynamics = await prisma.question.findMany({
    where: { courseId: "course-assessment", topic: "דינמיקה קבוצתית" },
    orderBy: { createdAt: "asc" },
    select: { id: true, question: true, createdAt: true },
  })

  console.log(`נמצאו ${allDynamics.length} שאלות דינמיקה קבוצתית בסה"כ`)

  const seen = new Map<string, string>() // question text -> first (oldest) id
  const toDelete: string[] = []

  for (const q of allDynamics) {
    if (seen.has(q.question)) {
      toDelete.push(q.id)
    } else {
      seen.set(q.question, q.id)
    }
  }

  console.log(`נמצאו ${toDelete.length} כפילויות למחיקה`)

  if (toDelete.length === 0) {
    console.log("אין כפילויות")
    return
  }

  const deleted = await prisma.question.deleteMany({
    where: { id: { in: toDelete } },
  })

  console.log(`נמחקו ${deleted.count} כפילויות בהצלחה`)

  const remaining = await prisma.question.count({
    where: { courseId: "course-assessment" },
  })
  console.log(`סה"כ שאלות ב-course-assessment אחרי המחיקה: ${remaining}`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
