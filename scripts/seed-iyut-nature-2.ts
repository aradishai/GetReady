import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TOPIC = "טבע האדם"

const QUESTIONS = [
  {
    question: "מטפל טוען שכדי להבין את האדם יש להתמקד באופן שבו הוא חווה ומפרש את המציאות, גם אם פרשנותו שונה מן העובדות האובייקטיביות. לאיזה קוטב ברצף מתאימה גישה זו?",
    answerA: "אובייקטיביות",
    answerB: "סובייקטיביות",
    answerC: "דטרמיניזם",
    answerD: "חלקיות",
    explanation: "הקוטב הסובייקטיבי מדגיש שהחוויה והפרשנות האישית של האדם הן שמעצבות את התנהגותו.",
  },
  {
    question: "איזה רצף בוחן האם התנהגות האדם מוסברת בעיקר באמצעות עולמו הפנימי והאופן שבו הוא מפרש את המציאות, או באמצעות גורמים חיצוניים הניתנים לתצפית?",
    answerA: "חופש לעומת דטרמיניזם",
    answerB: "סובייקטיביות לעומת אובייקטיביות",
    answerC: "הומאוסטזיס לעומת הטרוסטזיס",
    answerD: "אוניברסליות לעומת ייחודיות",
    explanation: "רצף זה עוסק בשאלה האם הדגש הוא על עולמו הפנימי והחוויה האישית של האדם או על גורמים אובייקטיביים וחיצוניים.",
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
        data: { courseId: "course-iyut", topic: TOPIC, position: 15, sourceType: "Manual", correctAnswer: "B", difficulty: "Hard", ...q },
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
