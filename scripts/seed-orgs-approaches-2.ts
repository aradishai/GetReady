import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TOPIC = "גישות להבנת ארגונים"

const QUESTIONS = [
  {
    question: "חוקר ארגונים בוחן מדוע עובדים בחברת הייטק מסוימת מרגישים מחויבות גבוהה יותר לאחר שהוקם צוות עבודה חדש. הוא מנתח את היחסים בין חברי הצוות, את שיתוף הפעולה ביניהם ואת האופן שבו הם משפיעים זה על זה. באיזו רמה ארגונית מתמקד החוקר?",
    answerA: "רמת המאקרו העוסקת בקשרי הארגון עם הסביבה",
    answerB: "רמת המסו העוסקת בקשרים בין אנשים בתוך הארגון",
    answerC: "רמת המיקרו העוסקת במאפיינים אישיים של עובדים",
    answerD: "רמת המאקרו העוסקת במבנה הארגון כולו",
    correctAnswer: "B",
    explanation: "רמת המסו מתמקדת ביחסים ובקשרים בין אנשים וקבוצות בתוך הארגון. היא נמצאת בין רמת הפרט (מיקרו) לבין הסתכלות רחבה על הארגון והסביבה (מאקרו).",
    difficulty: "Hard",
  },
  {
    question: "חוקר בוחן כיצד חברת תעופה מושפעת משינויים במחירי הדלק, מתקנות ממשלתיות ומפעילות של חברות מתחרות בשוק הבינלאומי. באיזו רמת ניתוח מתמקד החוקר?",
    answerA: "רמת המיקרו המתמקדת בהתנהגות עובדים",
    answerB: "רמת המסו המתמקדת ביחסים בין מחלקות",
    answerC: "רמת המאקרו המתמקדת ביחסי הארגון עם סביבתו",
    answerD: "רמת המיקרו המתמקדת במוטיבציה אישית",
    correctAnswer: "C",
    explanation: "רמת המאקרו מסתכלת על הארגון כמערכת רחבה ועל הקשרים שלו עם הסביבה החיצונית. בקורס מתבוננים בארגונים בעיקר מנקודת מבט זו.",
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
        data: { courseId: "course-orgs", topic: TOPIC, position: 1, sourceType: "Manual", ...q },
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
