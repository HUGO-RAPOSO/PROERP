-- Create Account table
CREATE TABLE IF NOT EXISTS "Account" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL CHECK ("type" IN ('CASH', 'BANK', 'MOBILE_WALLET')),
    "bankName" TEXT,
    "accountNumber" TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add accountId to Transaction
ALTER TABLE "Transaction" 
ADD COLUMN IF NOT EXISTS "accountId" UUID REFERENCES "Account"(id) ON DELETE SET NULL;

-- Create index for performance
CREATE INDEX IF NOT EXISTS "idx_account_tenant" ON "Account"("tenantId");
CREATE INDEX IF NOT EXISTS "idx_transaction_account" ON "Transaction"("accountId");
