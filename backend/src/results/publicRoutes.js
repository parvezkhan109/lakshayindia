const express = require('express');

const { getDb } = require('../../db/db');
const { assertDate } = require('../slots/service');

const router = express.Router();

// No login required
router.get('/results', (req, res) => {
  const { date } = req.query;
  try {
    assertDate(String(date));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const db = getDb();

  const slots = db
    .prepare('SELECT id, slot_hour AS hour FROM slots WHERE slot_date = ? ORDER BY slot_hour')
    .all(String(date));

  if (slots.length === 0) return res.json({ ok: true, date: String(date), rows: [] });

  const slotIds = slots.map((s) => s.id);

  // results + title text for winning number
  const rows = db
    .prepare(
      `SELECT
         s.slot_hour AS hour,
         r.quiz_type AS quizType,
         r.winning_number AS winningNumber,
         st.title AS title,
         r.published_at AS publishedAt
       FROM results r
       JOIN slots s ON s.id = r.slot_id
       JOIN stories so ON so.slot_id = r.slot_id AND so.quiz_type = r.quiz_type
       LEFT JOIN story_titles st ON st.story_id = so.id AND st.number = r.winning_number
       WHERE r.slot_id IN (${slotIds.map(() => '?').join(',')})
       ORDER BY s.slot_hour, r.quiz_type`
    )
    .all(...slotIds);

  // Group into slot rows with Silver/Gold/Diamond columns
  const byHour = new Map();
  for (const slot of slots) {
    byHour.set(slot.hour, {
      hour: slot.hour,
      SILVER: null,
      GOLD: null,
      DIAMOND: null,
    });
  }

  for (const r of rows) {
    const row = byHour.get(r.hour);
    if (!row) continue;
    row[r.quizType] = {
      winningNumber: r.winningNumber,
      title: r.title,
      publishedAt: r.publishedAt,
    };
  }

  res.json({ ok: true, date: String(date), rows: Array.from(byHour.values()) });
});

module.exports = router;
