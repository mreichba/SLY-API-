const bcrypt = require('bcryptjs');
const app = require('../src/app');
const helpers = require('./test-helpers');

// Contains all tests for the users endpoint
describe('User Endpoints', function() {
  // container for the knex instace
  let db;

  const testUsers = helpers.makeUsersArray();
  const testUser = testUsers[0];

  // Before all tests set the knex inxtance to the database
  before('make knex instance', () => {
    db = helpers.makeKnexInstance();
    app.set('db', db);
  });

  // After all tests disconnect from the database
  after('disconnect from db', () => db.destroy());

  // Before all tests make sure the tables are clear
  before('cleanup', () => helpers.cleanTables(db));

  // After each test make sure the tables are clear
  afterEach('cleanup', () => helpers.cleanTables(db));

  // The POST user endpoint
  describe('POST /api/users', () => {
    // Before each test insert the users into the database
    beforeEach('insert users', () => helpers.seedUsers(db, testUsers));

    // Sets all required fields for a user
    const requiredFields = [
      'username',
      'password',
      'first_name',
      'last_name',
      'email'
    ];

    // Runs the test for each required field
    requiredFields.forEach(field => {
      // Creates the test user
      const testRegistration = {
        username: 'TestDummy',
        password: 'G3tWr3ck3d!',
        first_name: 'Crash',
        last_name: 'Dummy',
        email: 'watchthis32@gmail.com'
      };

      // Test making sure the response is appropriate when a required field is missing
      it(`responds with 400 required errror when '${field}' is missing`, () => {
        // Deletes the current field in the for each
        delete testRegistration[field];

        return supertest(app)
          .post('/api/users')
          .send(testRegistration)
          .expect(400, {
            error: `Missing '${field}' in request body`
          });
      });
    });

    // Tests the server responds appropriately when password length isn't long enough
    it("responds 400 'Password must be longer than 8 characters' when empty password", () => {
      // Creates a fake user registration with a short password
      const shortPasswordUser = {
        username: 'TestDummy',
        password: 'ow',
        first_name: 'Crash',
        last_name: 'Dummy',
        email: 'watchthis32@gmail.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(shortPasswordUser)
        .expect(400, {
          error: 'Password must be longer than 8 characters'
        });
    });

    // Tests the server responds appropriately when the password is too long
    it("responds 400 'Password must be less than 72 characters' when long password", () => {
      // Creates a fake user registration with a long password
      const longPasswordUser = {
        username: 'TestDummy',
        password: 'A'.repeat(73),
        first_name: 'Crash',
        last_name: 'Dummy',
        email: 'watchthis32@gmail.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(longPasswordUser)
        .expect(400, {
          error: 'Password must be less than 72 characters'
        });
    });

    // Tests that the registration password doesn't start with spaces
    it('responds 400 error when password starts with spaces', () => {
      // Creates a user with a password starting with spaces
      const startSpacePasswordUser = {
        username: 'TestDummy',
        password: '  G3tWr3ck3d!',
        first_name: 'Crash',
        last_name: 'Dummy',
        email: 'watchthis32@gmail.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(startSpacePasswordUser)
        .expect(400, {
          error: 'Password must not start or end with empty spaces'
        });
    });

    // Tests that the registration password doesn't end with spaces
    it('responds 400 error when password ends with spaces', () => {
      // Creates a user with a password ending with spaces
      const endSpacePasswordUser = {
        username: 'TestDummy',
        password: 'G3tWr3ck3d!  ',
        first_name: 'Crash',
        last_name: 'Dummy',
        email: 'watchthis32@gmail.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(endSpacePasswordUser)
        .expect(400, {
          error: 'Password must not start or end with empty spaces'
        });
    });

    // Tests that the registration password is complex enough
    it("responds 400 error when the password isn't complex enough", () => {
      // Creates a user with a simple password
      const simplePasswordUser = {
        username: 'TestDummy',
        password: 'abcd1234',
        first_name: 'Crash',
        last_name: 'Dummy',
        email: 'watchthis32@gmail.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(simplePasswordUser)
        .expect(400, {
          error:
            'Password must contain one upper case, lower case, number, and special character'
        });
    });

    // Tests that when a duplicate user name is given the server responds appropriately
    it("responds 400 'Username already taken' when user name isn't unique", () => {
      // Creates a registration with an already taken username
      const duplicateUserName = {
        username: testUser.username,
        password: 'G3tWr3ck3d!',
        first_name: 'Crash',
        last_name: 'Dummy',
        email: 'watchthis32@gmail.com'
      };

      return supertest(app)
        .post('/api/users')
        .send(duplicateUserName)
        .expect(400, {
          error: 'Username already taken'
        });
    });

    //Tests when the user registration is valid
    describe('Given a valid user', () => {
      // The server responds appropriately when the user sends a valid registration
      it('responds 201 with a serialized user and no password', () => {
        // Creates a valid user registration
        const validUser = {
          username: 'TestDummy',
          password: 'GetWr3ck3d!',
          first_name: 'Crash',
          last_name: 'Dummy',
          email: 'watchthis32@gmail.com'
        };

        return supertest(app)
          .post('/api/users')
          .send(validUser)
          .expect(201)
          .expect(res => {
            expect(res.body).to.have.property('id');
            expect(res.body.username).to.eql(validUser.username);
            expect(res.body.first_name).to.eql(validUser.first_name);
            expect(res.body.last_name).to.eql(validUser.last_name);
            expect(res.body).to.not.have.property('password');
            expect(res.body).to.not.have.property('email');
            expect(res.headers.location).to.eql(`/api/users/${res.body.id}`);
          });
      });

      // Tests that the valid user is stored in the database with a bcrypted password
      it('stores the new user in database with bcrypted password', () => {
        // Creates a valid user registration
        const validUser = {
          username: 'TestDummy',
          password: 'GetWr3ck3d!',
          first_name: 'Crash',
          last_name: 'Dummy',
          email: 'watchthis32@gmail.com'
        };

        return supertest(app)
          .post('/api/users')
          .send(validUser)
          .expect(res =>
            db('users')
              .select('*')
              .where({ id: res.body.id })
              .first()
              .then(row => {
                expect(row.username).to.eql(validUser.username);
                expect(row.first_name).to.eql(validUser.first_name);
                expect(row.last_name).to.eql(validUser.last_name);
                expect(row.email).to.eql(validUser.email);

                return bcrypt.compare(validUser.password, row.password);
              })
              .then(compareMatch => {
                expect(compareMatch).to.be.true;
              })
          );
      });
    });
  });
  //  test for when users submit their initial questionnaire answers
  describe('POST for /users/initial', () => {
    const answers = {
      user_id: 1,
      age: 'teen',
      location: 'seattle, wa',
      nationality: 'american',
      gender: 'male',
      collegegraduate: true
    };

    return supertest(app)
      .post('/api/users/initial')
      .send(answers)
      .expect(res => {
        db('users_info')
          .select('*')
          .where({ id: res.body.id })
          .first()
          .then(row => {
            expect(row.user_id).to.eql(answers.user_id);
            expect(row.age).to.eql(answers.age);
            expect(row.location).to.eql(answers.location);
            expect(row.nationality).to.eql(answers.nationality);
            expect(row.gender).to.eql(answers.gender);
            expect(row.collegegraduate).to.eql(answers.collegegraduate);
          });
      });
  });
});
