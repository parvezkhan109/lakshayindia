const express = require('express');

const { getDb } = require('../../db/db');
const { requireAuth, requireRole } = require('../auth/middleware');

const router = express.Router();

router.get('/', requireAuth, (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT quiz_type, price, updated_at FROM prices').all();

  const prices = { SILVER: 11, GOLD: 55, DIAMOND: 110 };
  for (const r of rows) prices[r.quiz_type] = r.price;

  res.json({ ok: true, prices });
});

router.put('/', requireAuth, requireRole('ADMIN'), (req, res) => {
  const { silver, gold, diamond } = req.body || {};

  const s = Number(silver);
  const g = Number(gold);
  const d = Number(diamond);

  if (![s, g, d].every((n) => Number.isInteger(n) && n > 0)) {
    return res.status(400).json({ ok: false, error: 'Prices must be positive integers' });
  }

  const db = getDb();
  const now = "strftime('%Y-%m-%dT%H:%M:%fZ','now')";

  const stmt = db.prepare(
    `UPDATE prices SET price = ?, updated_at = ${now} WHERE quiz_type = ?`
  );

  const tx = db.transaction(() => {
    stmt.run(s, 'SILVER');
    stmt.run(g, 'GOLD');
    stmt.run(d, 'DIAMOND');
  });
  tx();

  res.json({ ok: true });
});

module.exports = router;
