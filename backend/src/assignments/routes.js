const express = require('express');

const { getDb } = require('../../db/db');
const { requireAuth, requireRole } = require('../auth/middleware');

const router = express.Router();

// ADMIN: assign a vendor to a super
router.post('/', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { superUserId, vendorUserId } = req.body || {};
  const sid = Number(superUserId);
  const vid = Number(vendorUserId);

  if (!sid || !vid) {
    return res.status(400).json({ ok: false, error: 'superUserId and vendorUserId required' });
  }

  const db = getDb();
  const superUser = db.prepare('SELECT id, role FROM users WHERE id = ?').get(sid);
  const vendorUser = db.prepare('SELECT id, role FROM users WHERE id = ?').get(vid);

  if (!superUser || superUser.role !== 'SUPER') {
    return res.status(400).json({ ok: false, error: 'superUserId must be a SUPER user' });
  }
  if (!vendorUser || vendorUser.role !== 'VENDOR') {
    return res.status(400).json({ ok: false, error: 'vendorUserId must be a VENDOR user' });
  }

  try {
    db.prepare(
      `INSERT INTO assignments (super_user_id, vendor_user_id, created_at)
       VALUES (?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
    ).run(sid, vid);

    res.status(201).json({ ok: true });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ ok: false, error: 'Vendor already assigned to this Super' });
    }
    throw e;
  }
});

// ADMIN: list assignments (optionally filtered)
router.get('/', requireAuth, requireRole('ADMIN'), (req, res) => {
  const sid = req.query.superUserId ? Number(req.query.superUserId) : null;
  const vid = req.query.vendorUserId ? Number(req.query.vendorUserId) : null;

  const db = getDb();

  let rows;
  if (sid) {
    rows = db
      .prepare(
        `SELECT a.id, a.super_user_id, su.username AS super_username,
                a.vendor_user_id, vu.username AS vendor_username, a.created_at
         FROM assignments a
         JOIN users su ON su.id = a.super_user_id
         JOIN users vu ON vu.id = a.vendor_user_id
         WHERE a.super_user_id = ?
         ORDER BY a.id DESC`
      )
      .all(sid);
  } else if (vid) {
    rows = db
      .prepare(
        `SELECT a.id, a.super_user_id, su.username AS super_username,
                a.vendor_user_id, vu.username AS vendor_username, a.created_at
         FROM assignments a
         JOIN users su ON su.id = a.super_user_id
         JOIN users vu ON vu.id = a.vendor_user_id
         WHERE a.vendor_user_id = ?
         ORDER BY a.id DESC`
      )
      .all(vid);
  } else {
    rows = db
      .prepare(
        `SELECT a.id, a.super_user_id, su.username AS super_username,
                a.vendor_user_id, vu.username AS vendor_username, a.created_at
         FROM assignments a
         JOIN users su ON su.id = a.super_user_id
         JOIN users vu ON vu.id = a.vendor_user_id
         ORDER BY a.id DESC`
      )
      .all();
  }

  res.json({ ok: true, assignments: rows });
});

// SUPER: list my assigned vendors
router.get('/my-vendors', requireAuth, requireRole('SUPER'), (req, res) => {
  const db = getDb();
  const rows = db
    .prepare(
      `SELECT u.id, u.username, u.created_at
       FROM assignments a
       JOIN users u ON u.id = a.vendor_user_id
       WHERE a.super_user_id = ?
       ORDER BY u.username`
    )
    .all(req.user.id);

  res.json({ ok: true, vendors: rows });
});

module.exports = router;
