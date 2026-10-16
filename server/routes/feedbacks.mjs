import express from 'express';
import db from '../db.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// POST /api/feedbacks  { stars, comment }   (requires login)
// Name and e-mail are taken from the logged-in account, not from the request body.
router.post('/', requireAuth, async (req, res) => {
  const comment = String(req.body.comment || '').trim();
  const stars = Number(req.body.stars);

  if (!comment) return res.status(400).json({ success: false, message: 'Please write a comment.' });
  if (comment.length > 2000) return res.status(400).json({ success: false, message: 'Comment is too long (max 2000 characters).' });
  if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
    return res.status(400).json({ success: false, message: 'Rating must be between 1 and 5.' });
  }

  try {
    const [users] = await db.query('SELECT name, email FROM users WHERE user_id = ?', [Number(req.user.userId)]);
    if (!users.length) {
      return res.status(401).json({ success: false, message: 'Account not found. Please log in again.' });
    }
    await db.query('INSERT INTO feedback (username, email, stars, comment) VALUES (?, ?, ?, ?)', [
      users[0].name, users[0].email, stars, comment,
    ]);
    res.status(201).json({ success: true, message: 'Feedback submitted successfully.' });
  } catch (err) {
    console.error('Feedback error:', err.message);
    res.status(500).json({ success: false, message: 'Could not save feedback. Please try again.' });
  }
});

export default router;
