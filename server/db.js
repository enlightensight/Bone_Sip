'use strict';
/**
 * BONE SIP database: one SQLite file, using Node's built-in node:sqlite
 * (no dependencies). Holds accounts, login sessions, each user's saved app
 * state and one row per user per day (what they ate, which moves they did).
 *
 * The file lives in DATA_DIR (default ./data, git-ignored). Back it up like
 * any other file; on Docker mount DATA_DIR as a volume so it survives deploys.
 */

const fs = require('fs');
const path = require('path');
const { DatabaseSync } = require('node:sqlite');

const SCHEMA = `
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    phone         TEXT NOT NULL UNIQUE,
    name          TEXT NOT NULL DEFAULT '',
    created_at    TEXT NOT NULL,
    last_seen_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS otp_codes (
    phone       TEXT PRIMARY KEY,
    code_hash   TEXT NOT NULL,
    expires_at  INTEGER NOT NULL,
    attempts    INTEGER NOT NULL DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS otp_sends (
    phone    TEXT NOT NULL,
    ip       TEXT NOT NULL,
    sent_at  INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS otp_sends_time ON otp_sends (sent_at);

  CREATE TABLE IF NOT EXISTS sessions (
    token_hash    TEXT PRIMARY KEY,
    user_id       INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at    INTEGER NOT NULL,
    expires_at    INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS sessions_user ON sessions (user_id);

  CREATE TABLE IF NOT EXISTS user_state (
    user_id     INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    data        TEXT NOT NULL,
    updated_at  TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS daily_logs (
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    day         TEXT NOT NULL,            -- YYYY-MM-DD in the user's local time
    meals       TEXT NOT NULL,            -- JSON [{slot, name, done}]
    moves       TEXT NOT NULL,            -- JSON [{id, name, done}]
    diet_done   INTEGER NOT NULL,
    diet_total  INTEGER NOT NULL,
    moves_done  INTEGER NOT NULL,
    moves_total INTEGER NOT NULL,
    score       INTEGER NOT NULL DEFAULT 0,
    updated_at  TEXT NOT NULL,
    PRIMARY KEY (user_id, day)
  );

  CREATE TABLE IF NOT EXISTS admin_audit (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_user_id   INTEGER NOT NULL,
    action          TEXT NOT NULL,
    target_user_id  INTEGER,
    at              TEXT NOT NULL
  );
`;

function openDb(dataDir) {
  fs.mkdirSync(dataDir, { recursive: true });
  const db = new DatabaseSync(path.join(dataDir, 'bonesip.db'));
  db.exec(SCHEMA);
  return db;
}

module.exports = { openDb };
