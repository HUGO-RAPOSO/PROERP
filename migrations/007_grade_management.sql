-- 007_grade_management.sql

-- Create Grade table
CREATE TABLE IF NOT EXISTS "Grade" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "enrollmentId" UUID REFERENCES "Enrollment"(id) ON DELETE CASCADE,
    value NUMERIC NOT NULL,
    type TEXT NOT NULL, -- e.g., 'P1', 'P2', 'Final'
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE("enrollmentId", "type")
);

-- Link User to Teacher/Student roles
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "teacherId" UUID REFERENCES "Teacher"(id);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "studentId" UUID REFERENCES "Student"(id);
