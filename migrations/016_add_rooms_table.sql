-- Create Room table
CREATE TABLE IF NOT EXISTS "Room" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    capacity INTEGER,
    tenantId UUID NOT NULL,
    createdAt TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add roomId to Lesson table
ALTER TABLE "Lesson" ADD COLUMN IF NOT EXISTS "roomId" UUID REFERENCES "Room"(id);

-- Add RLS policies for Room
ALTER TABLE "Room" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view rooms of their tenant" ON "Room"
    FOR SELECT USING (auth.uid() IN (
        SELECT id FROM "User" WHERE "tenantId" = "Room"."tenantId"
    ));

CREATE POLICY "Users can insert rooms of their tenant" ON "Room"
    FOR INSERT WITH CHECK (auth.uid() IN (
        SELECT id FROM "User" WHERE "tenantId" = "Room"."tenantId"
    ));

CREATE POLICY "Users can update rooms of their tenant" ON "Room"
    FOR UPDATE USING (auth.uid() IN (
        SELECT id FROM "User" WHERE "tenantId" = "Room"."tenantId"
    ));

CREATE POLICY "Users can delete rooms of their tenant" ON "Room"
    FOR DELETE USING (auth.uid() IN (
        SELECT id FROM "User" WHERE "tenantId" = "Room"."tenantId"
    ));
