const express = require('express');
const bcrypt = require('bcrypt');

const { getDb } = require('../../db/db');
const { signToken } = require('./jwt');
const { requireAuth } = require('./middleware');

const router = express.Router();

router.post('/login', (req, res) => {
  const { username, password, role } = req.body || {};

  if (!username || !password || !role) {
    return res.status(400).json({ ok: false, error: 'username, password, role required' });
  }
  if (!['ADMIN', 'SUPER', 'VENDOR'].includes(role)) {
    return res.status(400).json({ ok: false, error: 'Invalid role' });
  }

  const db = getDb();
  const user = db
    .prepare('SELECT id, username, role, password_hash FROM users WHERE username = ? AND role = ?')
    .get(String(username).trim(), role);

  if (!user) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

  const ok = bcrypt.compareSync(String(password), user.password_hash);
  if (!ok) return res.status(401).json({ ok: false, error: 'Invalid credentials' });

  const token = signToken(user);

  return res.json({
    ok: true,
    token,
    user: { id: user.id, username: user.username, role: user.role },
  });
});

router.get('/me', requireAuth, (req, res) => {
  res.json({ ok: true, user: req.user });
});

module.exports = router;
