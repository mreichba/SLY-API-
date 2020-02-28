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

  /auth

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
    **Content:** `{ error: }