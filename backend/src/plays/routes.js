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

function getCurrentPrices(db) {
  const rows = db.prepare('SELECT quiz_type, price FROM prices').all();
  const prices = { SILVER: 11, GOLD: 55, DIAMOND: 110 };
  for (const r of rows) prices[r.quiz_type] = r.price;
  return prices;
}

function assertAssigned(db, superUserId, vendorUserId) {
  const row = db
    .prepare('SELECT 1 AS ok FROM assignments WHERE super_user_id = ? AND vendor_user_id = ?')
    .get(superUserId, vendorUserId);
  if (!row) {
    const err = new Error('Vendor not assigned to this Super');
    err.statusCode = 403;
    throw err;
  }
}

router.post('/', requireAuth, (req, res) => {
  const { vendorUserId, date, hour, quizType, selectedNumber, tickets } = req.body || {};

  const qt = normalizeQuizType(quizType);
  if (!qt) return res.status(400).json({ ok: false, error: 'Invalid quizType' });

  try {
    assertDate(date);
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const sn = Number(selectedNumber);
  const tk = Number(tickets);

  if (!Number.isInteger(sn) || sn < 0 || sn > 9) {
    return res.status(400).json({ ok: false, error: 'selectedNumber must be 0-9' });
  }
  if (!Number.isInteger(tk) || tk <= 0) {
    return res.status(400).json({ ok: false, error: 'tickets must be a positive integer' });
  }

  const db = getDb();

  let targetVendorId;
  if (req.user.role === 'VENDOR') {
    targetVendorId = req.user.id;
  } else {
    targetVendorId = Number(vendorUserId);
    if (!targetVendorId) return res.status(400).json({ ok: false, error: 'vendorUserId required' });

    const vendor = db.prepare('SELECT id, role FROM users WHERE id = ?').get(targetVendorId);
    if (!vendor || vendor.role !== 'VENDOR') {
      return res.status(400).json({ ok: false, error: 'vendorUserId must be a VENDOR' });
    }

    if (req.user.role === 'SUPER') {
      try {
        assertAssigned(db, req.user.id, targetVendorId);
      } catch (e) {
        return res.status(e.statusCode || 403).json({ ok: false, error: e.message });
      }
    }
  }

  const slot = ensureSlot(date, Number(hour));

  // If any result has been published for this slot, the slot is closed.
  const published = db.prepare('SELECT 1 AS ok FROM results WHERE slot_id = ? LIMIT 1').get(slot.id);
  if (published) {
    return res.status(409).json({ ok: false, error: 'SLOT CLOSED: result already published' });
  }

  const prices = getCurrentPrices(db);
  const priceEach = prices[qt];
  const totalBet = priceEach * tk;

  try {
    const info = db
      .prepare(
        `INSERT INTO plays
         (vendor_user_id, slot_id, quiz_type, selected_number, tickets, price_each, total_bet, created_by_user_id, created_at)
         VALUES
         (?, ?, ?, ?, ?, ?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      )
      .run(targetVendorId, slot.id, qt, sn, tk, priceEach, totalBet, req.user.id);

    res.status(201).json({ ok: true, playId: info.lastInsertRowid });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ ok: false, error: 'LOCKED: quiz already played for this slot' });
    }
    throw e;
  }
});

router.get('/lock-status', requireAuth, (req, res) => {
  const { vendorUserId, date, hour } = req.query;

  try {
    assertDate(String(date));
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const db = getDb();

  let targetVendorId;
  if (req.user.role === 'VENDOR') {
    targetVendorId = req.user.id;
  } else {
    targetVendorId = Number(vendorUserId);
    if (!targetVendorId) return res.status(400).json({ ok: false, error: 'vendorUserId required' });

    if (req.user.role === 'SUPER') {
      try {
        assertAssigned(db, req.user.id, targetVendorId);
      } catch (e) {
        return res.status(403).json({ ok: false, error: e.message });
      }
    }
  }

  const slot = db
    .prepare('SELECT id FROM slots WHERE slot_date = ? AND slot_hour = ?')
    .get(String(date), Number(hour));

  if (!slot) return res.json({ ok: true, locked: { SILVER: false, GOLD: false, DIAMOND: false } });

  // If any result has been published for this slot, treat all quizzes as locked.
  const published = db.prepare('SELECT 1 AS ok FROM results WHERE slot_id = ? LIMIT 1').get(slot.id);
  if (published) {
    return res.json({ ok: true, locked: { SILVER: true, GOLD: true, DIAMOND: true } });
  }

  const rows = db
    .prepare('SELECT quiz_type FROM plays WHERE vendor_user_id = ? AND slot_id = ?')
    .all(targetVendorId, slot.id);

  const locked = { SILVER: false, GOLD: false, DIAMOND: false };
  for (const r of rows) locked[r.quiz_type] = true;

  res.json({ ok: true, locked });
});

// VENDOR: fetch what I played for a given slot
// Query: ?date=YYYY-MM-DD&hour=0-23
// SUPER/ADMIN: can pass vendorUserId
router.get('/mine', requireAuth, (req, res) => {
  const { vendorUserId, date, hour } = req.query;

  try {
    assertDate(String(date));
    assertHour(Number(hour));
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  const db = getDb();

  let targetVendorId;
  if (req.user.role === 'VENDOR') {
    targetVendorId = req.user.id;
  } else {
    targetVendorId = Number(vendorUserId);
    if (!targetVendorId) return res.status(400).json({ ok: false, error: 'vendorUserId required' });

    const vendor = db.prepare('SELECT id, role FROM users WHERE id = ?').get(targetVendorId);
    if (!vendor || vendor.role !== 'VENDOR') {
      return res.status(400).json({ ok: false, error: 'vendorUserId must be a VENDOR' });
    }

    if (req.user.role === 'SUPER') {
      try {
        assertAssigned(db, req.user.id, targetVendorId);
      } catch (e) {
        return res.status(e.statusCode || 403).json({ ok: false, error: e.message });
      }
    }
  }

  const slot = db
    .prepare('SELECT id FROM slots WHERE slot_date = ? AND slot_hour = ?')
    .get(String(date), Number(hour));

  if (!slot) return res.json({ ok: true, rows: [] });

  const rows = db
    .prepare(
      `SELECT
         p.id,
         p.quiz_type AS quizType,
         p.selected_number AS selectedNumber,
         st.title AS selectedTitle,
         p.tickets AS tickets,
         p.price_each AS priceEach,
         p.total_bet AS totalBet,
         p.created_at AS createdAt
       FROM plays p
       LEFT JOIN stories s ON s.slot_id = p.slot_id AND s.quiz_type = p.quiz_type
       LEFT JOIN story_titles st ON st.story_id = s.id AND st.number = p.selected_number
       WHERE p.vendor_user_id = ? AND p.slot_id = ?
       ORDER BY p.quiz_type`
    )
    .all(targetVendorId, slot.id);

  res.json({ ok: true, rows });
});

// ADMIN: audit trail of vendor plays (who played what, for which slot, and when)
// Query: ?date=YYYY-MM-DD&hour=0-23&vendorUserId=123&vendor=rahul&quizType=SILVER&limit=100&offset=0
router.get('/audit', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { date, hour, vendorUserId, vendor, vendorUsername, quizType, limit, offset } = req.query;

  const qt = quizType ? normalizeQuizType(quizType) : null;
  if (quizType && !qt) return res.status(400).json({ ok: false, error: 'Invalid quizType' });

  if (date) {
    try {
      assertDate(String(date));
    } catch (e) {
      return res.status(400).json({ ok: false, error: e.message });
    }
  }

  let hourNum = null;
  if (hour !== undefined && hour !== null && String(hour).length > 0) {
    hourNum = Number(hour);
    try {
      assertHour(hourNum);
    } catch (e) {
      return res.status(400).json({ ok: false, error: e.message });
    }
  }

  const vid = vendorUserId ? Number(vendorUserId) : null;
  if (vendorUserId && !vid) return res.status(400).json({ ok: false, error: 'Invalid vendorUserId' });

  const vendorQRaw = String(vendorUsername || vendor || '').trim();
  const vendorQ = vendorQRaw.length ? vendorQRaw : null;

  const limRaw = limit ? Number(limit) : 100;
  const offRaw = offset ? Number(offset) : 0;
  const lim = Number.isInteger(limRaw) ? Math.min(Math.max(limRaw, 1), 500) : 100;
  const off = Number.isInteger(offRaw) && offRaw >= 0 ? offRaw : 0;

  const db = getDb();

  const where = [];
  const args = [];
  if (date) {
    where.push('sl.slot_date = ?');
    args.push(String(date));
  }
  if (hourNum !== null) {
    where.push('sl.slot_hour = ?');
    args.push(hourNum);
  }
  if (vid) {
    where.push('p.vendor_user_id = ?');
    args.push(vid);
  }
  if (!vid && vendorQ) {
    if (/^\d+$/.test(vendorQ)) {
      where.push('p.vendor_user_id = ?');
      args.push(Number(vendorQ));
    } else {
      where.push('LOWER(vu.username) LIKE ?');
      args.push(`%${vendorQ.toLowerCase()}%`);
    }
  }
  if (qt) {
    where.push('p.quiz_type = ?');
    args.push(qt);
  }
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const rows = db
    .prepare(
      `SELECT
         p.id,
         p.vendor_user_id,
         vu.username AS vendor_username,
         sl.slot_date,
         sl.slot_hour,
         p.quiz_type,
         p.selected_number,
         st.title AS selected_title,
         p.tickets,
         p.price_each,
         p.total_bet,
         p.created_by_user_id,
         cu.username AS created_by_username,
         cu.role AS created_by_role,
         p.created_at
       FROM plays p
       JOIN users vu ON vu.id = p.vendor_user_id
       JOIN slots sl ON sl.id = p.slot_id
       JOIN users cu ON cu.id = p.created_by_user_id
       LEFT JOIN stories s ON s.slot_id = p.slot_id AND s.quiz_type = p.quiz_type
       LEFT JOIN story_titles st ON st.story_id = s.id AND st.number = p.selected_number
       ${whereSql}
       ORDER BY p.created_at DESC
       LIMIT ? OFFSET ?`
    )
    .all(...args, lim, off);

  const totalRow = db
    .prepare(
      `SELECT COUNT(1) AS total
       FROM plays p
       JOIN users vu ON vu.id = p.vendor_user_id
       JOIN slots sl ON sl.id = p.slot_id
       ${whereSql}`
    )
    .get(...args);

  res.json({ ok: true, total: totalRow ? totalRow.total : 0, rows, limit: lim, offset: off });
});

// ADMIN: delete play audit logs by slot date range (inclusive)
// Body: { fromDate: 'YYYY-MM-DD', toDate: 'YYYY-MM-DD' }
router.post('/audit/delete-range', requireAuth, requireRole('ADMIN'), (req, res) => {
  const fromDate = String(req.body?.fromDate || '').trim();
  const toDate = String(req.body?.toDate || '').trim();

  try {
    assertDate(fromDate);
    assertDate(toDate);
  } catch (e) {
    return res.status(400).json({ ok: false, error: e.message });
  }

  if (fromDate > toDate) {
    return res.status(400).json({ ok: false, error: 'fromDate must be <= toDate' });
  }

  const db = getDb();

  const tx = db.transaction(() => {
    // Delete plays for all slots in range.
    const info = db
      .prepare(
        `DELETE FROM plays
         WHERE slot_id IN (
           SELECT id FROM slots WHERE slot_date BETWEEN ? AND ?
         )`
      )
      .run(fromDate, toDate);
    return info.changes || 0;
  });

  const deleted = tx();
  res.json({ ok: true, deleted });
});

module.exports = router;
