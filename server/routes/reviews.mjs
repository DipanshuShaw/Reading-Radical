import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

// Configure your MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'dip@1016',
  database: 'readingradical',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});


router.post('/', async (req, res) => {
  const { book_id, reviewer, comment, rating } = req.body;

  try {
    const [result] = await pool.query(
      'INSERT INTO reviews (book_id, reviewer, comment, rating) VALUES (?, ?, ?, ?)',
      [book_id, reviewer, comment, rating]
    );
    res.status(201).json({ message: 'Review submitted successfully', reviewId: result.insertId });
  } catch (err) {
    console.error('Error inserting review:', err);
    res.status(500).json({ error: 'Database error' });
  }
});

export default router;
