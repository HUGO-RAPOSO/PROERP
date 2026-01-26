-- Add deposit slip info to Tuition
ALTER TABLE "Tuition" 
ADD COLUMN IF NOT EXISTS "depositSlipUrl" TEXT,
ADD COLUMN IF NOT EXISTS "depositSlipNumber" TEXT,
ADD COLUMN IF NOT EXISTS "accountId" UUID REFERENCES "Account"(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS "idx_tuition_account" ON "Tuition"("accountId");
