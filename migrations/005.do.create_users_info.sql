CREATE TABLE "users_info"
(
  "id" SERIAL PRIMARY KEY,
  "birthdate" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "nationality" TEXT NOT NULL,
  "gender" TEXT NOT NULL,
  "college_graduate" TEXT NOT NULL ,
  "user_id" INTEGER REFERENCES "users"(id)
    ON DELETE CASCADE NOT NULL
);