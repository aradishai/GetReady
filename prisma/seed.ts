import { PrismaClient } from "../src/generated/prisma/client"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import bcrypt from "bcryptjs"
import path from "path"

const dbPath = path.resolve(process.cwd(), "prisma/dev.db")
const adapter = new PrismaBetterSqlite3({ url: dbPath })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("🌱 Seeding database...")

  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
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
  console.log("✅ Admin user created:", admin.email)

  const studentPassword = await bcrypt.hash("student123", 12)
  const student = await prisma.user.upsert({
    where: { email: "student@demo.com" },
    update: {},
    create: {
      name: "סטודנט דמו",
      email: "student@demo.com",
      password: studentPassword,
      isPaid: true,
      xp: 350,
      level: 1,
      coins: 120,
      totalPoints: 85,
      streak: 3,
    },
  })
  console.log("✅ Demo student created:", student.email)

  const course = await prisma.course.upsert({
    where: { id: "demo-course-1" },
    update: {},
    create: {
      id: "demo-course-1",
      name: "מבוא לפסיכולוגיה",
      description: "קורס מבוא לפסיכולוגיה — כל הנושאים הבסיסיים למבחן",
      price: 30,
      isActive: true,
    },
  })
  console.log("✅ Demo course created:", course.name)

  const questions = [
    { question: "מי נחשב לאבי הפסיכולוגיה המודרנית?", answerA: "זיגמונד פרויד", answerB: "וילהלם וונדט", answerC: "וויליאם ג'יימס", answerD: "אייבן פבלוב", correctAnswer: "B", explanation: "וילהלם וונדט הקים את מעבדת הפסיכולוגיה הראשונה בלייפציג ב-1879 ונחשב לאבי הפסיכולוגיה הניסויית.", topic: "היסטוריה", difficulty: "Easy", sourceType: "Generated", examYear: null },
    { question: "איזה חוקר חיבר את הספר 'עקרונות הפסיכולוגיה'?", answerA: "סיגמונד פרויד", answerB: "ג'ון ווטסון", answerC: "וויליאם ג'יימס", answerD: "קרל יונג", correctAnswer: "C", explanation: "וויליאם ג'יימס כתב את 'עקרונות הפסיכולוגיה' (1890).", topic: "היסטוריה", difficulty: "Medium", sourceType: "PreviousExam", examYear: "2024A" },
    { question: "מה מתאר 'ניסוי הכלב' של פבלוב?", answerA: "למידה קוגניטיבית", answerB: "התניה קלאסית", answerC: "התניה אופרנטית", answerD: "למידה חברתית", correctAnswer: "B", explanation: "פבלוב הדגים התניה קלאסית — כלב למד לרייר לצליל פעמון לאחר שהצליל שויך עם אוכל.", topic: "למידה", difficulty: "Easy", sourceType: "Generated", examYear: null },
    { question: "מה ההבדל בין חיזוק חיובי לחיזוק שלילי?", answerA: "חיזוק חיובי מגדיל התנהגות, שלילי מקטין אותה", answerB: "שניהם מגדילים התנהגות — חיובי מוסיף גירוי, שלילי מסיר גירוי", answerC: "חיזוק שלילי הוא עונש", answerD: "אין הבדל מעשי ביניהם", correctAnswer: "B", explanation: "שני סוגי החיזוק מגדילים את ההסתברות להתנהגות. חיובי מוסיף גירוי נעים, שלילי מסיר גירוי לא נעים.", topic: "למידה", difficulty: "Medium", sourceType: "PreviousExam", examYear: "2024B" },
    { question: "מה היא אזור ההתפתחות הקרובה לפי ויגוצקי?", answerA: "ילדים לומדים רק מאנשים בוגרים", answerB: "תחום משימות שילד יכול לבצע עם עזרת מבוגר", answerC: "ילדים לומדים מהר יותר מבוגרים", answerD: "למידה חברתית אינה אפשרית לפני גיל 7", correctAnswer: "B", explanation: "ZPD — אזור ההתפתחות הקרובה — תחום שבו ילד יכול להצליח בעזרת מדריך מוסמך.", topic: "התפתחות", difficulty: "Hard", sourceType: "LecturerQuestion", examYear: null },
    { question: "מהי 'שכחה' לפי עקומת אייבינגהאוס?", answerA: "אובדן מלא של זיכרון", answerB: "ירידה מהירה בזיכרון עם הזמן", answerC: "מחיקה פעילה של זיכרונות", answerD: "הפרעה בקידוד הזיכרון", correctAnswer: "B", explanation: "אייבינגהאוס גילה שרוב השכחה מתרחשת מהר לאחר הלמידה, ואז מאטה — עקומת השכחה.", topic: "זיכרון", difficulty: "Medium", sourceType: "Generated", examYear: null },
    { question: "מה הם שלבי הזיכרון של אטקינסון ושיפרין?", answerA: "קידוד, אחסון, שליפה", answerB: "זיכרון חושי, קצר טווח, ארוך טווח", answerC: "תשומת לב, עיבוד, פלט", answerD: "אחסון, עיבוד, שליפה", correctAnswer: "B", explanation: "מודל אטקינסון-שיפרין: זיכרון חושי → קצר טווח → ארוך טווח.", topic: "זיכרון", difficulty: "Easy", sourceType: "PreviousExam", examYear: "2025A" },
    { question: "מה מאפיין זיכרון עבודה לפי בדלי?", answerA: "זיכרון לאחסון קבוע", answerB: "מערכת מרכזית המנהלת מספר רכיבים", answerC: "זיכרון חושי בלבד", answerD: "מאגר לזיכרונות רגשיים", correctAnswer: "B", explanation: "מודל בדלי: מנהל מרכזי, לולאה פונולוגית, לוח חזותי-מרחבי, מאגר אפיזודי.", topic: "זיכרון", difficulty: "Hard", sourceType: "Generated", examYear: null },
    { question: "מה היא 'התיאוריה הטריארכית' של שטרנברג?", answerA: "תיאוריה על אינטליגנציה עם שלושה רכיבים", answerB: "תיאוריה על שלושה שלבי התפתחות", answerC: "תיאוריה על שלושה סוגי אישיות", answerD: "תיאוריה על שלוש רמות תודעה", correctAnswer: "A", explanation: "שטרנברג: אינטליגנציה אנליטית, יצירתית ומעשית.", topic: "אינטליגנציה", difficulty: "Medium", sourceType: "LecturerQuestion", examYear: null },
    { question: "מהי 'אינטליגנציות מרובות' של גארדנר?", answerA: "אינטליגנציה אחת כללית", answerB: "מספר סוגי אינטליגנציה שונים ועצמאיים", answerC: "אינטליגנציה רגשית בלבד", answerD: "הבדלים מגדריים באינטליגנציה", correctAnswer: "B", explanation: "גארדנר: 8+ סוגי אינטליגנציה — לינגוויסטית, לוגית, מוזיקלית, מרחבית, גופנית ועוד.", topic: "אינטליגנציה", difficulty: "Easy", sourceType: "PreviousExam", examYear: "2024A" },
    { question: "מה מתאר 'פירמידת הצרכים' של מאסלו?", answerA: "ציר הזמן של התפתחות האדם", answerB: "היררכיה של צרכים מבסיסיים לצמיחה אישית", answerC: "מדרג של צרכים חברתיים", answerD: "שלבי אבל ואובדן", correctAnswer: "B", explanation: "מאסלו: צרכים בסיסיים (פיזיולוגיים, ביטחון) חייבים להתמלא לפני צרכים גבוהים יותר.", topic: "מוטיבציה", difficulty: "Easy", sourceType: "Generated", examYear: null },
    { question: "מה ההבדל בין מוטיבציה פנימית לחיצונית?", answerA: "פנימית קשורה לגוף, חיצונית לסביבה", answerB: "פנימית נובעת מעניין אישי, חיצונית מגמול חיצוני", answerC: "אין הבדל מעשי", answerD: "חיצונית תמיד יעילה יותר", correctAnswer: "B", explanation: "פנימית = הנאה ועניין. חיצונית = פרסים, ציונים, עונשים.", topic: "מוטיבציה", difficulty: "Easy", sourceType: "Generated", examYear: null },
    { question: "מהי 'תיאוריית הייחוס' של וינר?", answerA: "כיצד אנשים מסבירים הצלחות וכישלונות", answerB: "תיאוריה על אינטליגנציה", answerC: "מחקר על פחדים", answerD: "תיאוריה על רגשות", correctAnswer: "A", explanation: "וינר: אנשים מייחסים תוצאות לגורמים פנימיים/חיצוניים, יציבים/לא יציבים, נשלטים/לא.", topic: "מוטיבציה", difficulty: "Hard", sourceType: "PreviousExam", examYear: "2024B" },
    { question: "איזו תיאוריה מציעה שרגש נגרם מפרשנות קוגניטיבית של עוררות?", answerA: "ג'יימס-לאנגה", answerB: "קנון-בארד", answerC: "שכטר-סינגר", answerD: "לאזרוס", correctAnswer: "C", explanation: "שכטר-סינגר: רגש = עוררות פיזיולוגית + תיוג קוגניטיבי של הסיטואציה.", topic: "רגשות", difficulty: "Hard", sourceType: "PreviousExam", examYear: "2025A" },
    { question: "מה הוא 'אפקט ראשוניות'?", answerA: "נטיה לזכור פריטים אחרונים", answerB: "נטיה לזכור פריטים ראשונים ברשימה", answerC: "שכחה של פריטים אמצעיים", answerD: "השפעת ציפיות על הזיכרון", correctAnswer: "B", explanation: "פריטים ראשונים נזכרים טוב כי עברו לזיכרון ארוך טווח.", topic: "זיכרון", difficulty: "Medium", sourceType: "Generated", examYear: null },
    { question: "מה הוא 'אפקט עדכניות'?", answerA: "נטיה לזכור פריטים ראשונים", answerB: "נטיה לזכור פריטים אחרונים ברשימה", answerC: "הטיית זיכרון לאנשים מפורסמים", answerD: "זיכרון טוב לאירועים עדכניים", correctAnswer: "B", explanation: "פריטים אחרונים נזכרים טוב כי הם עדיין בזיכרון העבודה.", topic: "זיכרון", difficulty: "Medium", sourceType: "Generated", examYear: null },
    { question: "מה מציעה תיאוריית ההתפתחות הקוגניטיבית של פיאז'ה?", answerA: "ילדים לומדים רק דרך חיקוי", answerB: "התפתחות קוגניטיבית מתרחשת בשלבים סדורים", answerC: "אינטליגנציה קבועה מלידה", answerD: "ילדים מחשיבים כמו מבוגרים קטנים", correctAnswer: "B", explanation: "פיאז'ה: 4 שלבים — חושי-מוטורי, קדם-אופרציונלי, אופרציות קונקרטיות, אופרציות פורמליות.", topic: "התפתחות", difficulty: "Easy", sourceType: "Generated", examYear: null },
    { question: "מה מאפיין שלב 'הפעולות הפורמליות' אצל פיאז'ה?", answerA: "חשיבה קונקרטית בלבד", answerB: "חשיבה מופשטת והיפותטית", answerC: "אגוצנטריות", answerD: "חשיבה חושית-מוטורית", correctAnswer: "B", explanation: "שלב הפעולות הפורמליות (12+): חשיבה מופשטת, לוגיקה דדוקטיבית, פתרון בעיות היפותטיות.", topic: "התפתחות", difficulty: "Medium", sourceType: "PreviousExam", examYear: "2024A" },
    { question: "מה מתאר 'תיאוריית ההתקשרות' של בולבי?", answerA: "קשרים חברתיים בבגרות", answerB: "הצורך הביולוגי של תינוקות ביצירת קשר רגשי עם מטפל", answerC: "תיאוריה על ידידות", answerD: "התפתחות שפה", correctAnswer: "B", explanation: "בולבי: התקשרות לדמות מטפלת היא צורך ביולוגי בסיסי המשפיע על בריאות נפשית לאורך החיים.", topic: "התפתחות", difficulty: "Medium", sourceType: "LecturerQuestion", examYear: null },
    { question: "מהו ה-DSM?", answerA: "מדריך לטיפול בדיכאון", answerB: "מדריך האבחון והסטטיסטיקה של הפרעות נפשיות", answerC: "מבחן אינטליגנציה", answerD: "שיטת פסיכותרפיה", correctAnswer: "B", explanation: "DSM — Diagnostic and Statistical Manual — המדריך האמריקאי לאבחון הפרעות נפשיות.", topic: "פסיכופתולוגיה", difficulty: "Easy", sourceType: "Generated", examYear: null },
    { question: "מה מאפיין הפרעת חרדה כללית (GAD)?", answerA: "חרדה ממצבים חברתיים בלבד", answerB: "חרדה מוגזמת וקבועה לגבי נושאים שונים", answerC: "התקפי פאניקה חוזרים", answerD: "פחד ספציפי מאובייקט", correctAnswer: "B", explanation: "GAD: דאגה מוגזמת ובלתי נשלטת ביומיום, נמשכת לפחות 6 חודשים.", topic: "פסיכופתולוגיה", difficulty: "Medium", sourceType: "PreviousExam", examYear: "2024B" },
    { question: "מה מגדיר דיכאון קליני לפי DSM?", answerA: "אין הבדל מעצב נורמלי", answerB: "2+ שבועות, 5+ תסמינים, פגיעה בתפקוד", answerC: "עצב נמשך יותר זמן", answerD: "תמיד כולל מחשבות אובדניות", correctAnswer: "B", explanation: "DSM: דיכאון קליני = לפחות שבועיים עם 5+ תסמינים הפוגעים בתפקוד.", topic: "פסיכופתולוגיה", difficulty: "Medium", sourceType: "Generated", examYear: null },
    { question: "מה מאפיין 'תיאוריית ה-ABC' של אלברט אליס?", answerA: "שלבי התפתחות ילדים", answerB: "מחשבות לא-רציונליות גורמות לרגשות ולהתנהגויות בעייתיות", answerC: "תיאוריה על סוגי אישיות", answerD: "מודל לטיפול בפוביות", correctAnswer: "B", explanation: "A=אירוע, B=אמונה, C=תוצאה רגשית. REBT מתמקדת בשינוי אמונות לא-רציונליות.", topic: "טיפול", difficulty: "Hard", sourceType: "PreviousExam", examYear: "2025A" },
    { question: "מה היא CBT?", answerA: "תרפיה קוגניטיבית-התנהגותית", answerB: "תרפיה ביולוגית-כימית", answerC: "תרפיה מרכזית-ביהביוריסטית", answerD: "ניתוח קוגניטיבי-מוחי", correctAnswer: "A", explanation: "CBT — Cognitive Behavioral Therapy — שיטת טיפול הממוקדת בשינוי מחשבות ודפוסי התנהגות.", topic: "טיפול", difficulty: "Easy", sourceType: "Generated", examYear: null },
    { question: "מה ה'אפקט פלצבו' בפסיכולוגיה?", answerA: "כאשר טיפול אמיתי לא עובד", answerB: "שיפור בתסמינים עקב ציפייה חיובית בלבד", answerC: "תגובה שלילית לתרופה", answerD: "השפעת הרופא על המטופל", correctAnswer: "B", explanation: "פלצבו: שיפור רק בגלל ציפייה לשיפור, ולא בגלל הטיפול עצמו.", topic: "מחקר", difficulty: "Medium", sourceType: "Generated", examYear: null },
  ]

  let created = 0
  for (const q of questions) {
    const existing = await prisma.question.findFirst({
      where: { question: q.question, courseId: course.id },
    })
    if (!existing) {
      await prisma.question.create({ data: { ...q, courseId: course.id } })
      created++
    }
  }

  console.log(`✅ Created ${created} questions`)
  console.log("\n🎉 Seed complete!")
  console.log("  Admin:   admin@studyarena.com / admin123")
  console.log("  Student: student@demo.com / student123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
