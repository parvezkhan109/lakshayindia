const { getDb } = require('../../db/db');

function assertDate(date) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid date');
}

function assertHour(hour) {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) throw new Error('Invalid hour');
}

function ensureSlot(slotDate, slotHour) {
  assertDate(slotDate);
  assertHour(slotHour);

  const db = getDb();
  const existing = db
    .prepare('SELECT id, slot_date, slot_hour FROM slots WHERE slot_date = ? AND slot_hour = ?')
    .get(slotDate, slotHour);

  if (existing) return existing;

  const info = db
    .prepare(
      `INSERT INTO slots (slot_date, slot_hour, created_at)
       VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
    )
    .run(slotDate, slotHour);

  return db
    .prepare('SELECT id, slot_date, slot_hour FROM slots WHERE id = ?')
    .get(info.lastInsertRowid);
}

module.exports = { ensureSlot, assertDate, assertHour };
