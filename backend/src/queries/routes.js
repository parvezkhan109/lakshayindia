const express = require('express');
const bcrypt = require('bcrypt');

const { getDb } = require('../../db/db');
const { requireAuth, requireRole } = require('../auth/middleware');

const router = express.Router();

router.use(requireAuth, requireRole('ADMIN'));

router.get('/', (req, res) => {
  const db = getDb();
  const status = (req.query.status || '').toUpperCase();

  let rows;
  if (status) {
    rows = db
      .prepare(
        `SELECT id, name, contact_number AS contactNumber, email, username, status, created_at AS createdAt,
                processed_at AS processedAt
         FROM queries
         WHERE status = ?
         ORDER BY id DESC`
      )
      .all(status);
  } else {
    rows = db
      .prepare(
        `SELECT id, name, contact_number AS contactNumber, email, username, status, created_at AS createdAt,
                processed_at AS processedAt
         FROM queries
         ORDER BY id DESC`
      )
      .all();
  }

  res.json({ ok: true, queries: rows });
});

router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'Invalid id' });

  const db = getDb();
  const row = db
    .prepare(
      `SELECT id, name, father_name AS fatherName, dob, permanent_address AS permanentAddress,
              state, district, city, contact_number AS contactNumber, email, username,
              aadhar_card AS aadharCard, pan_card AS panCard,
              status, created_at AS createdAt, processed_at AS processedAt
       FROM queries
       WHERE id = ?`
    )
    .get(id);

  if (!row) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, query: row });
});

router.delete('/:id', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'Invalid id' });

  const db = getDb();
  const info = db.prepare('DELETE FROM queries WHERE id = ?').run(id);
  if (!info.changes) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, deleted: true });
});

// Alias: some deployments/proxies are more reliable with POST than DELETE.
router.post('/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'Invalid id' });

  const db = getDb();
  const info = db.prepare('DELETE FROM queries WHERE id = ?').run(id);
  if (!info.changes) return res.status(404).json({ ok: false, error: 'Not found' });
  res.json({ ok: true, deleted: true });
});

// Admin action: create a user from a query, then mark processed.
router.post('/:id/create-user', (req, res) => {
  const id = Number(req.params.id);
  if (!id) return res.status(400).json({ ok: false, error: 'Invalid id' });

  const role = String(req.body?.role || 'VENDOR').toUpperCase();
  if (!['SUPER', 'VENDOR'].includes(role)) {
    return res.status(400).json({ ok: false, error: 'role must be SUPER or VENDOR' });
  }

  const db = getDb();
  const q = db
    .prepare(
      `SELECT id, username, password, status
       FROM queries
       WHERE id = ?`
    )
    .get(id);

  if (!q) return res.status(404).json({ ok: false, error: 'Not found' });
  if (q.status !== 'NEW') {
    return res.status(409).json({ ok: false, error: 'Query already processed' });
  }

  const cleanUsername = String(q.username || '').trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ ok: false, error: 'Username too short' });
  }
  const password = String(q.password || '');
  if (password.length < 6) {
    return res.status(400).json({ ok: false, error: 'Password too short' });
  }

  const passwordHash = bcrypt.hashSync(password, 10);

  const tx = db.transaction(() => {
    const info = db
      .prepare(
        `INSERT INTO users (username, password_hash, role, created_at)
         VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      )
      .run(cleanUsername, passwordHash, role);

    db.prepare(
      `UPDATE queries
       SET status = 'PROCESSED',
           processed_by_user_id = ?,
           processed_at = strftime('%Y-%m-%dT%H:%M:%fZ','now')
       WHERE id = ?`
    ).run(req.user.id, id);

    return info.lastInsertRowid;
  });

  try {
    const userId = tx();
    res.status(201).json({ ok: true, userId });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ ok: false, error: 'User already exists for that role' });
    }
    throw e;
  }
});

module.exports = router;
