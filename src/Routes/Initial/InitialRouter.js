const express = require('express');
const InitialService = require('./InitialService');
const { requireAuth } = require('../../Middleware/JWT');

const initialRouter = express.Router();
const jsonBodyParser = express.json();

initialRouter.use(requireAuth);

initialRouter.post('/', jsonBodyParser, (req, res, next) => {
  const {
    user_id,
    birthdate,
    location,
    nationality,
    gender,
    college_graduate
  } = req.body;

  if (!user_id) {
    return res.status(400).send('User ID required');
  }
  if (!birthdate) {
    return res.status(400).send('Birthdate required');
  }
  if (!nationality) {
    return res.status(400).send('Nationality required');
  }
  if (!gender) {
    return res.status(400).send('Gender required');
  }
  if (!college_graduate) {
    return res.status(400).send('CollegeGraduate required');
  }
  if (!location) {
    return res.status(400).send('Location required');
  }

  const initialAnswers = {
    user_id,
    birthdate,
    location,
    nationality,
    gender,
    college_graduate
  };

  // inserts the users new account data into the database and sends back a 200 so they client knows to push them
  // to log in route so the user can log into their new account
  InitialService.insertAnswers(req.app.get('db'), initialAnswers)
    .then(result => res.status(201).json(result))
    .catch(next);
});

initialRouter.get('/', (req, res) => {
  if (!req.user.id) {
    res.status(401).json({
      error: 'Unauthorized request'
    });
  }

  // grabs the user_id from the params then searchs the users_info table to see if theyve completed the initial quiz
  // if they have the api sends 'true' back to the user and 'false' if not
  InitialService.initialStatus(req.app.get('db'), req.user.id).then(result => {
    if (result !== undefined) {
      return res.status(200).json(true);
    } else {
      return res.status(200).json(false);
    }
  });
});

module.exports = initialRouter;
