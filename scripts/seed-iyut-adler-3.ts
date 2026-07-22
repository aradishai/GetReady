import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TOPIC = "אדלר"

const QUESTIONS = [
  {
    question: "ילד בן תשע מתאמץ כל הזמן לעקוף את הישגי אחיו הבכור. הוא משווה את עצמו אליו, מתחרה בו ומנסה להוכיח שהוא מסוגל להגיע לאותן הצלחות. לפי אדלר, איזו השפעה של סדר הלידה באה לידי ביטוי?",
    answerA: "הילד היחיד מתקשה לחלוק תשומת לב",
    answerB: "הילד השני נוטה להתחרות באח הבכור",
    answerC: "הילד הצעיר מחפש להגן על מעמדו במשפחה",
    answerD: "הילד הבכור מתקשה לוותר על אחריותו",
    explanation: "אדלר תיאר את הילד השני כמי שנולד לעולם שבו כבר יש \"מתחרה\" לפניו, ולכן הוא נוטה להשוות את עצמו לאח הבכור ולנסות להשיגו.",
  },
  {
    question: "ילדה צעירה נהנית מיחס מיוחד בבית, אך לעיתים מתייאשת כאשר היא משווה את יכולותיה לאחיה הגדולים והמנוסים ממנה. לפי אדלר, איזה מאפיין של סדר הלידה מתואר כאן?",
    answerA: "מאפייני הילד הבכור",
    answerB: "מאפייני הילד הצעיר",
    answerC: "מאפייני הילד היחיד",
    answerD: "מאפייני הילד השני",
    explanation: "הילד הצעיר נהנה ממעמד מיוחד במשפחה, אך עשוי לחוש ייאוש כאשר הוא משווה את עצמו לאחיו המיומנים ממנו.",
  },
  {
    question: "ילד שגדל ללא אחים רגיל להיות במרכז תשומת הלב. כאשר החל ללמוד בבית הספר התקשה לקבל מצבים שבהם אינו זוכה ליחס מיוחד. לפי אדלר, איזה מאפיין של סדר הלידה בא לידי ביטוי?",
    answerA: "מאפייני הילד הבכור",
    answerB: "מאפייני הילד היחיד",
    answerC: "מאפייני הילד השני",
    answerD: "מאפייני הילד הצעיר",
    explanation: "אדלר תיאר את הילד היחיד כמי שרגיל להיות מרכז תשומת הלב ועלול להתקשות כאשר הסביבה אינה מתנהלת בהתאם לציפיותיו.",
  },
  {
    question: "איזה מארבעת סגנונות החיים של אדלר נחשב לבריא והמסתגל ביותר?",
    answerA: "הדומיננטי",
    answerB: "היעיל חברתית",
    answerC: "המקבל",
    answerD: "המונע",
    explanation: "אדלר תיאר ארבעה סגנונות חיים, כאשר הסגנון היעיל חברתית הוא המסתגל ביותר משום שהוא משלב התקדמות אישית עם שיתוף פעולה ותרומה לאחרים.",
  },
  {
    question: "איזו קביעה מתארת בצורה המדויקת ביותר את עקרון ההוליזם אצל אדלר?",
    answerA: "האישיות מורכבת ממספר מערכות הפועלות בנפרד",
    answerB: "יש להבין את האדם כיחידה שלמה שאינה ניתנת לחלוקה",
    answerC: "התנהגות האדם מוסברת בעיקר באמצעות דחפים לא־מודעים",
    answerD: "כל תחום באישיות מתפתח באופן בלתי תלוי בשאר התחומים",
    explanation: "אדלר ראה את האדם כיחידה שלמה (הוליזם), ולכן אין להבין את האישיות באמצעות פירוק למרכיבים נפרדים אלא כמכלול אחד.",
  },
]

async function main() {
  const existing = await prisma.question.findFirst({
    where: { courseId: "course-iyut", topic: TOPIC, question: QUESTIONS[0].question },
  })

  if (existing) {
    console.log(`${TOPIC} part 3 already seeded, skipping`)
    return
  }

  let added = 0
  for (const q of QUESTIONS) {
    await prisma.question.create({
      data: { courseId: "course-iyut", topic: TOPIC, position: 6, sourceType: "Manual", correctAnswer: "B", difficulty: "Hard", ...q },
    })
    added++
  }

  console.log(`נוספו ${added} שאלות לקורס אישיות (${TOPIC} part 3)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
