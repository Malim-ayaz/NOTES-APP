const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { dbRun, dbGet, dbQuery } = require('../database');
const { JWT_SECRET } = require('../middleware/auth');

const ACCESS_TOKEN_EXPIRY = '15m'; // Short-lived access token
const REFRESH_TOKEN_EXPIRY = '7d'; // Long-lived refresh token

/**
 * Generate access token (short-lived)
 */
function generateAccessToken(user) {
  return jwt.sign(
    { userId: user.id, username: user.username, email: user.email },
    JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
}

/**
 * Generate refresh token (long-lived, stored in DB)
 */
function generateRefreshToken() {
  return crypto.randomBytes(40).toString('hex');
}

/**
 * Store refresh token in database
 */
async function storeRefreshToken(userId, token) {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

  await dbRun(
    'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
    [userId, token, expiresAt.toISOString()]
  );
}

/**
 * Verify and get refresh token from database
 */
async function verifyRefreshToken(token) {
  const tokenRecord = await dbGet(
    'SELECT * FROM refresh_tokens WHERE token = ? AND expires_at > datetime("now")',
    [token]
  );

  if (!tokenRecord) {
    return null;
  }

  return tokenRecord;
}

/**
 * Delete refresh token from database
 */
async function deleteRefreshToken(token) {
  await dbRun('DELETE FROM refresh_tokens WHERE token = ?', [token]);
}

/**
 * Delete all refresh tokens for a user
 */
async function deleteAllUserRefreshTokens(userId) {
  await dbRun('DELETE FROM refresh_tokens WHERE user_id = ?', [userId]);
}

/**
 * Clean up expired refresh tokens
 */
async function cleanupExpiredTokens() {
  await dbRun('DELETE FROM refresh_tokens WHERE expires_at < datetime("now")');
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
  deleteAllUserRefreshTokens,
  cleanupExpiredTokens,
  ACCESS_TOKEN_EXPIRY,
  REFRESH_TOKEN_EXPIRY,
};

