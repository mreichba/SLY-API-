const express = require('express');
const StatsService = require('./StatsService');
const AnswersService = require('../Answers/AnswersService');
const QuestionsService = require('../Questions/QuestionsService');
const { requireAuth } = require('../../Middleware/JWT');
const statsRouter = express.Router();

// Sets require auth on all stats checkpoints
statsRouter.use(requireAuth);

// Route gets the users answer related data for a particular quiz
statsRouter.get('/user/:question_id', (req, res) => {
  const { question_id } = req.params;
  let question;
  let answerOptions;
  let totalUserAnswers;
  let answer_id;
  let userAnswer;
  let responseBody;
  let mostCommonUserAnswer;

  // grabs the question that the user was on so we can send it in the response body
  QuestionsService.getQuestion(req.app.get('db'), question_id).then(
    response => (question = response[0].question)
  );

  // grabs how many potential answers there was for the particular question
  StatsService.answerOptions(req.app.get('db'), question_id).then(
    count => (answerOptions = count.length)
  );

  // grabs how many people answered the particular question
  StatsService.totalAnswers(req.app.get('db'), question_id).then(response => {
    totalUserAnswers = response.length;

    // iterates through the user answer's for the particular quiz and sets the value of the mostCommonUserAnswer for that particular quiz
    let counter = 0;
    let lastIdx = 0;
    for (var i = 0; i < response.length; i++) {
      for (var j = i; j < response.length; j++) {
        if (response[i] === response[j]) counter++;
        if (lastIdx < counter) {
          lastIdx = counter;
          mostCommonUserAnswer = response[i];
        }
      }
      counter = 0;
    }
  });

  // grabs the user's answer_id for that particular quiz using the question_id and the user's id
  AnswersService.answer(req.app.get('db'), question_id, req.user.id)
    .then(result => (answer_id = result[0]))
    .then(() =>
      // grabs the user's answer value using the answer_id from the promise chain above
      AnswersService.getAnswer(req.app.get('db'), answer_id).then(
        answer => (userAnswer = answer[0])
      )
    )
    // grabs the answer value for the mostCommonUserAnswer which is a answer_id then gets changed to the string value of the answer
    .then(() =>
      AnswersService.getAnswer(req.app.get('db'), mostCommonUserAnswer).then(
        response => (mostCommonUserAnswer = response[0])
      )
    )
    // returns all the matching user answers for the particular quiz
    .then(() => {
      StatsService.checkUserAnswerOccurances(
        req.app.get('db'),
        question_id,
        answer_id
      )
        // creates the responseBody and sends it to the client so the user can see how their answer is compared to all the other users
        .then(matchingAnswers => {
          responseBody = {
            question,
            totalUserAnswers,
            answerOptions,
            userAnswer,
            mostCommonUserAnswer,
            matchingAnswers
          };
          res.status(200).json(responseBody);
        });
    });
});

statsRouter.get('/initial-stats', (req, res) => {
  let userData;
  let allUserData;
  let birthdayMatches;
  let locationMatches;
  let nationalityMatches;
  let genderMatches;
  let collegeGradMatches;
  let totalUsers;

  StatsService.getUserData(req.app.get('db'), req.user.id)
    .then(result => (userData = result[0]))
    .then(() =>
      StatsService.getAllUserData(req.app.get('db')).then(result => {
        allUserData = result;
        totalUsers = result.length;
      })
    )
    .then(() => {
      birthdayMatches = allUserData.filter(item => {
        if (item.birthdate === userData.birthdate) {
          return item;
        }
      });
    })
    .then(() => {
      locationMatches = allUserData.filter(item => {
        if (item.location === userData.location) {
          return item;
        }
      });
    })
    .then(() => {
      nationalityMatches = allUserData.filter(item => {
        if (item.nationality === userData.nationality) {
          return item;
        }
      });
    })
    .then(() => {
      genderMatches = allUserData.filter(item => {
        if (item.gender === userData.gender) {
          return item;
        }
      });
    })
    .then(() => {
      collegeGradMatches = allUserData.filter(item => {
        if (item.college_graduate === userData.college_graduate) {
          return item;
        }
      });
    })
    .then(() => {
      const responseBody = {
        userData,
        birthdayMatches: birthdayMatches.length,
        locationMatches: locationMatches.length,
        nationalityMatches: nationalityMatches.length,
        genderMatches: genderMatches.length,
        collegeGradMatches: collegeGradMatches.length,
        totalUsers
      };
      res.status(200).json(responseBody);
    });
});

module.exports = statsRouter;
