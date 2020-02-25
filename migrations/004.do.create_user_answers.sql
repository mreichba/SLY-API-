CREATE TABLE "user_answers" (
  "id" SERIAL PRIMARY KEY,
  "answer_id" INTEGER REFERENCES "answers"(id)
    ON DELETE CASCADE NOT NULL,
  "question_id" INTEGER REFERENCES "questions"(id)
    ON DELETE CASCADE NOT NULL,
  "user_id" INTEGER REFERENCES "users"(id)
    ON DELETE CASCADE NOT NULL
);