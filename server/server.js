import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { json } from 'express';
import connection from './db.js'; // Your database connection

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON
app.use(json());

// Routes
import usersRouter from './routes/users.mjs';
import booksRouter from './routes/books.mjs';
import feedbacksRouter from './routes/feedbacks.mjs';
import fetchReviewRouter from './routes/readReview.mjs'; // Import the reviews route

app.use('/api/users', usersRouter);
app.use('/api/books', booksRouter); // This will be used for book details route
app.use('/api/feedbacks', feedbacksRouter);

// Route for fetching reviews of a specific book by ID
app.use('/api/book', fetchReviewRouter); // This is for fetching reviews

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
