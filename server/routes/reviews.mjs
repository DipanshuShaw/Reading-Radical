import express from 'express';
import db from '../db.js';

const router = express.Router();

// POST /api/reviews  { book_id, reviewer, comment, rating }
router.post('/', async (req, res) => {
  const bookId = Number(req.body.book_id);
  const reviewer = String(req.body.reviewer || '').trim();
  const comment = String(req.body.comment || '').trim();
  const rating = Number(req.body.rating);

  if (!Number.isInteger(bookId)) return res.status(400).json({ error: 'A valid book is required.' });
  if (!reviewer || !comment) return res.status(400).json({ error: 'Name and review text are required.' });
  if (reviewer.length > 100) return res.status(400).json({ error: 'Name is too long (max 100 characters).' });
  if (comment.length > 2000) return res.status(400).json({ error: 'Review is too long (max 2000 characters).' });
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5.' });
  }

  try {
    const [book] = await db.query('SELECT book_id FROM books WHERE book_id = ?', [bookId]);
    if (!book.length) return res.status(404).json({ error: 'Book not found.' });

    const [result] = await db.query(
      'INSERT INTO reviews (book_id, reviewer, comment, rating) VALUES (?, ?, ?, ?)',
      [bookId, reviewer, comment, rating]
    );
    res.status(201).json({ message: 'Review submitted successfully', reviewId: result.insertId });
  } catch (err) {
    console.error('Error inserting review:', err.message);
    res.status(500).json({ error: 'Could not save your review. Please try again.' });
  }
});

export default router;
