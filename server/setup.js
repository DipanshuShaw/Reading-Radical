import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';
import { baseConfig, dbName } from './dbConfig.js';

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), 'sql');

// schema.sql / seed.sql contain CREATE DATABASE / USE for manual runs; here we
// connect to DB_NAME ourselves, so those lines are dropped.
const read = (f) =>
  fs.readFileSync(path.join(dir, f), 'utf8')
    .split('\n')
    .filter((l) => !/^\s*(CREATE DATABASE|USE)\b/i.test(l))
    .join('\n');

// Columns added after the first version of the schema. Databases created earlier (e.g. a local one) get them
// automatically on startup, so the API never fails with "Unknown column". Names are constants (no user input).
const REQUIRED_COLUMNS = [
  { table: 'reviews', column: 'user_id', ddl: 'INT NULL' },
];

export async function ensureColumns(conn) {
  for (const { table, column, ddl } of REQUIRED_COLUMNS) {
    const [rows] = await conn.query(
      'SELECT 1 FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?',
      [table, column]
    );
    if (!rows.length) {
      await conn.query(`ALTER TABLE \`${table}\` ADD COLUMN \`${column}\` ${ddl}`);
      console.log(`🛠️  Added missing column ${table}.${column}`);
    }
  }
}

// Creates the database + tables if missing and seeds books on first run.
// Safe to run on every start.
export async function setupDatabase() {
  const name = dbName();
  const conn = await mysql.createConnection({ ...baseConfig(), multipleStatements: true });
  try {
    await conn.query(`CREATE DATABASE IF NOT EXISTS \`${name}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${name}\``);
    await conn.query(read('schema.sql'));
    await ensureColumns(conn);
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
