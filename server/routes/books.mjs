import express from 'express';
import mysql from 'mysql2/promise';

const router = express.Router();

// ✅ Create MySQL pool
const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'dip@1016',
  database: 'readingradical',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ GET all books or by genre
// ✅ GET all books or books by genre - /api/books or /api/books?genre=Action
router.get('/', async (req, res) => {
  const genre = req.query.genre;

  try {
    let query = 'SELECT * FROM books';
    let params = [];

    if (genre) {
      query += ' WHERE genre = ?';
      params.push(genre);
    }

    const [books] = await pool.query(query, params);
    res.json(books);
  } catch (err) {
    console.error('❌ Error fetching books:', err.message);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});


// ✅ GET book by ID
router.get('/:id', async (req, res) => {
  const bookId = req.params.id;
  try {
    const [rows] = await pool.query('SELECT * FROM books WHERE book_id = ?', [bookId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching book by ID:', err);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

export default router;
