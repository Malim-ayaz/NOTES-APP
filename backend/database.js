const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = path.join(__dirname, 'notes.db');

let db = null;

/**
 * Get database connection with error handling
 */
function getDatabase() {
  if (!db) {
    db = new sqlite3.Database(DB_PATH, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Error opening database:', err.message);
        throw err;
      } else {
        console.log('Connected to SQLite database');
        // Enable foreign keys
        db.run('PRAGMA foreign_keys = ON');
        // Enable WAL mode for better concurrency
        db.run('PRAGMA journal_mode = WAL');
      }
    });
  }
  return db;
}

/**
 * Promisified database query helper
 */
function dbQuery(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows);
    });
  });
}

/**
 * Promisified database get helper
 */
function dbGet(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
}

/**
 * Promisified database run helper
 */
function dbRun(sql, params = []) {
  return new Promise((resolve, reject) => {
    const database = getDatabase();
    database.run(sql, params, function(err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

async function initDatabase() {
  const database = getDatabase();
  
  try {
    // Create users table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create refresh_tokens table for token management
    await dbRun(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        token TEXT UNIQUE NOT NULL,
        expires_at DATETIME NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create index on refresh_tokens for faster lookups
    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id 
      ON refresh_tokens(user_id)
    `);

    // Create notes table
    await dbRun(`
      CREATE TABLE IF NOT EXISTS notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Create index on notes for faster queries
    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_notes_user_id 
      ON notes(user_id)
    `);

    await dbRun(`
      CREATE INDEX IF NOT EXISTS idx_notes_updated_at 
      ON notes(updated_at DESC)
    `);

    console.log('Database tables initialized successfully');
  } catch (err) {
    console.error('Error initializing database:', err);
    throw err;
  }
}

function closeDatabase() {
  if (db) {
    db.close((err) => {
      if (err) {
        console.error('Error closing database:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
}

module.exports = {
  getDatabase,
  initDatabase,
  closeDatabase,
  dbQuery,
  dbGet,
  dbRun,
};

