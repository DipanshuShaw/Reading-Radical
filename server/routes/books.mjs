import express from 'express';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'dip@1016',
  database: 'ReadingRadical',
});

// Route to get books by genre
router.get('/', async (req, res) => {
  const genre = req.query.genre;

  try {
    let query = 'SELECT * FROM books';
    let params = [];

    if (genre) {
      query += ' WHERE genre = ?';
      params.push(genre);
    }

    const [rows] = await pool.execute(query, params);
    res.json(rows);
  } catch (err) {
    console.error('Error fetching books:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

export default router;
