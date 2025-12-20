const jwt = require('jsonwebtoken');
const { getDatabase } = require('../database');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }

    // Verify user still exists in database
    const db = getDatabase();
    db.get('SELECT id, username, email FROM users WHERE id = ?', [user.userId], (err, row) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!row) {
        return res.status(403).json({ error: 'User not found' });
      }
      req.user = {
        id: row.id,
        username: row.username,
        email: row.email
      };
      next();
    });
  });
}

module.exports = {
  authenticateToken,
  JWT_SECRET
};

