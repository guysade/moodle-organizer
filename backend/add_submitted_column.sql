-- Add submitted column to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS submitted BOOLEAN DEFAULT FALSE;
