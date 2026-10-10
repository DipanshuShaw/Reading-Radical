import mysql from 'mysql2/promise';
import { baseConfig, dbName, describeError } from './dbConfig.js';

// One shared connection pool for the whole server.
// All credentials come from server/.env (see .env.example).
const pool = mysql.createPool({
  ...baseConfig(),
  database: dbName(),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export async function checkConnection() {
  try {
    const conn = await pool.getConnection();
    conn.release();
    console.log('✅ Database connected');
    return true;
  } catch (err) {
    console.error('❌ Database connection failed:', describeError(err));
    console.error('   Check the DB_HOST / DB_PORT / DB_USER / DB_PASS / DB_NAME variables and that MySQL is running.');
    return false;
  }
}

export default pool;
