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

// Used to return a user's completed quiz array
questionsRouter.get('/quizStatus/:option', (req, res, next) => {
  let allQuestionIds = [];
  let completedQuestionIds = [];
  let incompletedQuestionData = [];
  let completedQuestionData = [];
  if (!req.user.id || !req.params.option) {
    res
      .status(400)
      .json('Request must contain an authToken & quizStatus parameter');
  }
  QuestionsService.getQuestions(req.app.get('db')).then(questionIds => {
    return (allQuestionIds = questionIds);
  });
  QuestionsService.getCompletedIds(req.app.get('db'), req.user.id)
    .then(result => {
      return (completedQuestionIds = result);
    })
    .then(() => {
      allQuestionIds.filter(item1 => {
        if (completedQuestionIds.includes(item1.id)) {
          completedQuestionData.push(item1);
        } else {
          incompletedQuestionData.push(item1);
        }
      });
    })
    .then(() => {
      if (req.params.option == 'completed') {
        res.status(200).json(completedQuestionData);
      } else {
        res.status(200).json(incompletedQuestionData);
      }
    });
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
