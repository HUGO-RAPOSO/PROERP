-- Comprehensive fix for Student table schema
-- This ensures all columns added in recent migrations exist

ALTER TABLE "Student" 
ADD COLUMN IF NOT EXISTS "documentUrl" TEXT,
ADD COLUMN IF NOT EXISTS "enrollmentSlipUrl" TEXT,
ADD COLUMN IF NOT EXISTS "enrollmentSlipNumber" TEXT;

-- Verify indexes
CREATE INDEX IF NOT EXISTS "idx_student_tenant" ON "Student"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_student_course" ON "Student"("courseId");

-- Reload schema cache hint: In some cases, you might need to run a dummy DDL
-- like adding and removing a comment to force PostgREST to reload the schema.
COMMENT ON TABLE "Student" IS 'Table storing student primary data and enrollment info';
