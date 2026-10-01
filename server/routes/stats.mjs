import express from 'express';
import db from '../db.js';

const router = express.Router();

// GET /api/stats -> live numbers for the home/about pages
router.get('/', async (_req, res) => {
  try {
    const [[row]] = await db.query(`
      SELECT
        (SELECT COUNT(*) FROM books) AS books,
        (SELECT COUNT(*) FROM reviews) AS reviews,
        (SELECT COUNT(*) FROM users) AS readers,
        (SELECT COUNT(DISTINCT genre) FROM books) AS genres`);
    res.json(row);
  } catch (err) {
    console.error('Stats error:', err.message);
    res.status(500).json({ error: 'Failed to load stats' });
  }
});

export default router;
