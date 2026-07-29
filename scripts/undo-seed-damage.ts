import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { QUESTIONS_SOCIAL } from "../src/data/q-social"
import { QUESTIONS_IYUT } from "../src/data/q-iyut"
import { QUESTIONS_ASSESSMENT } from "../src/data/q-assessment"
import { QUESTIONS_ORGS } from "../src/data/q-orgs"
import { QUESTIONS_CHEVROT } from "../src/data/q-chevrot"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function removeQuestions(courseId: string, questions: { question: string }[]) {
  let deleted = 0
  for (const q of questions) {
    const result = await prisma.question.deleteMany({
      where: { courseId, question: q.question },
    })
    deleted += result.count
  }
  return deleted
}

async function main() {
  // מחיקת שאלות שנוספו בטעות מה-seed endpoint
  const social = await removeQuestions("course-social", QUESTIONS_SOCIAL)
  console.log(`course-social: נמחקו ${social} שאלות ישנות`)

  const iyut = await removeQuestions("course-iyut", QUESTIONS_IYUT)
  console.log(`course-iyut: נמחקו ${iyut} שאלות ישנות`)

  const assessment = await removeQuestions("course-assessment", QUESTIONS_ASSESSMENT)
  console.log(`course-assessment: נמחקו ${assessment} שאלות ישנות`)

  const orgs = await removeQuestions("course-orgs", QUESTIONS_ORGS)
  console.log(`course-orgs: נמחקו ${orgs} שאלות ישנות`)

  // מחיקת חברות בישראל (שאלות + קורס)
  const chevrot = await removeQuestions("course-chevrot", QUESTIONS_CHEVROT)
  await prisma.question.deleteMany({ where: { courseId: "course-chevrot" } })
  await prisma.userCourseRecord.deleteMany({ where: { courseId: "course-chevrot" } })
  try {
    await prisma.course.delete({ where: { id: "course-chevrot" } })
    console.log(`course-chevrot: נמחקו ${chevrot} שאלות + קורס`)
  } catch {
    console.log(`course-chevrot: כבר נמחק`)
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
