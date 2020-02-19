const express = require('express');

const UserAnswersService = require('./UserAnswersService');
const { requireAuth } = require('../../Middleware/JWT');

// Creates a new router for the endpoint
const userAnswersRouter = express.Router();

// Creates the body parser for the post user answers endpoint
const jsonBodyParser = express.json();

// Makes this a protected endpoint
userAnswersRouter
  .use(requireAuth);

// The route for posting a users answer to the database
userAnswersRouter
  .route('/')
  .post(jsonBodyParser, async (req, res, next) => {
    try {
      // Pulls the required data from the request body
      const { question_id, answer_id, user_id } = req.body;

      // Sets the required data to an object
      const newAnswer = {
        question_id,
        answer_id
      };

      // Verifies that all required fields are there
      for (const [key, value] of Object.entries(newAnswer)) {
        if (value === undefined) {
          return res
            .status(400)
            .json({
              error: `Missing '${key}' in request body`
            });
        };
      };

      // Sets the new user answer user_id to the req user
      newAnswer.user_id = req.user.id;

      // Increments the question answered count by 1 each time a user answer is submitted
      const questionAnswered = await UserAnswersService.increaseQuestionAnswered(
        req.app.get('db'),
        question_id
      );

      // Increments the answer answered count by 1 each time a user answer is submitted
      const answer = await UserAnswersService.increaseAnswerAnswered(
        req.app.get('db'),
        answer_id
      );

      // Inserts the user answer into the database
      const userAnswer = await UserAnswersService.insertUserAnswer(
        req.app.get('db'),
        newAnswer
      );

      // Creates the reponse body
      let answerResponse = {
        answer: answer.answer,
        answered: answer.answered,
        question_answered: questionAnswered
      }

      res.send(answerResponse);

      next();
    } catch (error) {
      next(error)
    }
  });

// The route for retrieving a users answer for a specific question
userAnswersRouter
  .route('/:question_id')
  .get(async (req, res, next) => {
    try {
      // retrieves the answer from the database
      const userAnswer = await UserAnswersService.getUserAnswer(
        req.app.get('db'),
        req.params.question_id,
        req.user.id
      );

      res.json(userAnswer);

      next();
    } catch (error) {
      next(error);
    }
  });