const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

let db;

function getDbPath() {
  const envPath = process.env.DB_PATH || './db/luckindia.sqlite';
  // DB_PATH is treated as relative to backend/ root (where server.js lives)
  return path.isAbsolute(envPath) ? envPath : path.join(__dirname, '..', String(envPath).replace(/^\.\//, ''));
}

function ensureDirForFile(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function migrate(schemaSql) {
  db.exec(schemaSql);
}

function initDb() {
  if (db) return db;

  const dbPath = getDbPath();
  ensureDirForFile(dbPath);

  db = new Database(dbPath);

  // SQLite performance + concurrency
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  migrate(require('./schema'));
  seedIfEmpty();

  return db;
}

function seedIfEmpty() {
  const row = db.prepare('SELECT COUNT(1) AS c FROM users').get();
  if (row && row.c > 0) return;

  const bcrypt = require('bcrypt');
  const passwordHash = bcrypt.hashSync('admin123', 10);

  const insertUser = db.prepare(
    `INSERT INTO users (username, password_hash, role, created_at)
     VALUES (@username, @password_hash, @role, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
  );

  insertUser.run({ username: 'admin', password_hash: passwordHash, role: 'ADMIN' });

  db.prepare(
    `INSERT INTO prices (quiz_type, price, updated_at)
     VALUES
     ('SILVER', 11, strftime('%Y-%m-%dT%H:%M:%fZ','now')),
     ('GOLD', 55, strftime('%Y-%m-%dT%H:%M:%fZ','now')),
     ('DIAMOND', 110, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
  ).run();
}

function getDb() {
  if (!db) initDb();
  return db;
}

module.exports = { initDb, getDb };
