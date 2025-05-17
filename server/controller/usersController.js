import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db from '../db.js';

export const registerUser = (req, res) => {
  const { name, email, password, is_reviewer } = req.body;

  // Hash the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  const sql = 'INSERT INTO users (name, email, password_hash, is_reviewer) VALUES (?, ?, ?, ?)';
  db.query(sql, [name, email, hashedPassword, is_reviewer], (err, result) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'User registered successfully' });
  });
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM users WHERE email = ?';
  db.query(sql, [email], (err, results) => {
    if (err || results.length === 0) return res.status(401).json({ error: 'Invalid email or password' });

    const user = results[0];
    const isMatch = bcrypt.compareSync(password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password' });

    const token = jwt.sign({ userId: user.user_id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token, user });
  });
};
