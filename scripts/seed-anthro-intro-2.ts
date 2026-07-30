import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! })
const prisma = new PrismaClient({ adapter })

const TOPIC = "מבוא"

const QUESTIONS = [
  {
    question: "כאשר אנתרופולוג מגיע לחברה שאינו מכיר, מהי מטרת המחקר הרחבה שלו?",
    answerA: "לתאר את המבנה החברתי בלבד",
    answerB: "להבין את התרבות כמכלול",
    answerC: "להשוות אותה לחברות אחרות",
    answerD: "לזהות את מקור המסורות",
    correctAnswer: "B",
    explanation: "האנתרופולוג אינו מנסה להבין רק התנהגויות, מוסדות או אמונות בנפרד, אלא את התרבות והחיים החברתיים כמכלול רחב ומורכב.",
    difficulty: "Easy",
  },
  {
    question: "איזו שאלה עומדת בבסיס המבוא לקורס באנתרופולוגיה?",
    answerA: "כיצד חברות משתנות לאורך הזמן",
    answerB: "מה האנתרופולוג מנסה להבין כשמגיע לחברה",
    answerC: "כיצד מוסדות פועלים בחברה",
    answerD: "מדוע תרבויות שונות זו מזו",
    correctAnswer: "B",
    explanation: "המבוא נפתח בשאלה היסודית: כאשר אנתרופולוג מגיע לחברה מסוימת, מה בדיוק הוא מנסה להבין? שאלה זו מניחה את התשתית לכל הגישות שיוצגו בהמשך הקורס.",
    difficulty: "Easy",
  },
  {
    question: "מה הייתה מטרתו המרכזית של הניסיון המדעי הקלאסי באנתרופולוגיה?",
    answerA: "לפרש את משמעות הסמלים בתרבות",
    answerB: "להבין באופן שיטתי כיצד החברה מאורגנת",
    answerC: "לתאר את רגשותיהם של בני התרבות",
    answerD: "לבחון כיצד אנשים מפרשים את עולמם",
    correctAnswer: "B",
    explanation: "האנתרופולוגיה הקלאסית ביקשה להבין את החברה באמצעות מיפוי שיטתי של מוסדותיה, כלליה ודפוסי הארגון שלה, בדומה לגישה המדעית שרווחה באותה תקופה.",
    difficulty: "Easy",
  },
  {
    question: "על איזו הנחת יסוד התבסס המחקר האנתרופולוגי הקלאסי?",
    answerA: "כל תרבות מחייבת פרשנות ייחודית",
    answerB: "ניתן להבין חברה באמצעות תצפית והשוואה",
    answerC: "רק המשתתפים יכולים להסביר את תרבותם",
    answerD: "משמעות חשובה יותר ממבנה חברתי",
    correctAnswer: "B",
    explanation: "החוקרים הקלאסיים הניחו שניתן להגיע להבנה יחסית אובייקטיבית של החברה באמצעות תצפית שיטתית והשוואה בין חברות שונות.",
    difficulty: "Easy",
  },
  {
    question: "אילו תחומים עמדו במרכז המיפוי של האנתרופולוגיה הקלאסית?",
    answerA: "רגשות, תפיסות ומשמעויות",
    answerB: "משפחה, פוליטיקה, דת וכלכלה",
    answerC: "שפה, ספרות, מוזיקה ואמנות",
    answerD: "אישיות, מוטיבציה, זהות ורגש",
    correctAnswer: "B",
    explanation: "החוקרים הראשונים עסקו במיפוי מערכות הקרבה והמשפחה, המוסדות הפוליטיים, הטקסים הדתיים והמערכות הכלכליות כדי להבין כיצד החברה מאורגנת.",
    difficulty: "Easy",
  },
  {
    question: "חוקרת מתעדת במשך חודשים את מבנה המשפחה, שיטת ההורשה והמנהיגות בכפר. איזו גישה משתקפת בעיקר במחקרה?",
    answerA: "גישה המתמקדת בפרשנות סמלים",
    answerB: "גישה המתמקדת במבנים חברתיים",
    answerC: "גישה המתמקדת במשמעות אישית",
    answerD: "גישה המתמקדת בחוויית המשתתפים",
    correctAnswer: "B",
    explanation: "המחקר מתמקד במוסדות ובמבנים של החברה — משפחה, הורשה ומנהיגות — ולכן הוא משקף את נקודת המבט של האנתרופולוגיה הקלאסית.",
    difficulty: "Medium",
  },
  {
    question: "מדוע השתמשו האנתרופולוגים הקלאסיים בהשוואה בין חברות?",
    answerA: "כדי לזהות את משמעות הסמלים בכל חברה",
    answerB: "כדי להבין דפוסים חברתיים באופן שיטתי",
    answerC: "כדי להעדיף תרבות אחת על פני אחרת",
    answerD: "כדי למצוא את התרבות העתיקה ביותר",
    correctAnswer: "B",
    explanation: "ההשוואה בין חברות הייתה כלי מרכזי בניסיון לזהות דפוסים קבועים ולהבין כיצד חברות מאורגנות בצורה שיטתית.",
    difficulty: "Easy",
  },
  {
    question: "אנתרופולוג מתאר מי משתתף בטקס, מי מנהל אותו, כיצד מתקבלות ההחלטות ואילו כללים מסדירים את האירוע. איזו שאלה עדיין אינה מקבלת מענה?",
    answerA: "כיצד בנוי הטקס מבחינה ארגונית",
    answerB: "איזו משמעות מייחסים המשתתפים לטקס",
    answerC: "אילו מוסדות מעורבים בקיום הטקס",
    answerD: "כיצד נשמר הסדר החברתי בטקס",
    correctAnswer: "B",
    explanation: "החוקר תיאר את המבנה הארגוני של הטקס, אך עדיין לא בחן כיצד המשתתפים עצמם מפרשים את מעשיהם ומהי משמעות הטקס עבורם. בדיוק פער זה הוביל להתפתחות הגישה הפרשנית.",
    difficulty: "Medium",
  },
]

async function main() {
  let added = 0
  for (const q of QUESTIONS) {
    const exists = await prisma.question.findFirst({
      where: { courseId: "course-anthro", topic: TOPIC, question: q.question },
    })
    if (!exists) {
      await prisma.question.create({
        data: { courseId: "course-anthro", topic: TOPIC, position: 0, sourceType: "Manual", isActive: true, ...q },
      })
      added++
    }
  }
  if (added > 0) console.log(`נוספו ${added} שאלות לקורס אנתרופולוגיה (${TOPIC})`)
  else console.log(`${TOPIC} כבר קיים, דילוג`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
