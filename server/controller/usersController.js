import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Never send password_hash to the browser.
const publicUser = (u) => ({
  id: u.user_id,
  name: u.name,
  email: u.email,
  is_reviewer: !!u.is_reviewer,
});

const signToken = (u) =>
  jwt.sign({ userId: u.user_id, name: u.name }, process.env.JWT_SECRET, { expiresIn: '7d' });

export const registerUser = async (req, res) => {
  try {
    const name = String(req.body.name || '').trim();
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const isReviewer = req.body.is_reviewer ? 1 : 0;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email and password are required.' });
    }
    if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Please enter a valid email address.' });
    if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters.' });

    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email]);
    if (existing.length) return res.status(409).json({ error: 'An account with this email already exists.' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (name, email, password_hash, is_reviewer) VALUES (?, ?, ?, ?)',
      [name, email, hash, isReviewer]
    );
    const user = { user_id: result.insertId, name, email, is_reviewer: isReviewer };
    res.status(201).json({ message: 'User registered successfully', token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ error: 'Could not create account. Please try again.' });
  }
};

export const loginUser = async (req, res) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    if (!email || !password) return res.status(400).json({ error: 'Email and password are required.' });

    const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ error: 'Login failed. Please try again.' });
  }
};
