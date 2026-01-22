const { verifyToken } = require('./jwt');
const { getDb } = require('../../db/db');

function getBearerToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const [type, value] = header.split(' ');
  if (type !== 'Bearer' || !value) return null;
  return value;
}

function requireAuth(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) return res.status(401).json({ ok: false, error: 'Missing token' });

    const payload = verifyToken(token);
    const userId = Number(payload.sub);

    const db = getDb();
    const user = db
      .prepare('SELECT id, username, role, created_at FROM users WHERE id = ?')
      .get(userId);

    if (!user) return res.status(401).json({ ok: false, error: 'Invalid token' });

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ ok: false, error: 'Invalid token' });
  }
}

function requireRole(roles) {
  const allow = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ ok: false, error: 'Unauthorized' });
    if (!allow.includes(req.user.role)) {
      return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
