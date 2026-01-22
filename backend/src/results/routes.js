const express = require('express');

const { getDb } = require('../../db/db');
const { requireAuth, requireRole } = require('../auth/middleware');
const { ensureSlot, assertDate, assertHour } = require('../slots/service');

const router = express.Router();

function normalizeQuizType(q) {
  const v = String(q || '').toUpperCase();
  if (!['SILVER', 'GOLD', 'DIAMOND'].includes(v)) return null;
  return v;
}

function parseWinningNumber(value) {
  const n = Number(value);
  if (!Number.isInteger(n) || n < 0 || n > 9) return null;
  return n;
}

// ADMIN/SUPER manual result publish
router.post('/publish', requireAuth, requireRole(['ADMIN', 'SUPER']), (req, res) => {
  const { date, hour, quizType, winningNumber } = req.body || {};

  try {
    assertDate(date);
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const qt = normalizeQuizType(quizType);
  if (!qt) return res.status(400).json({ ok: false, error: 'Invalid quizType' });

  const wn = parseWinningNumber(winningNumber);
  if (wn === null) {
    return res.status(400).json({ ok: false, error: 'winningNumber must be 0-9' });
  }

  const db = getDb();
  const slot = ensureSlot(date, Number(hour));

  // Require story to exist so public results can show title text
  const story = db
    .prepare('SELECT id FROM stories WHERE slot_id = ? AND quiz_type = ?')
    .get(slot.id, qt);
  if (!story) return res.status(400).json({ ok: false, error: 'Story not set for this slot and quizType' });

  const titleRow = db
    .prepare('SELECT title FROM story_titles WHERE story_id = ? AND number = ?')
    .get(story.id, wn);

  const tx = db.transaction(() => {
    db.prepare(
      `INSERT INTO results (slot_id, quiz_type, winning_number, published_by_user_id, published_at)
       VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
    ).run(slot.id, qt, wn, req.user.id);

    db.prepare(
      `INSERT INTO audit_result_publishes (actor_user_id, slot_id, quiz_type, winning_number, created_at)
       VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
    ).run(req.user.id, slot.id, qt, wn);
  });

  try {
    tx();
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ ok: false, error: 'Result already published for this slot and quizType' });
    }
    throw e;
  }

  res.status(201).json({ ok: true, title: titleRow ? titleRow.title : null });
});

// ADMIN/SUPER manual result publish for all 3 quizzes of a slot
// body: { date, hour, winningNumbers: { SILVER: 0-9, GOLD: 0-9, DIAMOND: 0-9 } }
router.post('/publish-batch', requireAuth, requireRole(['ADMIN', 'SUPER']), (req, res) => {
  const { date, hour, winningNumbers } = req.body || {};

  try {
    assertDate(date);
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  if (!winningNumbers || typeof winningNumbers !== 'object') {
    return res.status(400).json({ ok: false, error: 'winningNumbers object required' });
  }

  const requiredTypes = ['SILVER', 'GOLD', 'DIAMOND'];
  const parsed = {};
  for (const qt of requiredTypes) {
    const n = parseWinningNumber(winningNumbers[qt]);
    if (n === null) return res.status(400).json({ ok: false, error: `${qt}: winningNumber must be 0-9` });
    parsed[qt] = n;
  }

  const db = getDb();
  const slot = ensureSlot(date, Number(hour));

  // Pre-check: results already published?
  const existingResults = db
    .prepare(
      `SELECT quiz_type FROM results WHERE slot_id = ? AND quiz_type IN ('SILVER','GOLD','DIAMOND')`
    )
    .all(slot.id);
  if (existingResults.length > 0) {
    return res.status(409).json({ ok: false, error: 'One or more results already published for this slot', existing: existingResults.map((r) => r.quiz_type) });
  }

  // Require stories exist so public results can show title text
  const storyByQuiz = new Map(
    db
      .prepare(
        `SELECT id, quiz_type
         FROM stories
         WHERE slot_id = ? AND quiz_type IN ('SILVER','GOLD','DIAMOND')`
      )
      .all(slot.id)
      .map((r) => [r.quiz_type, r.id])
  );

  const missingStories = requiredTypes.filter((qt) => !storyByQuiz.has(qt));
  if (missingStories.length > 0) {
    return res
      .status(400)
      .json({ ok: false, error: 'Story not set for this slot for one or more quizTypes', missing: missingStories });
  }

  const getTitle = db.prepare('SELECT title FROM story_titles WHERE story_id = ? AND number = ?');

  const tx = db.transaction(() => {
    const published = {};

    for (const qt of requiredTypes) {
      const wn = parsed[qt];
      const storyId = storyByQuiz.get(qt);
      const titleRow = getTitle.get(storyId, wn);

      db.prepare(
        `INSERT INTO results (slot_id, quiz_type, winning_number, published_by_user_id, published_at)
         VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      ).run(slot.id, qt, wn, req.user.id);

      db.prepare(
        `INSERT INTO audit_result_publishes (actor_user_id, slot_id, quiz_type, winning_number, created_at)
         VALUES (?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      ).run(req.user.id, slot.id, qt, wn);

      published[qt] = { winningNumber: wn, title: titleRow ? titleRow.title : null };
    }

    return published;
  });

  try {
    const published = tx();
    return res.status(201).json({ ok: true, slotId: slot.id, published });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ ok: false, error: 'Result already published for this slot and quizType' });
    }
    throw e;
  }
});

// Authenticated results for dashboards
router.get('/by-date', requireAuth, (req, res) => {
  const { date } = req.query;
  try {
    assertDate(String(date));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const db = getDb();
  const slots = db
    .prepare('SELECT id, slot_date, slot_hour FROM slots WHERE slot_date = ? ORDER BY slot_hour')
    .all(String(date));

  const slotIds = slots.map((s) => s.id);
  if (slotIds.length === 0) return res.json({ ok: true, date: String(date), results: [] });

  const results = db
    .prepare(
      `SELECT r.slot_id, r.quiz_type, r.winning_number, r.published_at
       FROM results r
       WHERE r.slot_id IN (${slotIds.map(() => '?').join(',')})`
    )
    .all(...slotIds);

  res.json({ ok: true, date: String(date), slots: slots.map((s) => ({ id: s.id, hour: s.slot_hour })), results });
});

module.exports = router;
