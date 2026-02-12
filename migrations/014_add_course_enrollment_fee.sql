-- Add enrollmentFee column to Course table
ALTER TABLE "Course" 
ADD COLUMN IF NOT EXISTS "enrollmentFee" NUMERIC DEFAULT 0;
