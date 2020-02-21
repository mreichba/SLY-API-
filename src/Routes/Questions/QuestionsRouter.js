const express = require('express');
const QuestionsService = require('./QuestionsService');
const { requireAuth } = require('../../Middleware/JWT');

const questionsRouter = express.Router();

// Sets require auth on all questions checkpoints
questionsRouter
  .use(requireAuth)

// Responds when a GET request is made to the '/api/questions' endpoint
questionsRouter
  .route('/')
  .get(async (req, res, next) => {
    try {

      // Retrieve questions from the database
      const questions = await QuestionsService.getQuestions(
        req.app.get('db')
      )
      
      // Respond with the questions
      res.json(questions);

      next();
    } catch (error) {
      next(error);
    }
  })

// Responds when a GET request is made to the '/questions/:page' endpoint
questionsRouter
  .route('/:page/:page_size')
  .get(async (req, res, next) => {
    try {
      res.json(await QuestionsService.paginateQuestions(
        req.app.get('db'),
        req.params.page,
        req.params.page_size
      ));
      next();
    } catch (error) {
      next(error);
    }
  })

module.exports = questionsRouter;
