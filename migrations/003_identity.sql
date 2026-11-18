-- 003_identity.sql
-- Existing rows (if any) get placeholder identity; they cannot log in until updated.
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone    TEXT   NOT NULL DEFAULT '';
ALTER TABLE users ADD COLUMN IF NOT EXISTS username CITEXT NOT NULL DEFAULT '';

UPDATE users SET phone = 'legacy-' || id::text WHERE phone = '';
UPDATE users SET username = 'legacy_' || replace(id::text, '-', '') WHERE username = '';

ALTER TABLE users ALTER COLUMN phone    DROP DEFAULT;
ALTER TABLE users ALTER COLUMN username DROP DEFAULT;

CREATE UNIQUE INDEX IF NOT EXISTS users_phone_key    ON users(phone);
CREATE UNIQUE INDEX IF NOT EXISTS users_username_key ON users(username);
