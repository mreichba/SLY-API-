CREATE TABLE "questions" (
  "id" SERIAL PRIMARY KEY,
  "question" TEXT NOT NULL,
  "topic" TEXT NOT NULL,
  "answered" INTEGER DEFAULT 0
);