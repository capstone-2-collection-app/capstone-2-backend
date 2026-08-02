ALTER TABLE collections
ADD COLUMN IF NOT EXISTS share_token UUID;

CREATE UNIQUE INDEX IF NOT EXISTS collections_share_token_unique
ON collections (share_token);
