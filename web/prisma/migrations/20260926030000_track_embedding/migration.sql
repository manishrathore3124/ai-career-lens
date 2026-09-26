-- This column already exists in the database; this migration exists only to sync Prisma's history.
ALTER TABLE "DocumentChunk" ADD COLUMN IF NOT EXISTS embedding vector(384);