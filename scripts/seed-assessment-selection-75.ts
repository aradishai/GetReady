import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const QUESTIONS = [
  {
    question: "איזה מכלי המיון הבאים מבוסס על הצגת גירוי עמום שהנבדק מתבקש לפרש?",
    answerA: "מבחן Big Five",
    answerB: "מבחן TAT",
    answerC: "מבחן וקסלר",
    answerD: "מבחן MMPI",
    correctAnswer: "B",
    explanation: "במבחנים השלכתיים מוצג לנבדק גירוי עמום ורב־משמעי, וההנחה היא שהאופן שבו יפרש אותו ישקף את עולמו הפנימי. מבחן TAT הוא דוגמה למבחן מסוג זה.",
    topic: "מבחני מיון",
    difficulty: "Hard",
  },
  {
    question: "איזה מכלי המיון הבאים נועד בעיקר למדוד יכולות חשיבה, פתרון בעיות ולמידה?",
    answerA: "MMPI",
    answerB: "מבחנים קוגניטיביים",
    answerC: "TAT",
    answerD: "Big Five",
    correctAnswer: "B",
    explanation: "מבחנים קוגניטיביים נועדו להעריך יכולות שכליות כגון פתרון בעיות, הסקת מסקנות ולמידת מידע חדש. יכולות אלו משמשות בין היתר לניבוי ביצועים בעבודה.",
    topic: "מבחני מיון",
    difficulty: "Medium",
  },
  {
    question: "איזה מכלי המיון הבאים פותח במקור לצורך אבחון וזיהוי מחלות נפש?",
    answerA: "Big Five",
    answerB: "MMPI",
    answerC: "TAT",
    answerD: "מבחן רייבן",
    correctAnswer: "B",
    explanation: "מבחן MMPI פותח במקור לצורך אבחון מחלות נפש באמצעות השוואה בין אנשים שאובחנו לבין כאלה שלא אובחנו. רק בהמשך נבחן גם השימוש בו בהקשרים תעסוקתיים.",
    topic: "מבחני מיון",
    difficulty: "Hard",
  },
  {
    question: "באיזה מכלי המיון הבאים הנבדק מתבקש בדרך כלל לדרג או לסמן היגדים המתארים את עצמו?",
    answerA: "מבחנים קוגניטיביים",
    answerB: "מבחני אישיות",
    answerC: "מבחנים השלכתיים",
    answerD: "מרכז הערכה",
    correctAnswer: "B",
    explanation: "מבחני אישיות מבוססים בדרך כלל על דיווח עצמי, שבו הנבדק משיב על היגדים המתארים את התנהגותו או את מאפייניו האישיים. לדוגמה, שאלון Big Five כולל היגדים שעליהם הנבדק מתבקש להשיב.",
    topic: "מבחני מיון",
    difficulty: "Hard",
  },
  {
    question: "מאבחנת מעוניינת ללמוד על יכולות החשיבה של מועמד, על מאפייני אישיותו ועל מניעיו הלא־מודעים. איזו התאמה בין כלי המיון לבין סוג המידע שהוא מספק היא המדויקת ביותר?",
    answerA: "מבחנים קוגניטיביים – מניעים לא־מודעים | מבחני אישיות – יכולות חשיבה | מבחנים השלכתיים – תכונות אישיות",
    answerB: "מבחנים קוגניטיביים – יכולות חשיבה | מבחני אישיות – מאפייני אישיות | מבחנים השלכתיים – מניעים ועולם פנימי",
    answerC: "מבחנים קוגניטיביים – תכונות אישיות | מבחני אישיות – מניעים לא־מודעים | מבחנים השלכתיים – יכולות חשיבה",
    answerD: "מבחנים קוגניטיביים – עולם פנימי | מבחני אישיות – יכולות חשיבה | מבחנים השלכתיים – תפקוד בעבודה",
    correctAnswer: "B",
    explanation: "כל אחד מכלי המיון מיועד לאיסוף סוג שונה של מידע. מבחנים קוגניטיביים בוחנים יכולות חשיבה, מבחני אישיות מבוססי דיווח עצמי מעריכים מאפייני אישיות, ואילו מבחנים השלכתיים נועדו להפיק מידע על מניעים, צרכים ועולמו הפנימי של הנבדק באמצעות פרשנות של גירויים עמומים.",
    topic: "מבחני מיון",
    difficulty: "Hard",
  },
]

async function main() {
  const existing = await prisma.question.count({
    where: { courseId: "course-assessment", position: 75 },
  })

  if (existing > 0) {
    console.log("Assessment selection-75 questions already seeded, skipping")
    return
  }

  let added = 0
  for (const q of QUESTIONS) {
    await prisma.question.create({
      data: { courseId: "course-assessment", ...q, position: 75, sourceType: "Uploaded" },
    })
    added++
  }

  console.log(`Added ${added} new questions to course-assessment (מבחני מיון, position 75)`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
