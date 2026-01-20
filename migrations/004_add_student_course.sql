-- Add courseId to Student table
ALTER TABLE "Student" 
ADD COLUMN IF NOT EXISTS "courseId" UUID REFERENCES "Course"(id) ON DELETE SET NULL;

-- Index for performance
CREATE INDEX IF NOT EXISTS "idx_student_course" ON "Student"("courseId");
