import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json({ error: "כל השדות חובה" }, { status: 400 })
    }

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "המייל כבר קיים במערכת" }, { status: 400 })
    }

    const hashed = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: { name, email, password: hashed },
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch {
    return NextResponse.json({ error: "שגיאה בהרשמה" }, { status: 500 })
  }
}
