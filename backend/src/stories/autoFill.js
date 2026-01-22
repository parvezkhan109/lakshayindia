const { getDb } = require('../../db/db');
const { ensureSlot } = require('../slots/service');
const { generateSlotSuggestions } = require('./suggest');

function nowInTimeZone(tz) {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    hour12: false,
  }).formatToParts(new Date());

  const get = (type) => parts.find((p) => p.type === type)?.value;
  const year = get('year');
  const month = get('month');
  const day = get('day');
  const hour = Number(get('hour'));

  return { date: `${year}-${month}-${day}`, hour };
}

function ensureAutoStoriesForSlot(dateStr, hourNum) {
  const db = getDb();
  const slot = ensureSlot(String(dateStr), Number(hourNum));

  const existing = new Map(
    db
      .prepare(
        `SELECT quiz_type, source
         FROM stories
         WHERE slot_id = ? AND quiz_type IN ('SILVER','GOLD','DIAMOND')`
      )
      .all(slot.id)
      .map((r) => [r.quiz_type, r.source])
  );

  const missing = ['SILVER', 'GOLD', 'DIAMOND'].filter((qt) => !existing.has(qt));
  if (missing.length === 0) return { ok: true, created: 0 };

  const suggestions = generateSlotSuggestions(String(dateStr), Number(hourNum));

  const tx = db.transaction(() => {
    const insertStory = db.prepare(
      `INSERT INTO stories (slot_id, quiz_type, source, summary, correct_number, created_by_user_id, created_at)
       VALUES (?, ?, 'PUBLIC_DOMAIN', ?, ?, NULL, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
    );
    const insertTitle = db.prepare('INSERT INTO story_titles (story_id, number, title) VALUES (?, ?, ?)');

    let created = 0;
    for (const qt of missing) {
      const sug = suggestions[qt];
      const info = insertStory.run(slot.id, qt, String(sug.summary).trim(), Number(sug.correctNumber));
      const storyId = info.lastInsertRowid;
      for (let i = 0; i < 10; i++) {
        insertTitle.run(storyId, i, String(sug.titles[i]).trim());
      }
      created++;
    }

    return created;
  });

  try {
    const created = tx();
    return { ok: true, created };
  } catch (e) {
    // Race-safe: if unique constraint hit, treat as fine.
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') return { ok: true, created: 0 };
    throw e;
  }
}

function ensureAutoStoriesForCurrentIndiaSlot() {
  const cur = nowInTimeZone('Asia/Kolkata');
  return ensureAutoStoriesForSlot(cur.date, cur.hour);
}

module.exports = {
  ensureAutoStoriesForSlot,
  ensureAutoStoriesForCurrentIndiaSlot,
};
