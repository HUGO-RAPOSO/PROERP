-- Migration 015: Separate Turma (Cohort) and Lesson (Aula)
-- Target: Separate the concept of a "Group of Students" from specific "Scheduled Subjects".

-- 1. Create the Lesson table
CREATE TABLE IF NOT EXISTS "Lesson" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "classId" UUID REFERENCES "Class"(id) ON DELETE CASCADE,
    "subjectId" UUID REFERENCES "Subject"(id) ON DELETE CASCADE,
    "teacherId" UUID REFERENCES "Teacher"(id) ON DELETE SET NULL,
    room TEXT,
    schedule TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Add classId to Student table
ALTER TABLE "Student" ADD COLUMN IF NOT EXISTS "classId" UUID REFERENCES "Class"(id) ON DELETE SET NULL;

-- 3. Migration Logic (Optional/Safe): Move existing Subject-specific Class data to Lesson table
-- This assumes existing "Class" records are actually what the user now calls "Aulas".
-- We should keep the Class table as the "Turma" (Cohort) container.
-- NOTE: This migration might require manual mapping if names are inconsistent.
-- However, for now, we will just prepare the structure and let the user decide on data migration.

-- 4. Add courseId to Class if not exists (to link Turmas to Courses)
ALTER TABLE "Class" ADD COLUMN IF NOT EXISTS "courseId" UUID REFERENCES "Course"(id) ON DELETE SET NULL;

-- 5. Clean up Class table (Remove columns that now belong to Lesson)
-- We'll do this AFTER verifying the Lesson table works.
-- ALTER TABLE "Class" DROP COLUMN "subjectId";
-- ALTER TABLE "Class" DROP COLUMN "teacherId";
-- ALTER TABLE "Class" DROP COLUMN "room";
-- ALTER TABLE "Class" DROP COLUMN "schedule";

NOTIFY pgrst, 'reload schema';
