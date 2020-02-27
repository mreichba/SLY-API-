const express = require('express');
const path = require('path');
const AccountService = require('./AccountService');

const accountRouter = express.Router();
const jsonBodyParser = express.json();

// Route for creating user accounts
accountRouter.post('/', jsonBodyParser, async (req, res, next) => {
  const { password, username, first_name, last_name, email } = req.body;

  // checks to see if the request body has any values that need updated or if it was blank
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

  // checks to see if the inputed password is valid
  try {
    const passwordError = AccountService.validatePassword(password);

    if (passwordError)
      return res.status(400).json({
        error: passwordError
      });

    // checks to see if the inputed username is available or already taken
    const hasUserWithUserName = await AccountService.hasUserWithUserName(
      req.app.get('db'),
      username
    );

    if (hasUserWithUserName)
      return res.status(400).json({
        error: `Username already taken`
      });

    // hashes the user's password
    const hashedPassword = await AccountService.hashPassword(password);

    const newUser = {
      username,
      email,
      first_name,
      last_name,
      password: hashedPassword
    };

    // sends the newUser object to the db to be inserted
    const user = await AccountService.insertUser(req.app.get('db'), newUser);

    res
      .status(201)
      .location(path.posix.join(req.originalUrl, `/${user.id}`))
      .json(AccountService.serializeUser(user));
  } catch (error) {
    next(error);
  }
});

// Route for users to delete their accounts and answers from the db
accountRouter.delete('/', (req, res, next) => {
  // deletes the users account from the user table
  AccountService.deleteUser(req.app.get('db'), req.user.id)
    // deletes the users answers from the user_answers table
    .then(
      AccountService.deleteAnswersOfDeletedUser(req.app.get('db'), req.user.id)
    )
    .then(res.status(204).end())
    .catch(next);
});

// Route for updating user account information
accountRouter.patch('/', jsonBodyParser, async (req, res, next) => {
  const { username, first_name, last_name, email, password } = req.body;
  let updatedData = {
    first_name,
    last_name,
    email
  };

  // checks to see if the request body has any values that need updated or if it was blank
  const numberOfValues = Object.values(updatedData).filter(Boolean).length;
  if (numberOfValues === 0) {
    return res.status(400).json({
      error: {
        message:
          'Request body must contain either username, name, email, password'
      }
    });
  }

  // checks to see if the username the user is wanting is already taken
  if (username) {
    const hasUserUsername = await AccountService.hasUserWithUserName(
      req.app.get('db'),
      username
    );
    if (hasUserUsername) {
      return res.status(400).json({
        error: 'Username already taken'
      });
    } else {
      updatedData.username = username;
    }
  }

  // checks to see if the user's inputed password meets the criteria for a valid password
  if (password) {
    const passwordError = AccountService.validatePassword(password);
    if (passwordError) {
      return res.status(400).json({
        error: passwordError
      });
    }
    await AccountService.hashPassword(password).then(hashedPassword => {
      updatedData.password = hashedPassword;
    });
  }

  // then sends the request with the updatedData to the db to be updated
  return AccountService.updateAccount(
    req.app.get('db'),
    req.user.id,
    updatedData
  ).then(update => {
    res.status(204).json(AccountService.serializeUser(update));
  });
});

module.exports = accountRouter;
