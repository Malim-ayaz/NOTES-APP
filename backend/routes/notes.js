const express = require('express');
const { body, query } = require('express-validator');
const { dbGet, dbRun, dbQuery } = require('../database');
const { authenticateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');
const { handleValidationErrors, sanitizeInput } = require('../utils/validation');

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Note:
 *       type: object
 *       required:
 *         - title
 *         - content
 *       properties:
 *         id:
 *           type: integer
 *         user_id:
 *           type: integer
 *         title:
 *           type: string
 *           maxLength: 200
 *         content:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */

// All routes require authentication
router.use(authenticateToken);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Create a new note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Note created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Note'
 */
router.post('/', [
  body('title')
    .trim()
    .notEmpty()
    .withMessage('Title is required')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .trim()
    .notEmpty()
    .withMessage('Content is required')
    .isLength({ max: 10000 })
    .withMessage('Content must be less than 10000 characters'),
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { title, content } = req.body;

  // Sanitize inputs
  const sanitizedTitle = sanitizeInput(title);
  const sanitizedContent = sanitizeInput(content);

  const result = await dbRun(
    'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
    [req.user.id, sanitizedTitle, sanitizedContent]
  );
  const noteId = result.lastID;

  // Fetch the created note
  const note = await dbGet('SELECT * FROM notes WHERE id = ?', [noteId]);

  res.status(201).json(note);
}));

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get all notes with pagination and search
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *           maximum: 100
 *         description: Number of notes per page
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title or content
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 */
router.get('/', [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must be less than 100 characters'),
], handleValidationErrors, asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const offset = (page - 1) * limit;
  const search = req.query.search ? sanitizeInput(req.query.search) : null;

  let countQuery = 'SELECT COUNT(*) as total FROM notes WHERE user_id = ?';
  let notesQuery = 'SELECT * FROM notes WHERE user_id = ?';
  const params = [req.user.id];

  if (search) {
    const searchParam = `%${search}%`;
    countQuery += ' AND (title LIKE ? OR content LIKE ?)';
    notesQuery += ' AND (title LIKE ? OR content LIKE ?)';
    params.push(searchParam, searchParam);
  }

  notesQuery += ' ORDER BY updated_at DESC LIMIT ? OFFSET ?';

  // Get total count
  const countResult = await dbGet(countQuery, params.slice(0, search ? 3 : 1));
  const total = countResult.total;
  const totalPages = Math.ceil(total / limit);

  // Get notes
  const notes = await dbQuery(notesQuery, [...params, limit, offset]);

  res.json({
    notes,
    pagination: {
      page,
      limit,
      total,
      totalPages,
    },
  });
}));

/**
 * @swagger
 * /notes/{id}:
 *   put:
 *     summary: Update a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 maxLength: 200
 *               content:
 *                 type: string
 *     responses:
 *       200:
 *         description: Note updated successfully
 *       404:
 *         description: Note not found
 */
router.put('/:id', [
  body('title')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Title must be less than 200 characters'),
  body('content')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Content cannot be empty')
    .isLength({ max: 10000 })
    .withMessage('Content must be less than 10000 characters'),
], handleValidationErrors, asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { title, content } = req.body;

  // Verify the note belongs to the user
  const note = await dbGet('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  // Build update query
  const updateFields = [];
  const updateValues = [];

  if (title !== undefined) {
    updateFields.push('title = ?');
    updateValues.push(sanitizeInput(title));
  }
  if (content !== undefined) {
    updateFields.push('content = ?');
    updateValues.push(sanitizeInput(content));
  }

  if (updateFields.length === 0) {
    return res.status(400).json({ error: 'No fields to update' });
  }

  updateFields.push('updated_at = CURRENT_TIMESTAMP');
  updateValues.push(id);

  await dbRun(
    `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ?`,
    updateValues
  );

  // Fetch updated note
  const updatedNote = await dbGet('SELECT * FROM notes WHERE id = ?', [id]);

  res.json(updatedNote);
}));

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     tags: [Notes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Note deleted successfully
 *       404:
 *         description: Note not found
 */
router.delete('/:id', asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Verify the note belongs to the user
  const note = await dbGet('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id]);

  if (!note) {
    return res.status(404).json({ error: 'Note not found' });
  }

  // Delete note
  await dbRun('DELETE FROM notes WHERE id = ?', [id]);

  res.json({ message: 'Note deleted successfully' });
}));

module.exports = router;

