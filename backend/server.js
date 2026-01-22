const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config({ path: path.join(__dirname, '.env') });

const { initDb } = require('./db/db');
const authRoutes = require('./src/auth/routes');
const userRoutes = require('./src/users/routes');
const priceRoutes = require('./src/prices/routes');
const storyRoutes = require('./src/stories/routes');
const playRoutes = require('./src/plays/routes');
const resultRoutes = require('./src/results/routes');
const publicResultRoutes = require('./src/results/publicRoutes');
const assignmentRoutes = require('./src/assignments/routes');
const { ensureAutoStoriesForCurrentIndiaSlot } = require('./src/stories/autoFill');

const PORT = Number(process.env.PORT || 4000);

function parseCorsOrigins(value) {
  if (!value) return [];
  return String(value)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildCors() {
  const allowlist = parseCorsOrigins(process.env.CORS_ORIGINS);
  if (allowlist.length === 0) {
    return cors({ origin: false });
  }
  return cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (allowlist.includes(origin)) return cb(null, true);
      return cb(new Error('CORS blocked'));
    },
    credentials: true,
  });
}

async function main() {
  initDb();

  const app = express();

  app.disable('x-powered-by');
  app.use(morgan('dev'));
  app.use(buildCors());
  app.use(express.json({ limit: '256kb' }));

  app.get('/health', (req, res) => {
    res.json({ ok: true, name: 'lakshayindia-backend', time: new Date().toISOString() });
  });

  // Placeholder route groups (to be implemented next)
  app.get('/api', (req, res) => res.json({ ok: true }));
  app.use('/api/auth', authRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/prices', priceRoutes);
  app.use('/api/stories', storyRoutes);
  app.use('/api/plays', playRoutes);
  app.use('/api/results', resultRoutes);
  app.use('/api/public', publicResultRoutes);
  app.use('/api/assignments', assignmentRoutes);

  // Auto-fill stories for the current India slot.
  // This keeps vendor experience smooth even if admin doesn't manually add stories.
  setInterval(() => {
    try {
      ensureAutoStoriesForCurrentIndiaSlot();
    } catch (e) {
      // Keep server alive even if a background fill fails.
      console.error('[auto-stories] failed:', e.message);
    }
  }, 30 * 1000);

  // Basic error handler
  app.use((err, req, res, next) => {
    const status = err.statusCode || (err && err.message === 'CORS blocked' ? 403 : 500);
    const message = status === 500 ? 'Internal Server Error' : err.message;
    res.status(status).json({ ok: false, error: message });
  });

  app.listen(PORT, () => {
    console.log(`[luck-india] backend listening on :${PORT}`);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
