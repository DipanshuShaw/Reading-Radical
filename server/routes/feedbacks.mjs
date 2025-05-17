import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// ✅ MySQL Connection Pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'readingradical',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

// ✅ Test DB Connection
(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Database connected successfully');
    connection.release();
  } catch (err) {
    console.error('❌ Database connection failed:', err.message);
  }
})();

// ✅ Feedback POST Route
router.post('/', async (req, res) => {
  console.log("📥 Incoming Request Body:", req.body);

  const { username, email, stars, comment } = req.body;

  // ✅ Proper Validation
  if (!username || !email || stars === undefined || stars === null || !comment) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO feedback (username, email, stars, comment) VALUES (?, ?, ?, ?)',
      [username, email, stars, comment]
    );
    return res.json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error('❌ Database error:', err.message);
    return res.status(500).json({ success: false, message: 'Database error.' });
  }
});

export default router;
