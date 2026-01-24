module.exports = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','SUPER','VENDOR')),
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_role ON users(username, role);

-- SUPER -> VENDOR assignments
CREATE TABLE IF NOT EXISTS assignments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  super_user_id INTEGER NOT NULL,
  vendor_user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(super_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(vendor_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(super_user_id, vendor_user_id)
);
CREATE INDEX IF NOT EXISTS idx_assignments_super ON assignments(super_user_id);
CREATE INDEX IF NOT EXISTS idx_assignments_vendor ON assignments(vendor_user_id);

-- Prices per quiz type
CREATE TABLE IF NOT EXISTS prices (
  quiz_type TEXT PRIMARY KEY CHECK (quiz_type IN ('SILVER','GOLD','DIAMOND')),
  price INTEGER NOT NULL CHECK (price > 0),
  updated_at TEXT NOT NULL
);

-- Hourly slot representation (YYYY-MM-DD + HH:00)
CREATE TABLE IF NOT EXISTS slots (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_date TEXT NOT NULL,       -- YYYY-MM-DD
  slot_hour INTEGER NOT NULL CHECK (slot_hour BETWEEN 0 AND 23),
  created_at TEXT NOT NULL,
  UNIQUE(slot_date, slot_hour)
);
CREATE INDEX IF NOT EXISTS idx_slots_date_hour ON slots(slot_date, slot_hour);

-- Stories are created/imported per slot and quiz type
CREATE TABLE IF NOT EXISTS stories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_id INTEGER NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('SILVER','GOLD','DIAMOND')),
  source TEXT NOT NULL CHECK (source IN ('MANUAL','AUTO','PUBLIC_DOMAIN')),
  summary TEXT NOT NULL,
  correct_number INTEGER NOT NULL CHECK (correct_number BETWEEN 0 AND 9),
  created_by_user_id INTEGER,
  created_at TEXT NOT NULL,
  FOREIGN KEY(slot_id) REFERENCES slots(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE SET NULL,
  UNIQUE(slot_id, quiz_type)
);
CREATE INDEX IF NOT EXISTS idx_stories_slot_quiz ON stories(slot_id, quiz_type);

-- 10 titles mapped to 0-9 for a story
CREATE TABLE IF NOT EXISTS story_titles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  story_id INTEGER NOT NULL,
  number INTEGER NOT NULL CHECK (number BETWEEN 0 AND 9),
  title TEXT NOT NULL,
  FOREIGN KEY(story_id) REFERENCES stories(id) ON DELETE CASCADE,
  UNIQUE(story_id, number)
);
CREATE INDEX IF NOT EXISTS idx_story_titles_story ON story_titles(story_id);

-- Vendor plays: enforce one play per vendor per slot per quiz type
CREATE TABLE IF NOT EXISTS plays (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  vendor_user_id INTEGER NOT NULL,
  slot_id INTEGER NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('SILVER','GOLD','DIAMOND')),
  selected_number INTEGER NOT NULL CHECK (selected_number BETWEEN 0 AND 9),
  tickets INTEGER NOT NULL CHECK (tickets > 0),
  price_each INTEGER NOT NULL CHECK (price_each > 0),
  total_bet INTEGER NOT NULL CHECK (total_bet > 0),
  created_by_user_id INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(vendor_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(created_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(slot_id) REFERENCES slots(id) ON DELETE CASCADE,
  UNIQUE(vendor_user_id, slot_id, quiz_type)
);
CREATE INDEX IF NOT EXISTS idx_plays_vendor_slot ON plays(vendor_user_id, slot_id);
CREATE INDEX IF NOT EXISTS idx_plays_slot_quiz ON plays(slot_id, quiz_type);

-- Results are ALWAYS manual publish by ADMIN/SUPER
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slot_id INTEGER NOT NULL,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('SILVER','GOLD','DIAMOND')),
  winning_number INTEGER NOT NULL CHECK (winning_number BETWEEN 0 AND 9),
  published_by_user_id INTEGER NOT NULL,
  published_at TEXT NOT NULL,
  FOREIGN KEY(slot_id) REFERENCES slots(id) ON DELETE CASCADE,
  FOREIGN KEY(published_by_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(slot_id, quiz_type)
);
CREATE INDEX IF NOT EXISTS idx_results_slot_quiz ON results(slot_id, quiz_type);

-- Audit trail for result publish actions
CREATE TABLE IF NOT EXISTS audit_result_publishes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  actor_user_id INTEGER NOT NULL,
  slot_id INTEGER NOT NULL,
  quiz_type TEXT NOT NULL,
  winning_number INTEGER NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(actor_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(slot_id) REFERENCES slots(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_audit_slot ON audit_result_publishes(slot_id);

-- Public registration / contact queries (submitted from landing/register page)
CREATE TABLE IF NOT EXISTS queries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  father_name TEXT NOT NULL,
  dob TEXT NOT NULL,
  permanent_address TEXT NOT NULL,
  state TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT NOT NULL,
  contact_number TEXT NOT NULL,
  email TEXT NOT NULL,
  username TEXT NOT NULL,
  password TEXT NOT NULL,
  aadhar_card TEXT NOT NULL,
  pan_card TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('NEW','PROCESSED')),
  created_at TEXT NOT NULL,
  processed_by_user_id INTEGER,
  processed_at TEXT,
  FOREIGN KEY(processed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_queries_status_created ON queries(status, created_at);
`;
