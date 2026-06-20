import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import path from "path"

const adapter = new PrismaBetterSqlite3({ url: path.resolve(process.cwd(), "prisma/dev.db") })
const prisma = new PrismaClient({ adapter })

async function main() {
  const deleted = await prisma.question.deleteMany()
  console.log("✅ נמחקו", deleted.count, "שאלות")
  await prisma.$disconnect()
}

main().catch(console.error)
