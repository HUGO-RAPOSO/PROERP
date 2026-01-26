-- Add studentId to User table to link users with students
ALTER TABLE "User" 
ADD COLUMN IF NOT EXISTS "studentId" UUID REFERENCES "Student"(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS "idx_user_student" ON "User"("studentId");
