import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const KEY = "hofstede-dimensions"

export async function GET() {
  try {
    const row = await prisma.appSetting.findUnique({ where: { key: KEY } })
    if (!row) return NextResponse.json({ dimensions: null })
    return NextResponse.json({ dimensions: JSON.parse(row.value) })
  } catch {
    return NextResponse.json({ dimensions: null })
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }
    const { dimensions } = await req.json()
    if (!Array.isArray(dimensions)) {
      return NextResponse.json({ error: "נתונים לא תקינים" }, { status: 400 })
    }
    await prisma.appSetting.upsert({
      where: { key: KEY },
      update: { value: JSON.stringify(dimensions) },
      create: { key: KEY, value: JSON.stringify(dimensions) },
    })
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
