const express = require('express');

const { getDb } = require('../../db/db');
const { requireAuth, requireRole } = require('../auth/middleware');
const { ensureSlot, assertDate, assertHour } = require('../slots/service');
const { STORY_LIBRARY } = require('./library');
const { generateSlotSuggestions } = require('./suggest');

const router = express.Router();

function nowInTimeZone(tz) {
  // Returns { date: 'YYYY-MM-DD', hour: Number }
  // Uses Intl so it works regardless of server local timezone.
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

function normalizeQuizType(q) {
  const v = String(q || '').toUpperCase();
  if (!['SILVER', 'GOLD', 'DIAMOND'].includes(v)) return null;
  return v;
}

function validateTitles(titles) {
  if (!Array.isArray(titles) || titles.length !== 10) return 'Titles must be an array of 10 strings mapped 0-9';
  for (let i = 0; i < 10; i++) {
    const t = titles[i];
    if (typeof t !== 'string' || t.trim().length < 1) return 'Each title must be a non-empty string';
  }
  return null;
}

function parseCorrectNumber(value) {
  // Keep schema requirement, but results are always manual.
  const cn = Number(value);
  if (!Number.isInteger(cn) || cn < 0 || cn > 9) return null;
  return cn;
}

// ADMIN story creation (manual)
router.post('/manual', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { date, hour, quizType, summary, titles, correctNumber } = req.body || {};

  try {
    assertDate(date);
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const qt = normalizeQuizType(quizType);
  if (!qt) return res.status(400).json({ ok: false, error: 'Invalid quizType' });

  if (!summary || String(summary).trim().length < 10) {
    return res.status(400).json({ ok: false, error: 'Summary too short' });
  }

  const titlesErr = validateTitles(titles);
  if (titlesErr) return res.status(400).json({ ok: false, error: titlesErr });

  const cn = parseCorrectNumber(correctNumber);
  if (cn === null) {
    return res.status(400).json({ ok: false, error: 'correctNumber must be 0-9' });
  }

  const db = getDb();
  const slot = ensureSlot(date, Number(hour));

  // Safety: don't change stories if plays/results already exist for the slot.
  const hasResults = db.prepare('SELECT 1 AS ok FROM results WHERE slot_id = ? LIMIT 1').get(slot.id);
  if (hasResults) return res.status(409).json({ ok: false, error: 'Cannot change story: result already published for this slot' });
  const hasPlays = db.prepare('SELECT 1 AS ok FROM plays WHERE slot_id = ? LIMIT 1').get(slot.id);
  if (hasPlays) return res.status(409).json({ ok: false, error: 'Cannot change story: plays already exist for this slot' });

  const existing = db
    .prepare('SELECT id, source FROM stories WHERE slot_id = ? AND quiz_type = ?')
    .get(slot.id, qt);
  if (existing && !['PUBLIC_DOMAIN', 'AUTO'].includes(existing.source)) {
    return res.status(409).json({ ok: false, error: 'Manual story already exists for that slot and quizType' });
  }

  const tx = db.transaction(() => {
    if (existing && ['PUBLIC_DOMAIN', 'AUTO'].includes(existing.source)) {
      db.prepare('DELETE FROM stories WHERE id = ?').run(existing.id);
    }
    const info = db
      .prepare(
        `INSERT INTO stories (slot_id, quiz_type, source, summary, correct_number, created_by_user_id, created_at)
         VALUES (?, ?, 'MANUAL', ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      )
      .run(slot.id, qt, String(summary).trim(), cn, req.user.id);

    const storyId = info.lastInsertRowid;

    const insertTitle = db.prepare(
      'INSERT INTO story_titles (story_id, number, title) VALUES (?, ?, ?)'
    );

    for (let i = 0; i < 10; i++) {
      insertTitle.run(storyId, i, String(titles[i]).trim());
    }

    return storyId;
  });

  try {
    const storyId = tx();
    res.status(201).json({ ok: true, storyId });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ ok: false, error: 'Story already exists for that slot and quizType' });
    }
    throw e;
  }
});

// ADMIN: list available public-domain inspired templates
router.get('/library', requireAuth, requireRole('ADMIN'), (req, res) => {
  const items = STORY_LIBRARY.map((t) => ({
    id: t.id,
    name: t.name,
    tags: t.tags,
    blurb: t.blurb,
  }));
  res.json({ ok: true, items });
});

// ADMIN: get slot-based suggestions (stable per date+hour)
// Returns 3 templates + auto-generated 0-9 titles for SILVER/GOLD/DIAMOND.
router.get('/suggestions', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { date, hour } = req.query;

  try {
    assertDate(String(date));
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const out = generateSlotSuggestions(String(date), Number(hour));
  res.json({ ok: true, date: String(date), hour: Number(hour), suggestions: out });
});

// ADMIN story creation (manual) for all 3 quizzes of a slot
// body: { date, hour, quizzes: { SILVER: {summary,titles,correctNumber}, GOLD: {...}, DIAMOND: {...} } }
router.post('/manual-batch', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { date, hour, quizzes } = req.body || {};

  try {
    assertDate(date);
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  if (!quizzes || typeof quizzes !== 'object') {
    return res.status(400).json({ ok: false, error: 'quizzes object required' });
  }

  const requiredTypes = ['SILVER', 'GOLD', 'DIAMOND'];
  for (const qt of requiredTypes) {
    const q = quizzes[qt];
    if (!q) return res.status(400).json({ ok: false, error: `Missing quizzes.${qt}` });
    if (!q.summary || String(q.summary).trim().length < 10) {
      return res.status(400).json({ ok: false, error: `Summary too short for ${qt}` });
    }
    const titlesErr = validateTitles(q.titles);
    if (titlesErr) return res.status(400).json({ ok: false, error: `${qt}: ${titlesErr}` });
    const cn = parseCorrectNumber(q.correctNumber);
    if (cn === null) return res.status(400).json({ ok: false, error: `${qt}: correctNumber must be 0-9` });
  }

  const db = getDb();
  const slot = ensureSlot(date, Number(hour));

  // Safety: don't change stories if plays/results already exist for the slot.
  const hasResults = db.prepare('SELECT 1 AS ok FROM results WHERE slot_id = ? LIMIT 1').get(slot.id);
  if (hasResults) return res.status(409).json({ ok: false, error: 'Cannot change stories: result already published for this slot' });
  const hasPlays = db.prepare('SELECT 1 AS ok FROM plays WHERE slot_id = ? LIMIT 1').get(slot.id);
  if (hasPlays) return res.status(409).json({ ok: false, error: 'Cannot change stories: plays already exist for this slot' });

  const existing = db
    .prepare(
      `SELECT id, quiz_type, source
       FROM stories
       WHERE slot_id = ? AND quiz_type IN ('SILVER','GOLD','DIAMOND')`
    )
    .all(slot.id);

  const nonAuto = existing.filter((r) => !['PUBLIC_DOMAIN', 'AUTO'].includes(r.source));
  if (nonAuto.length > 0) {
    return res.status(409).json({ ok: false, error: 'One or more manual stories already exist for this slot', existing: nonAuto.map((r) => r.quiz_type) });
  }

  const tx = db.transaction(() => {
    if (existing.length > 0) {
      // Delete AUTO stories; titles cascade.
      db.prepare(
        `DELETE FROM stories
         WHERE slot_id = ? AND quiz_type IN ('SILVER','GOLD','DIAMOND') AND source IN ('PUBLIC_DOMAIN','AUTO')`
      ).run(slot.id);
    }

    const insertStory = db.prepare(
      `INSERT INTO stories (slot_id, quiz_type, source, summary, correct_number, created_by_user_id, created_at)
       VALUES (?, ?, 'MANUAL', ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
    );
    const insertTitle = db.prepare(
      'INSERT INTO story_titles (story_id, number, title) VALUES (?, ?, ?)'
    );

    const created = {};
    for (const qt of requiredTypes) {
      const q = quizzes[qt];
      const cn = parseCorrectNumber(q.correctNumber);
      const info = insertStory.run(slot.id, qt, String(q.summary).trim(), cn, req.user.id);
      const storyId = info.lastInsertRowid;

      for (let i = 0; i < 10; i++) {
        insertTitle.run(storyId, i, String(q.titles[i]).trim());
      }

      created[qt] = storyId;
    }
    return created;
  });

  try {
    const created = tx();
    return res.status(201).json({ ok: true, slotId: slot.id, stories: created });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ ok: false, error: 'Story already exists for that slot and quizType' });
    }
    throw e;
  }
});

// View stories for a slot (ADMIN/SUPER/VENDOR)
router.get('/slot', requireAuth, (req, res) => {
  const { date, hour, auto } = req.query;

  try {
    assertDate(String(date));
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const db = getDb();
  const dateStr = String(date);
  const hourNum = Number(hour);

  // Ensure slot row exists if auto requested.
  let slot = db
    .prepare('SELECT id, slot_date, slot_hour FROM slots WHERE slot_date = ? AND slot_hour = ?')
    .get(dateStr, hourNum);

  if (!slot) {
    if (String(auto) === '1') {
      const s = ensureSlot(dateStr, hourNum);
      slot = { id: s.id, slot_date: s.date, slot_hour: s.hour };
    } else {
      return res.json({ ok: true, slot: null, quizzes: [] });
    }
  }

  // Optional auto-create stories when missing.
  if (String(auto) === '1') {
    // Vendors are restricted to current slot only.
    if (req.user?.role === 'VENDOR') {
      const { date: today, hour: currentHour } = nowInTimeZone('Asia/Kolkata');
      if (dateStr !== today || hourNum !== currentHour) {
        return res.status(403).json({ ok: false, error: 'Vendors can only access current slot stories' });
      }
    }

    const existing = db
      .prepare(
        `SELECT quiz_type FROM stories WHERE slot_id = ? AND quiz_type IN ('SILVER','GOLD','DIAMOND')`
      )
      .all(slot.id);
    const have = new Set(existing.map((r) => r.quiz_type));
    const missing = ['SILVER', 'GOLD', 'DIAMOND'].filter((qt) => !have.has(qt));

    if (missing.length > 0) {
      const suggestions = generateSlotSuggestions(dateStr, hourNum);

      const tx = db.transaction(() => {
        const insertStory = db.prepare(
          `INSERT INTO stories (slot_id, quiz_type, source, summary, correct_number, created_by_user_id, created_at)
           VALUES (?, ?, 'PUBLIC_DOMAIN', ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
        );
        const insertTitle = db.prepare('INSERT INTO story_titles (story_id, number, title) VALUES (?, ?, ?)');

        for (const qt of missing) {
          const sug = suggestions[qt];
          const info = insertStory.run(slot.id, qt, String(sug.summary).trim(), Number(sug.correctNumber), req.user.id);
          const storyId = info.lastInsertRowid;
          for (let i = 0; i < 10; i++) {
            insertTitle.run(storyId, i, String(sug.titles[i]).trim());
          }
        }
      });

      try {
        tx();
      } catch (e) {
        // If raced, ignore unique constraints and proceed to read.
        if (!(e && e.code === 'SQLITE_CONSTRAINT_UNIQUE')) throw e;
      }
    }
  }

  const stories = db
    .prepare(
      `SELECT id, quiz_type, source, summary, correct_number
       FROM stories
       WHERE slot_id = ?
       ORDER BY quiz_type`
    )
    .all(slot.id);

  const titles = db
    .prepare(
      `SELECT story_id, number, title
       FROM story_titles
       WHERE story_id IN (${stories.map(() => '?').join(',') || 'NULL'})
       ORDER BY story_id, number`
    )
    .all(...stories.map((s) => s.id));

  const titlesByStory = new Map();
  for (const t of titles) {
    if (!titlesByStory.has(t.story_id)) titlesByStory.set(t.story_id, Array(10).fill(''));
    titlesByStory.get(t.story_id)[t.number] = t.title;
  }

  const quizzes = stories.map((s) => ({
    storyId: s.id,
    quizType: s.quiz_type,
    source: s.source === 'PUBLIC_DOMAIN' ? 'AUTO' : s.source,
    summary: s.summary,
    titles: titlesByStory.get(s.id) || Array(10).fill(''),
    ...(req.user?.role === 'VENDOR' ? {} : { correctNumber: s.correct_number }),
  }));

  res.json({ ok: true, slot: { date: slot.slot_date, hour: slot.slot_hour }, quizzes });
});

module.exports = router;
