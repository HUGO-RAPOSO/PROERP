-- Migration 017: Enhance Library for Digital and Physical Books
-- Adds support for digital books, cover images, and additional metadata

-- 1. Add new columns to Book table
ALTER TABLE "Book" 
ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'PHYSICAL' CHECK ("type" IN ('PHYSICAL', 'DIGITAL', 'BOTH')),
ADD COLUMN IF NOT EXISTS "coverUrl" TEXT,
ADD COLUMN IF NOT EXISTS "fileUrl" TEXT, -- For digital books (PDF, EPUB, etc.)
ADD COLUMN IF NOT EXISTS "publisher" TEXT,
ADD COLUMN IF NOT EXISTS "publishYear" INTEGER,
ADD COLUMN IF NOT EXISTS "pages" INTEGER,
ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'pt',
ADD COLUMN IF NOT EXISTS "description" TEXT,
ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 2. Update existing books to have a type
UPDATE "Book" SET "type" = 'PHYSICAL' WHERE "type" IS NULL;

-- 3. Add index for better search performance
CREATE INDEX IF NOT EXISTS "idx_book_isbn" ON "Book"("isbn");
CREATE INDEX IF NOT EXISTS "idx_book_type" ON "Book"("type");
CREATE INDEX IF NOT EXISTS "idx_book_tenant" ON "Book"("tenantId");

-- 4. Update Loan table to handle digital books (no physical return needed)
ALTER TABLE "Loan" 
ADD COLUMN IF NOT EXISTS "accessExpiry" TIMESTAMP WITH TIME ZONE; -- For digital book access expiration

COMMENT ON COLUMN "Book"."type" IS 'Type of book: PHYSICAL (only physical copies), DIGITAL (only digital file), BOTH (has both physical and digital)';
COMMENT ON COLUMN "Book"."coverUrl" IS 'URL to book cover image (can be from Open Library API)';
COMMENT ON COLUMN "Book"."fileUrl" IS 'URL to digital book file (PDF, EPUB, etc.) for DIGITAL or BOTH types';
COMMENT ON COLUMN "Loan"."accessExpiry" IS 'For digital books: when the access expires. For physical books: use dueDate instead';
