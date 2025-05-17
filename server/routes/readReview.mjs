// /routes/readReview.mjs
import express from 'express';
import connection from '../db.js';

const router = express.Router();

// Route for fetching reviews of a specific book by ID
router.get('/:id/reviews', (req, res) => {
    const bookId = req.params.id;

    // Query to fetch reviews
    const query = 'SELECT reviewer, comment, rating FROM reviews WHERE book_id = ?';
    connection.query(query, [bookId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error' });
        res.json(results);
    });
});

export default router;
