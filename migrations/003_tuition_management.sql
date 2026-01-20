-- Add price column to Course
ALTER TABLE "Course" 
ADD COLUMN IF NOT EXISTS "price" NUMERIC DEFAULT 0;

-- Create Tuition table
CREATE TABLE IF NOT EXISTS "Tuition" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID REFERENCES "Student"(id) ON DELETE CASCADE,
    "courseId" UUID REFERENCES "Course"(id) ON DELETE CASCADE,
    "amount" NUMERIC NOT NULL,
    "dueDate" DATE NOT NULL,
    "paidDate" TIMESTAMP WITH TIME ZONE,
    "lateFee" NUMERIC DEFAULT 0,
    "status" TEXT NOT NULL CHECK ("status" IN ('PENDING', 'PAID', 'OVERDUE')),
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for performance
CREATE INDEX IF NOT EXISTS "idx_tuition_student" ON "Tuition"("studentId");
CREATE INDEX IF NOT EXISTS "idx_tuition_tenant" ON "Tuition"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_tuition_due" ON "Tuition"("dueDate");
