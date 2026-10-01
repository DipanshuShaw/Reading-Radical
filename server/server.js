import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import { checkConnection } from './db.js';
import { setupDatabase } from './setup.js';
import usersRouter from './routes/users.mjs';
import booksRouter from './routes/books.mjs';
import reviewsRouter from './routes/reviews.mjs';
import feedbacksRouter from './routes/feedbacks.mjs';

const app = express();
const port = process.env.PORT || 5000;

if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET is not set in server/.env — login/register will fail until you add it.');
}

const origins = (process.env.CORS_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
app.use(cors(origins.length ? { origin: origins } : undefined));
app.use(express.json({ limit: '100kb' }));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/books', booksRouter);
app.use('/api/reviews', reviewsRouter);
app.use('/api/users', usersRouter);
app.use('/api/feedbacks', feedbacksRouter);

// Unknown API route
app.use('/api', (_req, res) => res.status(404).json({ error: 'Not found' }));

// Malformed JSON and other unexpected errors
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Invalid JSON body' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong' });
});

// Create DB/tables/seed automatically, then start listening.
try {
  await setupDatabase();
} catch (err) {
  console.error('❌ Automatic database setup failed:', err.message);
  console.error('   Is MySQL running, and are DB_USER / DB_PASS in server/.env correct?');
}

app.listen(port, async () => {
  console.log(`Server running on http://localhost:${port}`);
  await checkConnection();
});
