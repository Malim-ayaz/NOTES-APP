const express = require('express');
const bcrypt = require('bcryptjs');
const { body } = require('express-validator');
const { dbGet, dbRun } = require('../database');
const { authLimiter } = require('../middleware/rateLimiter');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors } = require('../utils/validation');
const {
  generateAccessToken,
  generateRefreshToken,
  storeRefreshToken,
  verifyRefreshToken,
  deleteRefreshToken,
} = require('../utils/token');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - username
 *         - email
 *         - password
 *       properties:
 *         username:
 *           type: string
 *           minLength: 3
 *           maxLength: 20
 *         email:
 *           type: string
 *           format: email
 *         password:
 *           type: string
 *           minLength: 6
 *     AuthResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *         token:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Register a new user
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       400:
 *         description: Validation error or user already exists
 */
router.post('/signup', authLimiter, [
  body('username')
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('Username must be between 3 and 20 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Check if user already exists
  const existingUser = await dbGet('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);

  if (existingUser) {
    return res.status(400).json({ error: 'Username or email already exists' });
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // Insert user
  const result = await dbRun(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword]
  );
  const userId = result.lastID;

  // Generate tokens
  const accessToken = generateAccessToken({ id: userId, username, email });
  const refreshToken = generateRefreshToken();

  // Store refresh token
  await storeRefreshToken(userId, refreshToken);

  res.status(201).json({
    message: 'User created successfully',
    accessToken,
    refreshToken,
    user: {
      id: userId,
      username,
      email
    }
  });
}));

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with email and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AuthResponse'
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', authLimiter, [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Find user by email
  const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Generate tokens
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken();

  // Store refresh token
  await storeRefreshToken(user.id, refreshToken);

  res.json({
    message: 'Login successful',
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      username: user.username,
      email: user.email
    }
  });
}));

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token using refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Token refreshed successfully
 *       401:
 *         description: Invalid or expired refresh token
 */
router.post('/refresh', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // Verify refresh token
  const tokenRecord = await verifyRefreshToken(refreshToken);
  if (!tokenRecord) {
    return res.status(401).json({ error: 'Invalid or expired refresh token' });
  }

  // Get user
  const user = await dbGet('SELECT id, username, email FROM users WHERE id = ?', [tokenRecord.user_id]);
  if (!user) {
    return res.status(401).json({ error: 'User not found' });
  }

  // Generate new access token
  const accessToken = generateAccessToken(user);

  res.json({
    accessToken,
  });
}));

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout and invalidate refresh token
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - refreshToken
 *             properties:
 *               refreshToken:
 *                 type: string
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', [
  body('refreshToken')
    .notEmpty()
    .withMessage('Refresh token is required'),
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;

  // Delete refresh token
  await deleteRefreshToken(refreshToken);

  res.json({ message: 'Logout successful' });
}));

module.exports = router;

