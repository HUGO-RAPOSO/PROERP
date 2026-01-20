-- Add stakeholder relations to Transaction
ALTER TABLE "Transaction" 
ADD COLUMN IF NOT EXISTS "studentId" UUID REFERENCES "Student"(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS "employeeId" UUID REFERENCES "Employee"(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS "idx_transaction_student" ON "Transaction"("studentId");
CREATE INDEX IF NOT EXISTS "idx_transaction_employee" ON "Transaction"("employeeId");
