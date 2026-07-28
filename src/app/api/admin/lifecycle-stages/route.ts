import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const KEY = "lifecycle-stages"

export async function GET() {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: KEY } })
    if (!row) return NextResponse.json({ stages: null })
    return NextResponse.json({ stages: JSON.parse(row.value) })
  } catch {
    return NextResponse.json({ stages: null })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }
    const { stages } = await req.json()
    if (!Array.isArray(stages)) {
      return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 })
    }
    await prisma.appSetting.upsert({
      where: { key: KEY },
      update: { value: JSON.stringify(stages) },
      create: { key: KEY, value: JSON.stringify(stages) },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
