-- Add enrollment fee to Course
ALTER TABLE "Course" 
ADD COLUMN IF NOT EXISTS "enrollmentFee" NUMERIC DEFAULT 0;

-- Add document and enrollment slip info to Student
ALTER TABLE "Student" 
ADD COLUMN IF NOT EXISTS "documentUrl" TEXT,
ADD COLUMN IF NOT EXISTS "enrollmentSlipUrl" TEXT,
ADD COLUMN IF NOT EXISTS "enrollmentSlipNumber" TEXT;
