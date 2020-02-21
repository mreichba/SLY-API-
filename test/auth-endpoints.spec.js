const jwt = require('jsonwebtoken');
const app = require('../src/app');
const helpers = require('./test-helpers');
const config = require('../src/config')

// Tests all functions of the auth endpoint
describe('Auth Endpoints', function() {

  // Create a container for the knex instance in scope to be set later
  let db;

  // Sets a test user by taking the first user in test users
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  // Before all tests establishes the knex instance and sets it to the db variable
  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  // After all tests are done destroy the connection to the database
  after('disconnect from db', () => db.destroy());

  // Before any of the tests run make sure the tables are clean
  before('cleanup', () => helpers.cleanTables(db));

  // After each individual test make sure the tables are clean
  afterEach('cleanup', () => helpers.cleanTables(db));

  // Contains all tests for posting to the endpoint
  describe('POST /api/auth/token', () => {

    // Before each test seed the users into the database
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers
      )
    );

    // Sets the fields required for a successful POST
    const requiredFields = ['username', 'password'];

    // For each of the reqired fields
    requiredFields.forEach(field => {

      // Create a test login attempt with test user
      const loginTestUser = {
        username: testUser.username,
        password: testUser.password
      };

      // Tests to make sure we receive an appropriate response a field is missing
      it(`responds with 400 required error when '${field}' is missing`, () => {

        // Delete the field from login test user
        delete loginTestUser[field];

        return supertest(app)
          .post('/api/auth/token')
          .send(loginTestUser)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    // Tests whether the endpoint responds appropriately when the username is incorrect
    it('responds 400 \'Incorrect username or password\' when invalid username', () => {

      // Create an invalid username to attempt the login
      const invalidUser = {
        username: 'NowhereMan',
        password: 'N0wh3r3!'
      };

      return supertest(app)
        .post('/api/auth/token')
        .send(invalidUser)
        .expect(400, {
          error: 'Incorrect username or password'
        });
    });

    // Tests whether the endpoint responds appropriately when the password is incorrect
    it('responds 400 \'Incorrect username or password\' when invalid password', () => {
      
      // Give test user an invalid password
      const invalidPass = {
        username: testUser.username,
        password: 'invalid'
      };

      return supertest(app)
        .post('/api/auth/token')
        .send(invalidPass)
        .expect(400, {
          error: 'Incorrect username or password'
        });
    });

    // Tests whether the endpoint responds appropriately when given valid credentials
    it('responds with 200 and JWT auth token when using valid credentials', () => {

      // Creates a valid login attempt using test user
      const validCreds = {
        username: testUser.username,
        password: testUser.password
      };

      // Creates the expected token to compare to the response
      const expectedToken = jwt.sign({
        user_id: testUser.id,
        name: testUser.first_name
      },
      config.JWT_SECRET,
      {
        subject: testUser.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
      });

      return supertest(app)
        .post('/api/auth/token')
        .send(validCreds)
        .expect(200, {
          authToken: expectedToken
        });
    });
  });

  // Contains all of the test for PATCH requests to the endpoint
  describe('PATCH /api/auth/token', () => {

    // Before each test seed the database with users
    beforeEach('insert users', () =>
      helpers.seedUsers(
        db,
        testUsers
      )
    );

    // Tests whether the endpoint responds appropriately
    it('responds with a 200 and JWT auth token', () => {

      // Creates the expected token to compare with response
      const expectedToken = jwt.sign({
        user_id: testUser.id,
        name: testUser.first_name
      },
      config.JWT_SECRET,
      {
        subject: testUser.username,
        expiresIn: config.JWT_EXPIRY,
        algorithm: 'HS256'
      });

      return supertest(app)
        .put('/api/auth/token')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, {
          authToken: expectedToken
        });
    });
  });
});