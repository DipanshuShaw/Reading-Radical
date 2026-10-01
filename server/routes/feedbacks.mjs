import express from 'express';
import db from '../db.js';

const router = express.Router();

// POST /api/feedbacks  { username, email, stars, comment }
router.post('/', async (req, res) => {
  const username = String(req.body.username || '').trim();
  const email = String(req.body.email || '').trim();
  const comment = String(req.body.comment || '').trim();
  const stars = Number(req.body.stars);

  if (!username || !email || !comment || !Number.isInteger(stars)) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ success: false, message: 'Please enter a valid email address.' });
  }
  if (stars < 1 || stars > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
  }

  try {
    await db.query('INSERT INTO feedback (username, email, stars, comment) VALUES (?, ?, ?, ?)', [
      username, email, stars, comment,
    ]);
    res.status(201).json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error('Feedback error:', err.message);
    res.status(500).json({ success: false, message: 'Could not save feedback. Please try again.' });
  }
});

export default router;
