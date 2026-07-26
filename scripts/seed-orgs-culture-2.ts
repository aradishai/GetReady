import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TOPIC = "תרבות ארגונית"

const QUESTIONS = [
  {
    question: "בתחילת המאה ה־20, כאשר פורד הכניסה את פס הייצור ההמוני במפעליה, עובדים רבים נדרשו להתרגל לשיטת עבודה חדשה שבה חלוקת העבודה הייתה מאוד מובנית וכל עובד ביצע פעולה מוגדרת. המעבר שינה באופן משמעותי את הדרך שבה עובדים ייצרו כלי רכב. איזו דרך הייתה יכולה לסייע לעובדים להתמודד עם המעבר?",
    answerA: "השארת העובדים ללא מידע על השינוי",
    answerB: "הסבר מטרת המהלך והכנת העובדים אליו",
    answerC: "ביטול השינוי בעקבות קשיי הסתגלות",
    answerD: "החלפת כלל העובדים שהתנגדו",
    correctAnswer: "B",
    explanation: "כאשר עובדים מבינים את הסיבה לשינוי ומקבלים הכנה מתאימה, קל יותר להפחית חששות ולהגדיל את הנכונות להשתתף בתהליך.",
    difficulty: "Hard",
  },
  {
    question: "כאשר Volkswagen התמודדה עם פרשת זיוף נתוני הפליטות ('דיזלגייט'), החברה נדרשה לבצע שינוי משמעותי בדרך שבה ניהלה בקרה, אחריות וקבלת החלטות. השינוי חייב עובדים ומנהלים לבחון מחדש דפוסי עבודה שהיו מקובלים בעבר. מה עשוי לסייע לארגון במצב כזה?",
    answerA: "חזרה מלאה לדפוסי העבודה הישנים",
    answerB: "יצירת מחויבות לערכים חדשים בארגון",
    answerC: "התעלמות מהבעיה עד שתיעלם",
    answerD: "הפחתת תקשורת בין מנהלים לעובדים",
    correctAnswer: "B",
    explanation: "כאשר שינוי דורש שינוי בדפוסי חשיבה והתנהגות, חשוב שעובדים יבינו ויאמצו את הכיוון החדש.",
    difficulty: "Hard",
  },
  {
    question: "כאשר GM החליטה לאורך השנים להתאים את פעילותה לשינויים בשוק הרכב, כולל מעבר להשקעה גדולה יותר ברכבים חשמליים, חלק מהעובדים נדרשו ללמוד מיומנויות חדשות ולהסתגל לתחום שונה מזה שהכירו. איזו דרך יכולה לסייע בהתמודדות עם התנגדות?",
    answerA: "השארת העובדים ללא הכשרה",
    answerB: "מתן כלים שיאפשרו הסתגלות למצב החדש",
    answerC: "דחיית המעבר לטכנולוגיה חדשה",
    answerD: "ביטול מטרות השינוי",
    correctAnswer: "B",
    explanation: "כאשר עובדים מקבלים כלים, ידע ותמיכה, קל יותר להתמודד עם תחושת חוסר ודאות הנובעת משינוי.",
    difficulty: "Hard",
  },
  {
    question: "כאשר BMW הגדילה את ההשקעה ברכבים חשמליים, החברה נדרשה לשנות חלק מתהליכי הפיתוח והייצור שלה. עובדים ומהנדסים נדרשו להרחיב את הידע שלהם ולהתאים את שיטות העבודה לתחום חדש. איזה שילוב מתאים להתמודדות עם שינוי כזה?",
    answerA: "התעלמות מהקושי של העובדים",
    answerB: "שילוב בין תמיכה לעובדים לבין יצירת מחויבות",
    answerC: "ביצוע שינוי ללא הסבר או הכנה",
    answerD: "שמירה מלאה על שיטות העבודה הישנות",
    correctAnswer: "B",
    explanation: "שינוי משמעותי דורש גם תמיכה מעשית וגם יצירת רצון ונכונות להשתנות.",
    difficulty: "Hard",
  },
]

async function main() {
  let added = 0
  for (const q of QUESTIONS) {
    const exists = await prisma.question.findFirst({
      where: { courseId: "course-orgs", topic: TOPIC, question: q.question },
    })
    if (!exists) {
      await prisma.question.create({
        data: { courseId: "course-orgs", topic: TOPIC, position: 5, sourceType: "Manual", ...q },
      })
      added++
    }
  }
  if (added > 0) console.log(`נוספו ${added} שאלות לקורס ארגונים (${TOPIC})`)
  else console.log(`${TOPIC} (2) כבר קיים, דילוג`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
