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

function getIndexColumns(indexName) {
  try {
    return db.prepare(`PRAGMA index_info(${JSON.stringify(indexName)})`).all().map((r) => r.name);
  } catch {
    return [];
  }
}

function migratePlaysUniqueConstraint() {
  // Older DBs had: UNIQUE(vendor_user_id, slot_id, quiz_type)
  // New schema requires: UNIQUE(vendor_user_id, slot_id, quiz_type, selected_number)
  // SQLite can't alter constraints in-place; rebuild table if needed.
  try {
    const table = db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='plays'").get();
    if (!table) return;

    const indexes = db.prepare("PRAGMA index_list('plays')").all();
    const uniqueIndexes = indexes.filter((i) => i.unique);
    const hasOldUnique = uniqueIndexes.some((i) => {
      const cols = getIndexColumns(i.name);
      return cols.join(',') === 'vendor_user_id,slot_id,quiz_type';
    });

    if (!hasOldUnique) return;

    db.exec('BEGIN');

    db.exec(`
      CREATE TABLE IF NOT EXISTS plays_new (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        vendor_user_id INTEGER NOT NULL,
        slot_id INTEGER NOT NULL,
        quiz_type TEXT NOT NULL CHECK (quiz_type IN ('SILVER','GOLD','DIAMOND')),
        selected_number INTEGER NOT NULL CHECK (selected_number BETWEEN 0 AND 9),
        tickets INTEGER NOT NULL CHECK (tickets > 0),
        price_each INTEGER NOT NULL CHECK (price_each > 0),
        total_bet INTEGER NOT NULL CHECK (total_bet > 0),
        created_by_user_id INTEGER NOT NULL,
        created_at TEXT NOT NULL,
        FOREIGN KEY(vendor_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY(slot_id) REFERENCES slots(id) ON DELETE CASCADE,
        UNIQUE(vendor_user_id, slot_id, quiz_type, selected_number)
      );
    `);

    db.exec(`
      INSERT INTO plays_new
      (id, vendor_user_id, slot_id, quiz_type, selected_number, tickets, price_each, total_bet, created_by_user_id, created_at)
      SELECT id, vendor_user_id, slot_id, quiz_type, selected_number, tickets, price_each, total_bet, created_by_user_id, created_at
      FROM plays;
    `);

    db.exec('DROP TABLE plays');
    db.exec('ALTER TABLE plays_new RENAME TO plays');

    db.exec("CREATE INDEX IF NOT EXISTS idx_plays_vendor_slot ON plays(vendor_user_id, slot_id)");
    db.exec("CREATE INDEX IF NOT EXISTS idx_plays_slot_quiz ON plays(slot_id, quiz_type)");

    db.exec('COMMIT');
    console.log('[db] migrated plays unique constraint to include selected_number');
  } catch (e) {
    try {
      db.exec('ROLLBACK');
    } catch {
      // ignore
    }
    console.warn('[db] plays migration skipped/failed:', e.message);
  }
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
  migratePlaysUniqueConstraint();
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
