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
    body: {
      username: 'DoeBoy21'
      password: 'FaKePaSsW0rD!'
    }
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
    fetch(`{API_URL}/users/initial`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'authorization': `bearer {JWT}`
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

