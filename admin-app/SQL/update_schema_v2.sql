-- Allow password_hash to be null (for Google OAuth users)
ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;

-- Ensure customer fields are nullable (they likely already are, but being explicit)
ALTER TABLE customers ALTER COLUMN phone DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN email DROP NOT NULL;
ALTER TABLE customers ALTER COLUMN address DROP NOT NULL;

-- Add google_id to users if we want to track it specifically (optional but good practice)
ALTER TABLE users ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Index for google_id
CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
