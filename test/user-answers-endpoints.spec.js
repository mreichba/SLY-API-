const app = require('../src/app');
const helpers = require('./test-helpers');

// Contains all tests for the user answers endpoints
describe.only('User Answers Endpoints', function () {

  // Creates a container for the knex instance at an accessible scope for all tests
  let db;

  // Creates a test user for accessing auth protected endpoints
  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  // Take the necessary test arrays from the helpers
  const [testQuestions, testAnswers, testUserAnswers] = helpers.makeQuestionAndAnswersArrays();

  // Before all tests creates the knex instance to the database
  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  // After all tests diconnect from the database
  after('disconnect from db', () => db.destroy());

  // Before all tests make sure the tables are clean
  before('cleanup', () => helpers.cleanTables(db));

  // After each test make sure the tables are clean
  afterEach('cleanup', () => helpers.cleanTables(db));

  // Contains all the tests for the '/user_answers' endpoints
  describe('/api/user_answers/:question_id', () => {

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

    // Contains the tests for retrieving a specific user answer
    it('responds with a 200 and the expected users answer', () => {

      // Creates the test question
      const testQuestion = testQuestions[1];

      // Gets the corret expected user answer
      const userAnswer = helpers.findUserAnswer(testUserAnswers, testQuestion.id, testUser.id);
      
      // Finds the answer corresponding to the user answers answer id
      const answer = helpers.findAnswer(testAnswers, userAnswer.answer_id);

      return supertest(app)
        .get(`/api/user_answers/${testQuestion.id}`)
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .expect(200)
        .expect({
          answer: answer.answer,
          answered: answer.answered,
          question_answered: testQuestion.answered
        });
    }); 
  });
});