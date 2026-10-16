import jwt from 'jsonwebtoken';

// Blocks the request unless it carries a valid "Authorization: Bearer <token>" header.
// On success, req.user = { userId, name } (the token payload created at login/register).
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Please log in or register to continue.' });

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ error: 'Your session has expired. Please log in again.' });
  }
  next();
}
