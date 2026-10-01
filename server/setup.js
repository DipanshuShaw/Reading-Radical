import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'sql');

// schema.sql / seed.sql contain CREATE DATABASE / USE for manual runs; here we
// connect to DB_NAME ourselves, so those lines are dropped.
const read = (f) =>
  fs.readFileSync(path.join(dir, f), 'utf8')
    .split('\n')
    .filter((l) => !/^\s*(CREATE DATABASE|USE)\b/i.test(l))
    .join('\n');

// Creates the database + tables if missing and seeds books on first run.
// Safe to run on every start.
export async function setupDatabase() {
  const name = process.env.DB_NAME || 'readingradical';
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    multipleStatements: true,
  });
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${name}\``);
    await conn.query(read('schema.sql'));
    const [[{ n }]] = await conn.query('SELECT COUNT(*) AS n FROM books');
    if (n === 0) {
      await conn.query(read('seed.sql'));
      const [[{ total }]] = await conn.query('SELECT COUNT(*) AS total FROM books');
      console.log(`📚 Database "${name}" ready — seeded ${total} books`);
    } else {
      console.log(`📚 Database "${name}" ready (${n} books)`);
    }
  } finally {
    await conn.end();
  }
}
