CREATE TABLE "answers"
(
  "id" SERIAL PRIMARY KEY,
  "answer" TEXT NOT NULL,
  "question_id" INTEGER REFERENCES "questions"(id)
    ON DELETE CASCADE NOT NULL
)