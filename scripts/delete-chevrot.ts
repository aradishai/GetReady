import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const course = await prisma.course.findUnique({ where: { id: "course-chevrot" } })

  if (!course) {
    console.log("course-chevrot כבר נמחק, דילוג")
    return
  }

  await prisma.userCourseRecord.deleteMany({ where: { courseId: "course-chevrot" } })
  await prisma.course.delete({ where: { id: "course-chevrot" } })

  console.log("course-chevrot נמחק לצמיתות")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
