import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TOPIC = "הורני"

const QUESTIONS = [
  {
    question: "איזו קביעה מתארת בצורה המדויקת ביותר את הצורך הנוירוטי לפי הורני?",
    answerA: "הוא מבטא בעיקר דחפים ביולוגיים שאינם נשלטים",
    answerB: "הוא נוקשה, מתעלם מהמציאות ומעורר חרדה",
    answerC: "הוא מתפתח רק בעקבות אירועי חיים טראומטיים",
    answerD: "הוא מאפיין בעיקר אנשים עם הפרעות אישיות",
    explanation: "צורך נוירוטי מאופיין בנוקשות, התעלמות ממגבלות המציאות וחרדה כאשר אינו מסופק.",
  },
  {
    question: "ילד הגדל בתחושת חוסר ביטחון מנסה להפחית את חרדתו באמצעות חיפוש אהבה, כניעה לאחרים, השגת כוח או התרחקות מהם. כיצד תיארה הורני דפוסי תגובה אלה?",
    answerA: "שלבי התפתחות המופיעים לאורך הילדות המוקדמת",
    answerB: "דרכי התגוננות מפני החרדה הבסיסית המתפתחת",
    answerC: "מנגנוני הסתגלות של האגו מול דרישות המציאות",
    answerD: "מבני אישיות המתגבשים בשלבי ההתפתחות השונים",
    explanation: "הורני תיארה ארבע דרכי התגוננות מוקדמות מפני החרדה הבסיסית: הבטחת אהבה, כניעות, השגת כוח ונסיגה.",
  },
  {
    question: "איזו התאמה בין צורך נוירוטי לבין אחת האוריינטציות של הורני היא המדויקת ביותר?",
    answerA: "צורך בשלמות ובחסינות מפגיעה — תנועה נגד אנשים",
    answerB: "צורך בשותף שיגן וידאג — תנועה לקראת אנשים",
    answerC: "צורך בכוח ובהישגים אישיים — התרחקות מאנשים",
    answerD: "צורך בעצמאות מוחלטת — תנועה לקראת אנשים",
    explanation: "הצורך במישהו שיגן על האדם וידאג לו משתייך לאוריינטציה של תנועה לקראת אנשים.",
  },
  {
    question: "לפי הורני, איזה מושג מתאר את מקור הפוטנציאל להתפתחות ולמימוש של האדם?",
    answerA: "העצמי הממשי כפי שהוא נתפס כיום",
    answerB: "העצמי האמיתי כמקור ההתפתחות האישית",
    answerC: "העצמי האידיאלי שאליו האדם שואף תמיד",
    answerD: "העצמי החברתי כפי שהוא נתפס בידי אחרים",
    explanation: "העצמי האמיתי מייצג את הפוטנציאל הפנימי של האדם ואת הכיוון הטבעי להתפתחותו.",
  },
  {
    question: "איזו ביקורת על התאוריה של הורני מתוארת בצורה המדויקת ביותר?",
    answerA: "היא העניקה משקל מועט מדי להשפעת הסביבה החברתית",
    answerB: "היא התמקדה בנוירוזה ונשענה בעיקר על ניסיון קליני",
    answerC: "היא הדגישה בעיקר תורשה וממצאים ממחקרי תאומים",
    answerD: "היא כמעט שלא עסקה במבנה האישיות ובהתפתחותה",
    explanation: "אחת הביקורות המרכזיות היא שהתאוריה התמקדה באישיות הנוירוטית ונשענה במידה רבה על תצפיות קליניות ולא על מחקר אמפירי.",
  },
]

async function main() {
  let added = 0
  for (const q of QUESTIONS) {
    const exists = await prisma.question.findFirst({
      where: { courseId: "course-iyut", topic: TOPIC, question: q.question },
    })
    if (!exists) {
      await prisma.question.create({
        data: { courseId: "course-iyut", topic: TOPIC, position: 3, sourceType: "Manual", correctAnswer: "B", difficulty: "Hard", ...q },
      })
      added++
    }
  }
  if (added > 0) console.log(`נוספו ${added} שאלות לקורס אישיות (${TOPIC} part 2)`)
  else console.log(`${TOPIC} כבר קיים, דילוג`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
