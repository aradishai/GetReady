import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "path"

const dbPath = path.resolve(process.cwd(), "prisma/dev.db")
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  const courses = [
    { id: "course-iyut", name: "אישיות", description: "תיאוריות אישיות ומבחנים" },
    { id: "course-social", name: "פסיכולוגיה חברתית", description: "פסיכולוגיה חברתית ותהליכי קבוצה" },
    { id: "course-psychodiag", name: "פסיכודיאגנוסטיקה", description: "אבחון פסיכולוגי וכלי מדידה" },
  ]

  for (const c of courses) {
    await prisma.course.upsert({
      where: { id: c.id },
      update: { name: c.name, description: c.description, isActive: true },
      create: { id: c.id, name: c.name, description: c.description, isActive: true, price: 0 },
    })
    console.log("✅ Course:", c.name)
  }

  await prisma.$disconnect()
}

main().catch(console.error)
