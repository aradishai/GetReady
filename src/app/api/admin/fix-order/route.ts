import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

const NEW_QUESTIONS = [
  "איזו מהאפשרויות הבאות מתארת בצורה הטובה ביותר את מטרת ההצגה העצמית?",
  "מועמד בריאיון עבודה מדגיש שוב ושוב את הישגיו, ניסיונו והצלחותיו כדי להרשים את המראיין. באיזו אסטרטגיית הצגה עצמית הוא משתמש?",
  "עובדת שולחת את רוב המיילים שלה בשעות הערב המאוחרות כדי שהמנהל יראה שהיא עובדת עד שעות מאוחרות. באיזו אסטרטגיית הצגה עצמית היא משתמשת?",
  "מהו ניטור עצמי (Self-Monitoring)?",
  "איזו מהאפשרויות הבאות מתארת את המושג 'יצירת סביבה' כמקור לידע עצמי?",
  "מה מאפיין את תפיסת העצמי בתרבות המערבית לעומת התרבות המזרחית?",
  "לפי הסיכום, במה נוטים נשים וגברים להדגיש את תפיסת העצמי שלהם?",
  "איזו מהטענות הבאות נכונה לגבי הערכה עצמית?",
]

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  if (secret !== "getready-seed-2024") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const oldDate = new Date("2020-01-01T00:00:00.000Z")
  let updated = 0

  for (const questionText of NEW_QUESTIONS) {
    const result = await prisma.question.updateMany({
      where: { courseId: "course-social", question: questionText },
      data: { createdAt: oldDate },
    })
    updated += result.count
  }

  return NextResponse.json({ success: true, updated })
}
