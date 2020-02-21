const express = require('express');
const jsonBodyParser = express.json();
const AnswersService = require('./AnswersService');
const { requireAuth } = require('../../Middleware/JWT');

// Creates a new router for the endpoint
const answersRouter = express.Router();

// Set this as a protected endpoint
answersRouter.use(requireAuth);

// The route for retrieving the answers for a specific question
answersRouter.route('/:question_id').get(async (req, res, next) => {
  try {
    // Retrieves the answers from the database
    const answers = await AnswersService.getQuestionAnswers(
      req.app.get('db'),
      req.params.question_id
    );

    res.json(answers);

    next();
  } catch (error) {
    next(error);
  }
});

module.exports = answersRouter;