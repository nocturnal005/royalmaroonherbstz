BEGIN TRANSACTION;

-- Create temporary table with expanded columns
CREATE TABLE IF NOT EXISTS admin_users_new (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL DEFAULT '',
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  is_active INTEGER DEFAULT 1 CHECK (is_active IN (0, 1)),
  last_login_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Drop old table and rename the new table
DROP TABLE IF EXISTS admin_users;
ALTER TABLE admin_users_new RENAME TO admin_users;

COMMIT;
