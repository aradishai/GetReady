import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import { QUESTIONS_PSYCHODIAG } from "@/data/q-psychodiag"
import { QUESTIONS_SOCIAL } from "@/data/q-social"
import { QUESTIONS_IYUT } from "@/data/q-iyut"
import { QUESTIONS_CHEVROT } from "@/data/q-chevrot"
import { QUESTIONS_ASSESSMENT } from "@/data/q-assessment"
import { QUESTIONS_ORGS } from "@/data/q-orgs"

const SEED_SECRET = "getready-seed-2024"

const COURSES = [
  { id: "course-psychodiag", name: "פסיכודיאגנוסטיקה", description: "אבחון פסיכולוגי וכלי מדידה" },
  { id: "course-social", name: "פסיכולוגיה חברתית", description: "פסיכולוגיה חברתית ותהליכי קבוצה" },
  { id: "course-iyut", name: "אישיות", description: "תיאוריות אישיות ומבחנים" },
  { id: "course-assessment", name: "אבחון ומיון", description: "אבחון ומיון פסיכולוגי" },
  { id: "course-chevrot", name: "חברות בישראל", description: "סוציולוגיה של החברה הישראלית" },
  { id: "course-orgs", name: "ארגונים", description: "פסיכולוגיה ארגונית" },
]

async function runSeed(secret: string | null) {
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const results: Record<string, number> = {}

    const adminPassword = await bcrypt.hash("admin123", 12)
    await prisma.user.upsert({
      where: { email: "admin@studyarena.com" },
      update: {},
      create: {
        name: "מנהל מערכת",
        email: "admin@studyarena.com",
        password: adminPassword,
        isAdmin: true,
        isPaid: true,
      },
    })
    results.admin = 1

    for (const c of COURSES) {
      await prisma.course.upsert({
        where: { id: c.id },
        update: { name: c.name, description: c.description, isActive: true },
        create: { id: c.id, name: c.name, description: c.description, isActive: true, price: 0 },
      })
    }
    results.courses = COURSES.length

    const courseQuestions: [string, typeof QUESTIONS_PSYCHODIAG][] = [
      ["course-psychodiag", QUESTIONS_PSYCHODIAG],
      ["course-social", QUESTIONS_SOCIAL],
      ["course-iyut", QUESTIONS_IYUT],
      ["course-chevrot", QUESTIONS_CHEVROT],
      ["course-assessment", QUESTIONS_ASSESSMENT],
      ["course-orgs", QUESTIONS_ORGS],
    ]

    for (const [courseId, questions] of courseQuestions) {
      let added = 0
      for (const q of questions) {
        const exists = await prisma.question.findFirst({
          where: { courseId, question: q.question },
        })
        if (!exists) {
          await prisma.question.create({
            data: { courseId, ...q, sourceType: "Generated", isActive: true },
          })
          added++
        }
      }
      results[courseId] = added
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

const NEW_QUESTIONS_TO_DEMOTE = [
  "איזו מהאפשרויות הבאות מתארת בצורה הטובה ביותר את מטרת ההצגה העצמית?",
  "מועמד בריאיון עבודה מדגיש שוב ושוב את הישגיו, ניסיונו והצלחותיו כדי להרשים את המראיין. באיזו אסטרטגיית הצגה עצמית הוא משתמש?",
  "עובדת שולחת את רוב המיילים שלה בשעות הערב המאוחרות כדי שהמנהל יראה שהיא עובדת עד שעות מאוחרות. באיזו אסטרטגיית הצגה עצמית היא משתמשת?",
  "מהו ניטור עצמי (Self-Monitoring)?",
  "איזו מהאפשרויות הבאות מתארת את המושג 'יצירת סביבה' כמקור לידע עצמי?",
  "מה מאפיין את תפיסת העצמי בתרבות המערבית לעומת התרבות המזרחית?",
  "לפי הסיכום, במה נוטים נשים וגברים להדגיש את תפיסת העצמי שלהם?",
  "איזו מהטענות הבאות נכונה לגבי הערכה עצמית?",
]

async function fixOrder(secret: string | null) {
  if (secret !== SEED_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  try {
    const result = await prisma.$executeRaw`
      UPDATE "Question"
      SET "createdAt" = '2020-01-01 00:00:00'::timestamp
      WHERE "courseId" = 'course-social'
      AND "question" = ANY(${NEW_QUESTIONS_TO_DEMOTE}::text[])
    `
    return NextResponse.json({ success: true, updated: result })
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const secret = req.headers.get("x-seed-secret") || req.nextUrl.searchParams.get("secret")
  return runSeed(secret)
}

export async function GET(req: NextRequest) {
  const secret = req.nextUrl.searchParams.get("secret")
  const action = req.nextUrl.searchParams.get("action")
  if (action === "fix-order") return fixOrder(secret)
  return runSeed(secret)
}
