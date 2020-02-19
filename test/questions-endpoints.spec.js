const app = require('../src/app');
const helpers = require('./test-helpers');

// Contains tests for all questions endpoints
describe('Questions Endpoints', function () {

  // Creates a container for the knex instance at an accessible scope for all tests
  let db;

  // Creates a test user for auth protected endpoint
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  // Creates test questions and answers arrays
  const [testQuestions, testAnswers, testUserAnswers] = helpers.makeQuestionAndAnswersArrays();

  // Before all tests creates the knex instance to the database
  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  // After all tests disconnects from the database
  after('disconnect from db', () => db.destroy());

  // Before all tests make sure the tables are clean
  before('cleanup', () => helpers.cleanTables(db));

  // After each test make sure the tables are clean
  afterEach('cleanup', () => helpers.cleanTables(db));

  // Contains all tests for the '/questions' route
  describe('GET /api/questions', () => {

    // Before each test seed the users, questions, and answers to the database
    beforeEach('insert users, questionss and answers', () => {
      return helpers.seedUsersQuestionsAnswers(
        db,
        testUsers,
        testQuestions,
        testAnswers,
        testUserAnswers
      );
    });

    // Tests whether the endpoint returns all questions from the database
    it('responds with a 200 and all of the questions', () => {
      return supertest(app)
        .get('/api/questions')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(testQuestions);
    });
  });

  // Contains all tests for the '/questions/:page' endpoint
  describe('GET /api/questions/:page/:page_size', () => {

    // Before each test seed the users, questions and answers to the database
    beforeEach('insert questions and answers', () => {
      return helpers.seedUsersQuestionsAnswers(
        db,
        testUsers,
        testQuestions,
        testAnswers,
        testUserAnswers
      );
    });

    // Tests whether the appropriate paginated questions are returned
    it('responds with 200 and the paginated questions', () => {

      // Set default values for page num and page size
      const page = 1;
      const pageSize = 2;

      // Creates a paginated list of questions
      const pagiQuest = helpers.paginateQuestions(testQuestions, page, pageSize);

      return supertest(app)
        .get(`/api/questions/${page}/${pageSize}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect(pagiQuest);
    });
  });
});