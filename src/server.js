require('dotenv').config();

const knex = require('knex');
const app = require('./app');
const { PORT, DATABASE_URL } = require('./config');

const db = knex({
  client: 'pg',
  connection: DATABASE_URL
});

app.set('db', db);

app.get('/health', (req, res) => {
  res.send('API is live!');
});

app.listen(PORT, () => {
  console.log(`Server listening at http://localhost:${PORT}`);
});