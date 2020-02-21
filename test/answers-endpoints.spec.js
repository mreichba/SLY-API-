const app = require('../src/app');
const helpers = require('./test-helpers');

// Contains tests for all answers endpoints
describe('Answers Endpoints', function() {

  // Creates a container for the knex instance at an accessible scope for all tests
  let db;

  // Creates a test user for auth protected endpoints
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  // Destructures the objects from the helpers make question and answers arrays
  const [testQuestions, testAnswers, testUserAnswers] = helpers.makeQuestionAndAnswersArrays();

  // Before all tests creates the knex instance to the database
  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  // After all tests disconnect from the database
  after('disconnect from db', () => db.destroy());

  // Before all tests make sure the tables are clean
  before('cleanup', () => helpers.cleanTables(db));

  // After each test make sure the tables are clean
  afterEach('cleanup', () => helpers.cleanTables(db));

  // Contains all tests for the '/answers' route
  describe('GET /api/answers/:question_id', () => {
    // Before each test seed the users, questions, and answers into the database
    beforeEach('insert users, questions, and answers', () => {
      return helpers.seedUsersQuestionsAnswers(
        db,
        testUsers,
        testQuestions,
        testAnswers,
        testUserAnswers
      );
    });

    // Tests whether the endpoint returns the correct answers from the database
    it('responds with a 200 and the appropriate answers in an array', () => {
      // Creates a test question to pull the answers from
      const testQuestion = testQuestions[0];

      // Creates the expected array of answers
      const testQuestionAnswers = helpers.findQuestionAnswers(
        testQuestion.id,
        testAnswers
      );

      return supertest(app)
        .get(`/api/answers/${testQuestion.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200, testQuestionAnswers);
    });
  });
});