const express = require('express');
const jsonBodyParser = express.json();
const AnswersService = require('./AnswersService');
const { requireAuth } = require('../../Middleware/JWT');

// Builds a new router for the endpoint
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

// Route to check if the current logged in user has completed the quiz they're trying to access via the question_id and their user_id

answersRouter.get('/:question_id/:user_id', (req, res) => {
  const { question_id, user_id } = req.params;

  AnswersService.checkIfCompleted(
    req.app.get('db'),
    question_id,
    user_id
  ).then(result =>
    result.length > 0 ? res.status(200).json(true) : res.status(200).json(false)
  );
});

module.exports = answersRouter;
