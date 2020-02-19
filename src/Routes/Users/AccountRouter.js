const express = require('express');
const path = require('path');
const AccountService = require('./AccountService');

const accountRouter = express.Router();
const jsonBodyParser = express.json();

accountRouter.post('/', jsonBodyParser, async (req, res, next) => {
  const { password, username, first_name, last_name, email } = req.body;

  for (const field of [
    'first_name',
    'last_name',
    'email',
    'username',
    'password'
  ])
    if (!req.body[field])
      return res.status(400).json({
        error: `Missing '${field}' in request body`
      });

  try {
    const passwordError = AccountService.validatePassword(password);

    if (passwordError) return res.status(400).json({ error: passwordError });

    const hasUserWithUserName = await AccountService.hasUserWithUserName(
      req.app.get('db'),
      username
    );

    if (hasUserWithUserName)
      return res.status(400).json({ error: `Username already taken` });

    const hashedPassword = await AccountService.hashPassword(password);

    const newUser = {
      username,
      email,
      first_name,
      last_name,
      password: hashedPassword
    };

    const user = await AccountService.insertUser(req.app.get('db'), newUser);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(AccountService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

accountRouter.post('/initial', jsonBodyParser, (req, res, next) => {
  const {
    user_id,
    birthdate,
    location,
    nationality,
    gender,
    college_graduate
  } = req.body;

  if (!user_id) {
    logger.error('User ID is required');
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

  AccountService.insertAnswers(req.app.get('db'), initialAnswers)
    .then(result => res.status(201).json(result))
    .catch(next);
});

accountRouter.get('/initial/:user_id', (req, res) => {
  const { user_id } = req.params;

  // grabs the user_id from the params then searchs the users_info table to see if theyve completed the initial quiz
  // if they have the api sends 'true' back to the user and 'false' if not
  AccountService.initialStatus(req.app.get('db'), user_id).then(result => {
    if (result !== undefined) {
      return res.status(200).json(true);
    } else {
      return res.status(200).json(false);
    }
  });
});

module.exports = accountRouter;
