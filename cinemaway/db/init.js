/**
 * db/init.js
 * ──────────────────────────────────────────────
 * Database initialisation module for CinemaWay.
 * Uses sql.js (pure JS SQLite) with file persistence.
 * Exports a promise that resolves to the database instance.
 * ──────────────────────────────────────────────
 */

const path = require('path');
const fs   = require('fs');
const initSqlJs = require('sql.js');

// ── Ensure the data/ directory exists ────────────────────────────────
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log('[DB] Created data/ directory');
}

const DB_PATH = path.join(dataDir, 'cinemaway.db');

/**
 * Initialise the SQLite database.
 * Returns a wrapper object with helper methods.
 */
async function initDb() {
  const SQL = await initSqlJs();

  // Load existing database file or create a new one
  let db;
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    console.log(`[DB] Loaded existing database from ${DB_PATH}`);
  } else {
    db = new SQL.Database();
    console.log(`[DB] Created new database at ${DB_PATH}`);
  }

  // ── Create project_briefs table if it doesn't exist ──────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS project_briefs (
      id                  INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id          TEXT    UNIQUE NOT NULL,
      full_name           TEXT    NOT NULL,
      company             TEXT,
      email               TEXT    NOT NULL,
      phone               TEXT,
      project_title       TEXT    NOT NULL,
      project_type        TEXT,
      project_description TEXT    NOT NULL,
      services_needed     TEXT,
      estimated_budget    TEXT,
      desired_deadline    TEXT,
      project_location    TEXT,
      reference_links     TEXT,
      additional_notes    TEXT,
      status              TEXT    DEFAULT 'New Lead',
      created_at          TEXT    DEFAULT (datetime('now'))
    );
  `);
  console.log('[DB] project_briefs table ready');

  // Save to disk
  saveDb(db);

  return db;
}

/**
 * Persist the in-memory database to disk.
 */
function saveDb(db) {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

module.exports = { initDb, saveDb };
