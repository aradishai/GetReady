import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { execSync } from "child_process"
import path from "path"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

async function main() {
  const scriptName = process.argv[2]
  if (!scriptName) { console.error("usage: seed-runner <script-name>"); process.exit(1) }

  const already = await prisma.seedLog.findUnique({ where: { scriptName } })
  if (already) {
    console.log(`[skip] ${scriptName}`)
    return
  }

  const scriptPath = path.resolve(process.cwd(), "scripts", `${scriptName}.ts`)
  console.log(`[run] ${scriptName}`)
  execSync(`npx tsx "${scriptPath}"`, { stdio: "inherit", env: process.env })

  await prisma.seedLog.create({ data: { scriptName } })
}

main()
  .catch(e => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
