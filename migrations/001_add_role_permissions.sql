-- Add permissions column to Role table
ALTER TABLE "Role" 
ADD COLUMN IF NOT EXISTS "permissions" TEXT[] DEFAULT '{}';
