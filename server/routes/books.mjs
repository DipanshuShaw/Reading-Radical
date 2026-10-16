import express from 'express';
import db from '../db.js';
import { orderByFor } from '../sorting.js';

const router = express.Router();

// GET /api/books            -> all books (with average rating + review count)
// GET /api/books?genre=Action
// GET /api/books?q=dune     -> search title/author
router.get('/', async (req, res) => {
  const { genre, q, sort } = req.query;
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 0, 0), 100);
  try {
    let sql = `
      SELECT b.*, ROUND(AVG(r.rating), 1) AS avg_rating, COUNT(r.rating) AS review_count
      FROM books b
      LEFT JOIN reviews r ON r.book_id = b.book_id`;
    const where = [];
    const params = [];
    if (genre) { where.push('b.genre = ?'); params.push(genre); }
    if (q) { where.push('(b.title LIKE ? OR b.author LIKE ?)'); params.push(`%${q}%`, `%${q}%`); }
    if (where.length) sql += ' WHERE ' + where.join(' AND ');
    sql += ' GROUP BY b.book_id';
    // ?sort=title|title_desc|author|rating|reviews (default title). Unknown values fall back to the default.
    sql += ' ORDER BY ' + orderByFor(sort);
    if (limit) { sql += ' LIMIT ?'; params.push(limit); }

    const [books] = await db.query(sql, params);
    res.json(books);
  } catch (err) {
    console.error('Error fetching books:', err.message);
    res.status(500).json({ error: 'Failed to fetch books' });
  }
});

router.get('/:id', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid book id' });
  try {
    const [rows] = await db.query(
      `SELECT b.*, ROUND(AVG(r.rating), 1) AS avg_rating, COUNT(r.rating) AS review_count
       FROM books b LEFT JOIN reviews r ON r.book_id = b.book_id
       WHERE b.book_id = ? GROUP BY b.book_id`,
      [id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Book not found' });
    res.json(rows[0]);
  } catch (err) {
    console.error('Error fetching book:', err.message);
    res.status(500).json({ error: 'Failed to fetch book' });
  }
});

// GET /api/books/:id/reviews
router.get('/:id/reviews', async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) return res.status(400).json({ error: 'Invalid book id' });
  try {
    const [rows] = await db.query(
      'SELECT reviewer, comment, rating FROM reviews WHERE book_id = ?',
      [id]
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching reviews:', err.message);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

export default router;
