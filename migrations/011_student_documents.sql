-- Create StudentDocument table for multiple attachments
CREATE TABLE IF NOT EXISTS "StudentDocument" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID REFERENCES "Student"(id) ON DELETE CASCADE,
    "type" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS "idx_student_document_student" ON "StudentDocument"("studentId");
