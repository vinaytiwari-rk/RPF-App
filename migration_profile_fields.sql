-- Run this in your cPanel pgAdmin or terminal to add the missing volunteer profile fields:
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS ward_no TEXT,
ADD COLUMN IF NOT EXISTS sansad_kshetra TEXT,
ADD COLUMN IF NOT EXISTS father_name TEXT,
ADD COLUMN IF NOT EXISTS mother_name TEXT;
