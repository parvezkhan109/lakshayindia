const express = require('express');
const bcrypt = require('bcrypt');

const { getDb } = require('../../db/db');
const { requireAuth, requireRole } = require('../auth/middleware');

const router = express.Router();

// ADMIN only
router.use(requireAuth, requireRole('ADMIN'));

router.get('/', (req, res) => {
  const role = req.query.role;
  const db = getDb();

  let rows;
  if (role) {
    rows = db
      .prepare('SELECT id, username, role, created_at FROM users WHERE role = ? ORDER BY id DESC')
      .all(String(role));
  } else {
    rows = db
      .prepare('SELECT id, username, role, created_at FROM users ORDER BY id DESC')
      .all();
  }

  res.json({ ok: true, users: rows });
});

router.post('/', (req, res) => {
  const { username, password, role } = req.body || {};

  if (!username || !password || !role) {
    return res.status(400).json({ ok: false, error: 'username, password, role required' });
  }
  if (!['SUPER', 'VENDOR'].includes(role)) {
    return res.status(400).json({ ok: false, error: 'Role must be SUPER or VENDOR' });
  }

  const cleanUsername = String(username).trim();
  if (cleanUsername.length < 3) {
    return res.status(400).json({ ok: false, error: 'Username too short' });
  }
  if (String(password).length < 6) {
    return res.status(400).json({ ok: false, error: 'Password too short' });
  }

  const db = getDb();
  const passwordHash = bcrypt.hashSync(String(password), 10);

  try {
    const info = db
      .prepare(
        `INSERT INTO users (username, password_hash, role, created_at)
         VALUES (?, ?, ?, strftime('%Y-%m-%dT%H:%M:%fZ','now'))`
      )
      .run(cleanUsername, passwordHash, role);

    res.status(201).json({ ok: true, id: info.lastInsertRowid });
  } catch (e) {
    if (e && e.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ ok: false, error: 'User already exists for that role' });
    }
    throw e;
  }
});

router.post('/:id/reset-password', (req, res) => {
  const userId = Number(req.params.id);
  const { password } = req.body || {};

  if (!userId) return res.status(400).json({ ok: false, error: 'Invalid user id' });
  if (!password || String(password).length < 6) {
    return res.status(400).json({ ok: false, error: 'Password too short' });
  }

  const db = getDb();
  const passwordHash = bcrypt.hashSync(String(password), 10);

  const info = db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, userId);
  if (info.changes === 0) return res.status(404).json({ ok: false, error: 'User not found' });

  res.json({ ok: true });
});

router.delete('/:id', (req, res) => {
  const userId = Number(req.params.id);
  if (!userId) return res.status(400).json({ ok: false, error: 'Invalid user id' });

  const db = getDb();
  const info = db.prepare('DELETE FROM users WHERE id = ?').run(userId);
  if (info.changes === 0) return res.status(404).json({ ok: false, error: 'User not found' });

  res.json({ ok: true });
});

module.exports = router;
