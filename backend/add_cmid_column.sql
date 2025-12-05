-- Add cmid column to assignments table
ALTER TABLE assignments ADD COLUMN IF NOT EXISTS cmid BIGINT;
