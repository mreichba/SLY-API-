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

module.exports = accountRouter;
