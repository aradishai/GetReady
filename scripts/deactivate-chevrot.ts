import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const course = await prisma.course.findFirst({
    where: { name: { contains: "חברות" } },
  })

  if (!course) {
    console.log("לא נמצא קורס בשם חברות בישראל")
    return
  }

  console.log(`נמצא: ${course.name} (id: ${course.id}) — isActive: ${course.isActive}`)

  await prisma.course.update({
    where: { id: course.id },
    data: { isActive: false },
  })

  console.log("הקורס הועבר למאחורי הקלעים (isActive: false)")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
