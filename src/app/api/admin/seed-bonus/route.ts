import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// correctAnswer spread: A(Q1,Q4,Q9), B(Q5,Q7), C(Q2,Q8), D(Q3,Q6,Q10)
const BONUS_QUESTIONS = [
  {
    topic: "ילד עם הכינור",
    question: `מדוע תמונת "הילד עם הכינור" שובצה במיקום שבו היא מופיעה במבחן?`,
    answerA: "מאפשרת כניסה קלה יחסית למבחן, שכן היא יותר ניטרלית ופחות מאיימת",
    answerB: "מאפשרת לבחון כבר בתחילה התמודדות עם קונפליקטים מורכבים ומצבי לחץ",
    answerC: "מאפשרת לסכם את כלל הפרשנויות מהתמונות הקודמות שכן היא יותר ניטרלית ופחות מאיימת",
    answerD: "בהתחלה - מאפשרת לבחון את היכולת והיחסים של מועמד להתמודד עם דרישות ציפיות וסמכות",
    correctAnswer: "A",
    explanation: "",
    position: 1,
  },
  {
    topic: "ילד עם הכינור",
    question: `מתמיין התבקש לספר סיפור על תמונת "הילד עם הכינור" ואמר: "הילד חלם שנים שילמד לנגן. כשהוריו קנו לו כינור הוא התרגש מאוד, התאמן בהתמדה והרגיש שהוא סוף סוף מגשים חלום אישי." איזו פרשנות היא המדויקת ביותר?`,
    answerA: "הסיפור משקף בעיקר צורך לרצות את ההורים באמצעות הישגים",
    answerB: "הסיפור משקף משמעת עצמית הנובעת מציות לדמות סמכות",
    answerC: "הסיפור משקף מסוגלות עצמית, הגשמה עצמית ומוטיבציה פנימית",
    answerD: "הסיפור משקף דימוי עצמי התלוי בהערכת הסביבה",
    correctAnswer: "C",
    explanation: "",
    position: 2,
  },
  {
    topic: "ילד עם הכינור",
    question: `מתמיין התבקש לספר סיפור על תמונת "הילד עם הכינור" ואמר: "הילד אף פעם לא רצה לנגן, אבל הוריו הכריחו אותו להתאמן בכל יום. הוא מרגיש שהכינור הפך לעונש, וכבר חושב להפסיק למרות שהם יתאכזבו." איזו פרשנות היא המדויקת ביותר?`,
    answerA: "הסיפור משקף צורך לרצות את ההורים באמצעות הישגים",
    answerB: "הסיפור משקף משמעת עצמית גבוהה ועמידה בציפיות הסביבה",
    answerC: "הסיפור משקף מסוגלות עצמית גבוהה והגשמת שאיפות אישיות",
    answerD: "הסיפור משקף הישגיות שנכפתה מבחוץ, לצד תסכול או מרד",
    correctAnswer: "D",
    explanation: "",
    position: 3,
  },
  {
    topic: "ילד עם הכינור",
    question: `מתמיין סיפר על תמונת "הילד עם הכינור": "זה נראה כמו ילד שהתאמן בכינור. עכשיו הניח אותו וחולם שיהיה כנר גדול. אולי אפילו יהיה מפורסם. אדם גדול." איזו פרשנות היא המדויקת ביותר?`,
    answerA: "פער בין השאיפות לבין היכולת לממש אותן בפועל",
    answerB: "הסיפור משקף ביטחון עצמי גבוה והנאה מעצם הנגינה",
    answerC: "הסיפור משקף נכונות להשקיע לאורך זמן כדי להגיע למטרה",
    answerD: "הסיפור מעיד על קיומן של דמויות תומכות המסייעות לילד להתקדם",
    correctAnswer: "A",
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
  {
    topic: "משפחה בכפר",
    question: `בעת ניתוח הסיפור על תמונת "משפחה בכפר", מה יעניין במיוחד את המאבחן?`,
    answerA: "עד כמה הנבדק מתאר במדויק את פרטי התמונה",
    answerB: "האם הנבדק מזהה את כל הדמויות המופיעות בתמונה",
    answerC: "עד כמה הסיפור מתרחש באופן ריאלי",
    answerD: "האם קיים דיאלוג בין הדמויות ומה אופיו",
    correctAnswer: "D",
    explanation: "",
    position: 6,
  },
  {
    topic: "משפחה בכפר",
    question: `איזה נושא צפוי לעלות באופן אופייני בסיפורים על תמונת "משפחה בכפר"?`,
    answerA: "תחושת מסוגלות והגשמה עצמית",
    answerB: "יחסים בין אישיים ויחסים בין דוריים",
    answerC: "צורך בהישגיות ובהכרה חברתית",
    answerD: "ציות לסמכות הורית ומשמעת עצמית",
    correctAnswer: "B",
    explanation: "",
    position: 7,
  },
  {
    topic: "משפחה בכפר",
    question: `מדוע הדמות השלישית בתמונת "משפחה בכפר" נחשבת משמעותית במיוחד?`,
    answerA: "מפני שהיא הדמות המרכזית בכל הסיפורים",
    answerB: "מפני שהיא מייצגת בהכרח את הנבדק",
    answerC: "מפני שהיא פתוחה יותר לפרשנות ומעוררת מגוון אפשרויות",
    answerD: "מפני שהיא מאפשרת להעריך את רמת האינטליגנציה",
    correctAnswer: "C",
    explanation: "",
    position: 8,
  },
  {
    topic: "משפחה בכפר",
    question: `מתמיין סיפר כי האב עובד בשדה, האם עסוקה בענייניה, והבת עומדת לבדה. אף אחת מהדמויות אינה פונה לאחרת או מתייחסת אליה. איזו פרשנות היא המדויקת ביותר?`,
    answerA: "הסיפור עשוי להעיד על תפיסה של קשרים מנותקים והיעדר דיאלוג",
    answerB: "הסיפור משקף קושי בקבלת סמכות הורית",
    answerC: "הסיפור משקף דימוי עצמי נמוך של הדמות המרכזית",
    answerD: "הסיפור משקף שאיפה גבוהה להישגיות ולהצלחה",
    correctAnswer: "A",
    explanation: "",
    position: 9,
  },
  {
    topic: "משפחה בכפר",
    question: `מתמיין סיפר כי הצעירה עוזבת את הבית, הוריה מתקשים לקבל זאת אך לבסוף משלימים עם החלטתה. איזו תמה בולטת במיוחד בסיפור?`,
    answerA: "מסוגלות עצמית והגשמה אישית",
    answerB: "צורך בהישגיות ובהכרה חברתית",
    answerC: "ציות לדמויות סמכות במשפחה",
    answerD: "יחסים בין דוריים סביב היפרדות והשלמה",
    correctAnswer: "D",
    explanation: "",
    position: 10,
  },
]

export async function POST(req: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: "אין הרשאה" }, { status: 403 })
    }

    const reset = new URL(req.url).searchParams.get("reset") === "true"

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

    if (reset) {
      await prisma.question.deleteMany({ where: { courseId: "bonus" } })
    }

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
            explanation: q.explanation,
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
