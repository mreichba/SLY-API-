require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const authRouter = require('./Routes/Auth/AuthRouter');
const accountRouter = require('./Routes/Users/AccountRouter');
const questionsRouter = require('./Routes/Questions/QuestionsRouter');
const answersRouter = require('./Routes/Answers/AnswersRouter');
const userAnswersRouter = require('./Routes/UserAnswers/UserAnswersRouter');
const initialRouter = require('./Routes/Initial/InitialRouter');
const statsRouter = require('./Routes/Stats/StatsRouter');

const { NODE_ENV } = require('./config');

const app = express();

const morganOption = NODE_ENV === 'production' ? 'tiny' : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.use('/api/auth', authRouter);
app.use('/api/users', accountRouter);
app.use('/api/questions', questionsRouter);
app.use('/api/answers', answersRouter);
app.use('/api/user_answers', userAnswersRouter);
app.use('/api/initial', initialRouter);
app.use('/api/stats', statsRouter);

app.use(function errorHandler(error, req, res, next) {
  let response;
  if (NODE_ENV === 'production') {
    response = { error: { message: 'server error' } };
  } else {
    console.error(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
