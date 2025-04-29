// scripts/seed.js
require('dotenv').config();
const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Adjust the path to match your actual file
const seedSql = fs.readFileSync(path.join(__dirname, '../seeds/seed.questions.sql')).toString();

const connectionString =
  process.env.NODE_ENV === 'test'
    ? process.env.TEST_DATABASE_URL
    : process.env.DATABASE_URL;

const client = new Client({
  connectionString,
  ssl: !!process.env.SSL,
});

async function seed() {
  try {
    await client.connect();
    console.log("🌱 Seeding database...");
    await client.query(seedSql);
    console.log("✅ Seed completed successfully.");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  } finally {
    await client.end();
  }
}

seed();