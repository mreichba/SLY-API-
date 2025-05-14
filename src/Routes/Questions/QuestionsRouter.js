const express = require('express');
const QuestionsService = require('./QuestionsService');
const { requireAuth } = require('../../Middleware/JWT');

const questionsRouter = express.Router();

// Sets require auth on all questions checkpoints
questionsRouter.use(requireAuth);

// Responds when a GET request is made to the '/api/questions' endpoint
questionsRouter.route('/').get(async (req, res, next) => {
  try {
    // Retrieve questions from the database
    const questions = await QuestionsService.getQuestions(req.app.get('db'));

    // Respond with the questions
    res.json(questions);

    next();
  } catch (error) {
    next(error);
  }
});

// Responds with the specific question matching the id
questionsRouter.get('/:question_id', (req, res) => {
  const { question_id } = req.params;

  QuestionsService.getQuestion(req.app.get('db'), question_id).then(result => {
    const [question] = result;
    res.status(200).json(question);
  });
});


// Responds when a GET request is made to the '/questions/topic' endpoint
questionsRouter.get('/topic', (req, res) => {
  // Retrieves all the questions and groups them by topic and returns them to the client
  QuestionsService.groupByTopic(req.app.get('db')).then(result => {
    return res.status(200).json(result);
  });
});

// Responds when a GET request is made to the '/questions/topic/:topic' endpoint
questionsRouter.get('/topic/:topic', (req, res) => {
  const { topic } = req.params;

  // Retrieves all the questions related to ':topic' and returns them to the client
  QuestionsService.getQuestionAnswers(req.app.get('db'), topic).then(res =>
    console.log(res)
  );
});

questionsRouter.get('/quizStatus/:option', async (req, res, next) => {
  if (!req.user?.id || !req.params.option) {
    return res.status(400).json({
      error: 'Request must contain an authToken & quizStatus parameter'
    });
  }

  try {
    const allQuestions = await QuestionsService.getQuestions(
      req.app.get('db')
    );
    const completedIds = await QuestionsService.getCompletedIds(
      req.app.get('db'),
      req.user.id
    );

    const completed = [];
    const incomplete = [];

    allQuestions.forEach(question => {
      if (completedIds.includes(question.id)) {
        completed.push(question);
      } else {
        incomplete.push(question);
      }
    });

    if (req.params.option === 'completed') {
      res.status(200).json(completed);
    } else {
      res.status(200).json(incomplete);
    }
  } catch (err) {
    console.error('❌ Error in /quizStatus route:', err);
    next(err);
  }
});

// Responds when a GET request is made to the '/questions/:page' endpoint
questionsRouter.route('/:page/:page_size').get(async (req, res, next) => {
  try {
    res.json(
      await QuestionsService.paginateQuestions(
        req.app.get('db'),
        req.params.page,
        req.params.page_size
      )
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = questionsRouter;
