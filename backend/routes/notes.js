const express = require('express');
const { body, validationResult } = require('express-validator');
const { getDatabase } = require('../database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// POST /notes
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
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const db = getDatabase();

    db.run(
      'INSERT INTO notes (user_id, title, content) VALUES (?, ?, ?)',
      [req.user.id, title, content],
      function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to create note' });
        }

        // Fetch the created note
        db.get('SELECT * FROM notes WHERE id = ?', [this.lastID], (err, note) => {
          if (err) {
            return res.status(500).json({ error: 'Failed to fetch created note' });
          }
          res.status(201).json(note);
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET /notes
router.get('/', (req, res) => {
  try {
    const db = getDatabase();
    db.all(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id],
      (err, notes) => {
        if (err) {
          return res.status(500).json({ error: 'Failed to fetch notes' });
        }
        res.json(notes);
      }
    );
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// PUT /notes/:id
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
], (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { title, content } = req.body;
    const db = getDatabase();

    // First verify the note belongs to the user
    db.get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id], (err, note) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      // Update note
      const updateFields = [];
      const updateValues = [];

      if (title !== undefined) {
        updateFields.push('title = ?');
        updateValues.push(title);
      }
      if (content !== undefined) {
        updateFields.push('content = ?');
        updateValues.push(content);
      }

      if (updateFields.length === 0) {
        return res.status(400).json({ error: 'No fields to update' });
      }

      updateFields.push('updated_at = CURRENT_TIMESTAMP');
      updateValues.push(id);

      db.run(
        `UPDATE notes SET ${updateFields.join(', ')} WHERE id = ?`,
        updateValues,
        function(err) {
          if (err) {
            return res.status(500).json({ error: 'Failed to update note' });
          }

          // Fetch updated note
          db.get('SELECT * FROM notes WHERE id = ?', [id], (err, updatedNote) => {
            if (err) {
              return res.status(500).json({ error: 'Failed to fetch updated note' });
            }
            res.json(updatedNote);
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// DELETE /notes/:id
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;
    const db = getDatabase();

    // Verify the note belongs to the user
    db.get('SELECT * FROM notes WHERE id = ? AND user_id = ?', [id, req.user.id], (err, note) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      if (!note) {
        return res.status(404).json({ error: 'Note not found' });
      }

      // Delete note
      db.run('DELETE FROM notes WHERE id = ?', [id], function(err) {
        if (err) {
          return res.status(500).json({ error: 'Failed to delete note' });
        }
        res.json({ message: 'Note deleted successfully' });
      });
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

