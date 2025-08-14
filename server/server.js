/* eslint-disable no-undef */
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'express';

// import connection from './db.js'; // DB connection

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(json());

// Routes
import usersRouter from './routes/users.mjs';
import booksRouter from './routes/books.mjs';
import feedbacksRouter from './routes/feedbacks.mjs';
import fetchReviewRouter from './routes/readReview.mjs';
// import coverImageRouter from

import reviewsRouter from './routes/reviews.mjs';
app.use('/api/reviews', reviewsRouter); 

// ✅ Specific routes FIRST
app.use('/api/book', fetchReviewRouter); // Handles /api/book/:id/reviews

// ✅ General routes AFTER
app.use('/api/books', booksRouter);      // Handles /api/books and /api/books/:id

// Other routes
app.use('/api/users', usersRouter);
app.use('/api/feedbacks', feedbacksRouter);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
