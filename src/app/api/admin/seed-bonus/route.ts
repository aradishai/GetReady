import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const BONUS_QUESTIONS = [
  {
    topic: "ילד עם הכינור",
    question: `מדוע תמונת "הילד עם הכינור" שובצה במיקום שבו היא מופיעה במבחן?`,
    answerA: "מאפשרת לבחון כבר בתחילה התמודדות עם קונפליקטים מורכבים ומצבי לחץ",
    answerB: "מאפשרת כניסה קלה יחסית למבחן, שכן היא יותר ניטרלית ופחות מאיימת",
    answerC: "מאפשרת לסכם את כלל הפרשנויות מהתמונות הקודמות שכן היא יותר ניטרלית ופחות מאיימת",
    answerD: "בהתחלה - מאפשרת לבחון את היכולת והיחסים של מועמד להתמודד עם דרישות ציפיות וסמכות",
    correctAnswer: "B",
    position: 1,
  },
  {
    topic: "ילד עם הכינור",
    question: `מתמיין התבקש לספר סיפור על תמונת "הילד עם הכינור" ואמר: "הילד חלם שנים שילמד לנגן. כשהוריו קנו לו כינור הוא התרגש מאוד, התאמן בהתמדה והרגיש שהוא סוף סוף מגשים חלום אישי." איזו פרשנות היא המדויקת ביותר?`,
    answerA: "הסיפור משקף בעיקר צורך לרצות את ההורים באמצעות הישגים",
    answerB: "הסיפור משקף מסוגלות עצמית, הגשמה עצמית ומוטיבציה פנימית",
    answerC: "הסיפור משקף משמעת עצמית הנובעת מציות לדמות סמכות",
    answerD: "הסיפור משקף דימוי עצמי התלוי בהערכת הסביבה",
    correctAnswer: "B",
    position: 2,
  },
  {
    topic: "ילד עם הכינור",
    question: `מתמיין התבקש לספר סיפור על תמונת "הילד עם הכינור" ואמר: "הילד אף פעם לא רצה לנגן, אבל הוריו הכריחו אותו להתאמן בכל יום. הוא מרגיש שהכינור הפך לעונש, וכבר חושב להפסיק למרות שהם יתאכזבו." איזו פרשנות היא המדויקת ביותר?`,
    answerA: "הסיפור משקף צורך לרצות את ההורים באמצעות הישגים",
    answerB: "הסיפור משקף הישגיות שנכפתה מבחוץ, לצד תסכול או מרד",
    answerC: "הסיפור משקף משמעת עצמית גבוהה ועמידה בציפיות הסביבה",
    answerD: "הסיפור משקף מסוגלות עצמית גבוהה והגשמת שאיפות אישיות",
    correctAnswer: "B",
    explanation: "",
    position: 3,
  },
  {
    topic: "ילד עם הכינור",
    question: `מתמיין סיפר על תמונת "הילד עם הכינור": "זה נראה כמו ילד שהתאמן בכינור. עכשיו הניח אותו וחולם שיהיה כנר גדול. אולי אפילו יהיה מפורסם. אדם גדול." איזו פרשנות היא המדויקת ביותר?`,
    answerA: "הסיפור משקף ביטחון עצמי גבוה והנאה מעצם הנגינה",
    answerB: "פער בין השאיפות לבין היכולת לממש אותן בפועל",
    answerC: "הסיפור משקף נכונות להשקיע לאורך זמן כדי להגיע למטרה",
    answerD: "הסיפור מעיד על קיומן של דמויות תומכות המסייעות לילד להתקדם",
    correctAnswer: "B",
    explanation: "הסיפור מתמקד בחלום, בפרסום ובתוצאה הסופית, אך כמעט אינו מתייחס לדרך, להשקעה או להנאה מהנגינה. בנוסף, הילד מוצג לבדו ללא התייחסות לדמויות נוספות.",
    position: 4,
  },
  {
    topic: "ילד עם הכינור",
    question: `מתמיין סיפר על תמונת "הילד עם הכינור": "הילד מנגן כבר זמן מה, אך אינו מרוצה מעצמו. הוא שואל האם יצליח להגיע לרמתם של כנרים טובים ממנו, ויודע שיצטרך להתאמן הרבה." איזו פרשנות היא המדויקת ביותר?`,
    answerA: "הסיפור משקף תחושת מסוגלות גבוהה וציפייה להצלחה בטוחה",
    answerB: "ריאליות, נכונות להשקיע לצד ספק עצמי והשוואה לאחרים",
    answerC: "הסיפור משקף מרד כלפי דמויות סמכות וחוסר משמעת",
    answerD: "הסיפור משקף הישגיות שנכפתה על ידי ההורים",
    correctAnswer: "B",
    explanation: "בסיפור קיימת הכרה בצורך בעבודה קשה לצד ספקות והשוואה לאחרים. אין בו הנאה מהעיסוק עצמו או דמויות תומכות, ולכן עולות שאלות לגבי חוויית הסביבה.",
    position: 5,
  },
]

export async function POST() {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    await prisma.course.upsert({
      where: { id: "bonus" },
      update: { name: "שאלות בונוס", isActive: true },
      create: {
        id: "bonus",
        name: "שאלות בונוס",
        description: "שאלות בונוס מיוחדות לפי תחום",
        isActive: true,
      },
    })

    let created = 0
    for (const q of BONUS_QUESTIONS) {
      const existing = await prisma.question.findFirst({
        where: { courseId: "bonus", question: q.question },
      })
      if (!existing) {
        await prisma.question.create({
          data: {
            courseId: "bonus",
            topic: q.topic,
            question: q.question,
            answerA: q.answerA,
            answerB: q.answerB,
            answerC: q.answerC,
            answerD: q.answerD,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation ?? "",
            difficulty: "Medium",
            sourceType: "Manual",
            position: q.position,
          },
        })
        created++
      }
    }

    return NextResponse.json({ success: true, created, total: BONUS_QUESTIONS.length })
  } catch (e) {
    console.error("seed-bonus error:", e)
    return NextResponse.json({ error: "שגיאה" }, { status: 500 })
  }
}
