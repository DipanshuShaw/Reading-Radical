// controllers/booksController.js

import db from '../db.js';

export const addBook = (req, res) => {
  const { title, author, description, cover_image, genre_id, uploaded_by } = req.body;
  const sql = 'INSERT INTO books (title, author, description, cover_image, genre_id, uploaded_by) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [title, author, description, cover_image, genre_id, uploaded_by], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Book added' });
  });
};

export const getAllBooks = (req, res) => {
  const sql = 'SELECT * FROM books';
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(results);
  });
};
