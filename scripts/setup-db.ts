import Database from "better-sqlite3"
import path from "path"

const dbPath = path.resolve(process.cwd(), "prisma/dev.db")
const db = new Database(dbPath)

db.pragma("journal_mode = WAL")
db.pragma("foreign_keys = ON")

db.exec(`
CREATE TABLE IF NOT EXISTS "User" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "profileImage" TEXT,
  "isAdmin" INTEGER NOT NULL DEFAULT 0,
  "isPaid" INTEGER NOT NULL DEFAULT 0,
  "xp" INTEGER NOT NULL DEFAULT 0,
  "level" INTEGER NOT NULL DEFAULT 1,
  "coins" INTEGER NOT NULL DEFAULT 0,
  "totalPoints" INTEGER NOT NULL DEFAULT 0,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "lastStudyDate" DATETIME,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Course" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "price" REAL NOT NULL DEFAULT 30,
  "image" TEXT,
  "isActive" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "UserCourse" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "enrolledAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "courseId"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Question" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "courseId" TEXT NOT NULL,
  "question" TEXT NOT NULL,
  "answerA" TEXT NOT NULL,
  "answerB" TEXT NOT NULL,
  "answerC" TEXT NOT NULL,
  "answerD" TEXT NOT NULL,
  "correctAnswer" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "difficulty" TEXT NOT NULL DEFAULT 'Medium',
  "sourceType" TEXT NOT NULL DEFAULT 'Generated',
  "examYear" TEXT,
  "isActive" INTEGER NOT NULL DEFAULT 1,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "TestResult" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "score" REAL NOT NULL,
  "totalQuestions" INTEGER NOT NULL,
  "correctAnswers" INTEGER NOT NULL,
  "timeSpent" INTEGER,
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
  FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "TestAnswer" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "testResultId" TEXT NOT NULL,
  "questionId" TEXT NOT NULL,
  "userAnswer" TEXT NOT NULL,
  "isCorrect" INTEGER NOT NULL,
  "timeSpent" INTEGER,
  FOREIGN KEY ("testResultId") REFERENCES "TestResult"("id") ON DELETE CASCADE,
  FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "UserAchievement" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "unlockedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("userId", "type"),
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "PaymentRequest" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "courseId" TEXT,
  "fullName" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "lastFourDigits" TEXT NOT NULL,
  "note" TEXT,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);
`)

console.log("✅ Database tables created at:", dbPath)
db.close()
