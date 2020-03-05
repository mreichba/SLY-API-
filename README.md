# Someone Like You API

This API Handles all of the data storage, manipulation and retrieval processes for the Someone Like You Client. The database holds user data, handles the user authentication, and breaks down statistical data from all users.

[Client Repo](https://github.com/thinkful-ei-iguana/MASK-SLY-client)

**API URL:** 

**Tech Stack:** NodeJS, Express, Knex, PostgreSQL, Mocha & Chai

## **Create User**

  The route is responsible for storing new users login information in the database

* **URL**

  /users

* **Method**

  `POST`

* **Data Params**

  To make a successful post request to this endpoint you must include a first name, last name, email, user name, and password in the request body

  **Required** <br />
  `first_name: 'string'` <br />
  `last_name: 'string'` <br />
  `email: 'string'` <br />
  `username: 'string'` <br />
  `password: 'string'`

* **Success Response**

  * **Code:** 201 CREATED <br />
    **Header:** Location: /users/:user_id <br />
    **Content:**
    ```javascript
    {
      id: integer,
      username: 'string'
      password: 'string',
      first_name: 'string',
      last_name: 'string',
      email: 'string'
    }
    ```

* **Error Response**
  
  Failing to send the correct information in the request to this endpoint there are several error messages you may receive.

  * **Code:** 400 BAD REQUEST <br />
    **Content** `{ error: 'Missing {field} in request body' }`

  OR

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: 'Password must {requirement}' }`

  OR

  * **Code:** 400 BAD REQUEST
    **Content:** `{ error: 'Username already taken' }`

* **Sample Call**

```javascript
fetch(`${API_URL}/users`, {
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify({
    first_name: 'Jon',
    last_name: 'Doe',
    email: 'fakeEmail@gmail.com',
    username: 'DoeBoy21',
    password: 'FaKePaSsW0rD!'
  })
})
```

## **User Autorization**

  Handles the authorization of user credentials sent form the client.

* **URL**

  /auth/token

* **Method**

  `POST`

* **Data Params**

  A POST request to this endpoint requires username and password to be successful.

  **Required** <br />
  `username: 'string'` <br />
  `password: 'string'`

* **Success Response**

  Upon a successful request this endpoint responds with a JWT used to access protected endpoints.

  * **Code:** 200 SUCCESS

* **Error Response**

  If no username or password are sent the request will fail. the request will also if the username and password do not match a user in the database.

  * **Code:** 400 BAD REQUEST <br />
    **Content:** `{ error: 'Missing {field} in request body'}`

    OR

  * **Code:** 400 BAD REQUEST
    **Content:** `{ error: 'Incorrect username or password' }`

* **Sample Call:**

  ```javascript
  fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      username: 'DoeBoy21'
      password: 'FaKePaSsW0rD!'
    })
  }
  ```

## **Get Initial User Info**

  This endpoint handles the storage of the original user info collected from the form on a users first login to the client.

* **URL**

  /users/initial

* **Method**

  `GET` | `POST`

* **Data Params**

  * /users/initial

    Requires a JWT in order to access this endpoint.

    **Required**

    `JWT={generated on login}`

  * POST /users/initial

    To successfully POST the users initial information to the database all fields must be present in the request body.

    **Required**

    `birthdate: new Date()` <br />
    `location: 'string'` <br />
    `nationality: 'string'` <br />
    `gender: 'string'` <br />
    `college_graduate: 'string'`

* **Success Response**

  * POST /users/initial

    * **Code:** 201 CREATED <br />
      **Content:**
      ```javascript
      {
        birthdate: 1986-02-21,
        location: 'Colorado',
        nationality: 'USA',
        gender: 'Male',
        college_graduate: 'No'
      }
      ```

  * GET /users/initial

    * **Code:** 200 OK
      **Content:** `true`

* **Error Response**

  * /users/initial

    If you do not send a JWT token when making a request to this endpoint an error will result.

    * **Code:** 401 UNAUTHORIZED <br />
      **Content:** `{ error: 'Unauthorized request' }`

  * POST /users/initial

    Attempting to make a POST request to this endpoint without each of the required fields will result in an error response.

    * **Code:** 400 BAD REQUEST
      **Content:** `{field} required`

* **Sample Call**

  * POST /users/initial

    ```javascript
    fetch(`${API_URL}/users/initial`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer ${JWT}`
      },
      body: JSON.stringify({
        birthdate: 1986-02-21,
        location: 'Colorado',
        nationality: 'USA',
        gender: 'Male',
        college_graduate: 'No'
      })
    })
    ```

  * GET /users/initial

    ```javascript
    fetch(`{API_URL}/users/initial`, {
      headers: {
        'authorization': `bearer {JWT}`
      }
    })
    ```

## Retrieve Questions from the Database

  This endpoint handles the requests for a users answered or unanswered questions.

* **URL**

  /questions/quizStatus/:option

* **Method**

  `GET`

* **URL Params**

  For a successful get call to this endpoint an option of either incomplete or completed must be set in the URL

  **Required**

  `option = incomplete`

  OR

  `option = completed`

* **Data Params**

  This is a protected endpoint and requires a JWT for a successful request.

  **Required**

  `JWT = {generated on login}`

* **Success Response**

  * **Code:** 200 SUCCESS <br />
    **Content:** `[ array of incomplete/completed questions ]`

* **Error Response**

  * **Code** 400 BAD REQUEST
    **Content:** `Request must contain an authToken & quizStatus parameter`

* **Sample Call**

  ```javascript
  fetch(`${API_URL}/questions/quizStatus/:option`, {
    headers: {
      'authorization': `bearer ${JWT}`
    }
  })
  ```

## Retrieve Answers

  This endpoint is responsible for retrieving the answers to a question the user has selected.

* **URL**

  /answers/:question_id <br />
  /answers/completedStatus/:question_id

* **Method**

  `GET`

* **URL Params**

  A question id is required to access several of the answers endpoints

  **Required**

  `question_id = integer`

* **Data Params**

  A JWT is required to access all answers endpoints

  **Required**

  `JWT = {generated on login}`

* **Success Response**

  * GET /answers/:question_id

    * **Code:** 200 SUCCESS <br />
      **Content:** `[ array of answers ]`
  
  * GET /answers/completedStatus/:question_id

    * **Code:** 200 SUCCESS
      **Content:** `true`

* **Error Response**

  * GET /answers/completedStatus/:question_id

    If you attempt to make a request to this endpoint without using the URL params

    * **Code:** 400 BAD REQUEST
      **Content:** `Sorry your request must contain an authToken and question id parameter`

* **Sample Call**

  * GET /answers/:question_id

    ```javascript
    fetch(`{API_URL}/amswers/:question_id`, {
      headers: {
        'authorization': `bearer {JWT}`
      }
    })
    ```

  * GET /answers/completedStatus/:question_id

    ```javascript
    fetch(`{API_URL}/answers/completedStatus/:question_id`, {
      headers: {
        'authorization': `bearer {JWT}`
      }
    })
    ```

## Posting a User's Answer

  This endpoint handles the storing of user's answers in the database.

* **URL**

  /user_answers

* **Method**

  `POST`

* **Data Params**

  For a successful request to this endpoint you must include all required fields and a JWT.

  **Required**

  `question_id = integer` <br />
  `answer_id = integer` <br />
  `JWT = { generatd on login }`

* **Success Response**

  * **Code:** 201 CREATED <br />
    **Content:**
    ```javascript
    {
      answer: 'Family`,
      selected: 12,
      answered: 89
    }
    ```

* **Error Response**

  * **Code:** 400 BAD REQUEST
    **Content:** `{ error: Missing '{key}' in request body }`

* **Sample Call**

  ```javascript
  fetch(`${API_URL}/user_answers`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'authorization': `bearer ${JWT}`
    },
    body: JSON.stringify({
      question_id: 1,
      answer_id: 3
    })
  })
  ```

## Retrieve Statistics from the Database

  This endpoint is responsible for retrieving the statistics from the database both for the initial form users fill out as well as any specific question the user answers.

* **URL**

  /stats/user/:question_id <br />
  /stats/initial-stats

* **Method**

  `GET`

* **URL Params**

  In order for a successful request of stats on a specific question the :question_id is required in the URL.

  **Required**

  `question_id = integer`

* **Data Params**

  This is a protected endpoint and requires a JWT in the request.

  **Required**

  `JWT = { generated on login }`

* **Success Response**

  * /stats/user/:question_id

    * **Code:** 200 SUCCESS <br />
      **Content:**
      ```javascript
      {
        question: 'Do you prefer a busy or calm lifestyle?',
        totalUserAnswers: 12,
        answerOptions: 3,
        userAnswer: 'Busy',
        mostCommonUserAnswer: 'Calm',
        matchingAnswers: [
          {
            id: 1,
            answer_id: 1,
            question_id: 1,
            user_id: 1
          },
          {
            id: 29,
            answer_id: 1,
            question_id: 1,
            user_id: 3
          },
          {
            id: 71,
            answer_id: 1,
            question_id: 1,
            user_id: 6
          },
          {
            id: 101,
            answer_id: 1,
            question_id: 1,
            user_id: 9
          },
          {
            id: 143,
            answer_id: 1,
            question_id: 1,
            user_id: 12
          }
        ]
      }
      ```

  * /stats/initial-stats

    * **Code:** 200 SUCCESS <br />
      **Content:**
      ```javascript
        {
          userData: {
            id: 1,
            birthdate: "1986-02-21",
            location: "Colorado",
            nationality: "United States",
            gender: "Male",
            college_graduate: false,
            user_id: 1
          },
          birthdayMatches: 1,
          locationMatches: 5,
          notionalityMatches: 16,
          genderMatches: 100,
          totalUsers: 382
        }
      ```

* **Sample Call**

  * /stats/user/:question_id
  ```javascript
  fetch(`${API_URL}/stats/user/:question_id`, {
    headers: {
      'authorization': `bearer ${JWT}`
    }
  })
  ```

  * /stats/initial-stats
  ```javascript
  fetch(`${API_URL}/stats/initial-stats`, {
    headers: {
      'authorization': `bearer ${JWT}`
    }
  })