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
      const { question_id, answer_id } = req.body;

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

      // Inserts the new answer into the database
      const newUserAnswer = await UserAnswersService.insertUserAnswer(
        req.app.get('db'),
        newAnswer
      );

      // Gets the count of how many times the answer has been selected by users
      const [answerSelected] = await UserAnswersService.getAnswerSelected(
        req.app.get('db'),
        newUserAnswer.answer_id
      );

      // Gets the count of how many times the question has been answered
      const [questionAnswered] = await UserAnswersService.getQuestionAnswered(
        req.app.get('db'),
        newUserAnswer.question_id
      );

      // Gets the rest of the info required for the response
      const [userAnswer] = await UserAnswersService.getUserAnswer(
        req.app.get('db'),
        newUserAnswer.question_id,
        req.user.id
      )
      
      res.status(201)
        .json({
          answer: userAnswer.answer,
          selected: Number(answerSelected.count),
          answered: Number(questionAnswered.count)
        });
      
      next();
    } catch (error) {
      next(error)
    }
  });

// The route for retrieving a users answer for a specific question
userAnswersRouter
  .route('/:question_id')
  .all(async (req, res, next) => {
    try {

      // Gets the users answer from the database
      const [userAnswer] = await UserAnswersService.getUserAnswer(
        req.app.get('db'),
        req.params.question_id,
        req.user.id
      );


      // If there is not matching user answer return a 404 NOT FOUND
      if (!userAnswer) {
        return res
          .status(404)
          .json({
            error: 'User answer does not exist'
          });
      }

      // Sets the response user answer value to user answer
      res.userAnswer = userAnswer;

      next();
    } catch (error) {
      next(error);
    }
  })
  .get(async (req, res, next) => {

      // Gets the count of how many times the answer has been selected by users
      const [answerSelected] = await UserAnswersService.getAnswerSelected(
        req.app.get('db'),
        res.userAnswer.answer_id
      );

      // Gets the count of how many times the question has been answered
      const [questionAnswered] = await UserAnswersService.getQuestionAnswered(
        req.app.get('db'),
        res.userAnswer.question_id
      );

      res.json({
        answer: res.userAnswer.answer,
        selected: Number(answerSelected.count),
        answered: Number(questionAnswered.count)
      });
  });

  module.exports = userAnswersRouter;