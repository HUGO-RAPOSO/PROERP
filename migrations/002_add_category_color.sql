-- Add color column to Category table
ALTER TABLE "Category" 
ADD COLUMN IF NOT EXISTS "color" TEXT DEFAULT '#3B82F6'; -- Default blue
