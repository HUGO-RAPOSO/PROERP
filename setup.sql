-- Create Tables for ProERP

-- 1. Tenant & Modules
CREATE TABLE IF NOT EXISTS "Tenant" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Module" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "TenantModule" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "moduleId" UUID REFERENCES "Module"(id) ON DELETE CASCADE,
    enabled BOOLEAN DEFAULT true,
    UNIQUE("tenantId", "moduleId")
);

-- 2. CRM
CREATE TABLE IF NOT EXISTS "Lead" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'OPEN',
    source TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "LeadInteraction" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "leadId" UUID REFERENCES "Lead"(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    notes TEXT,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. HR
CREATE TABLE IF NOT EXISTS "Role" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Contract" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Employee" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    "roleId" UUID REFERENCES "Role"(id),
    "contractId" UUID REFERENCES "Contract"(id),
    salary NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'ACTIVE',
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "EmployeeDocument" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    "employeeId" UUID REFERENCES "Employee"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Payroll" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "employeeId" UUID REFERENCES "Employee"(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status TEXT DEFAULT 'PENDING'
);

CREATE TABLE IF NOT EXISTS "Teacher" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "employeeId" UUID UNIQUE REFERENCES "Employee"(id) ON DELETE CASCADE
);

-- 4. Financial
CREATE TABLE IF NOT EXISTS "Category" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('INCOME', 'EXPENSE')),
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Transaction" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    description TEXT NOT NULL,
    amount NUMERIC NOT NULL,
    type TEXT CHECK (type IN ('INCOME', 'EXPENSE')),
    "categoryId" UUID REFERENCES "Category"(id) ON DELETE SET NULL,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    date TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Academic
CREATE TABLE IF NOT EXISTS "Course" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    type TEXT,
    duration INTEGER,
    "periodType" TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Subject" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    code TEXT,
    year INTEGER,
    semester INTEGER,
    credits INTEGER,
    "examWaiverPossible" BOOLEAN DEFAULT true,
    "waiverGrade" NUMERIC DEFAULT 14,
    "exclusionGrade" NUMERIC DEFAULT 7,
    "courseId" UUID REFERENCES "Course"(id) ON DELETE CASCADE,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Student" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    status TEXT DEFAULT 'ACTIVE',
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Class" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    "subjectId" UUID REFERENCES "Subject"(id) ON DELETE CASCADE,
    "teacherId" UUID REFERENCES "Teacher"(id) ON DELETE SET NULL,
    room TEXT,
    schedule TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Enrollment" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "studentId" UUID REFERENCES "Student"(id) ON DELETE CASCADE,
    "classId" UUID REFERENCES "Class"(id) ON DELETE CASCADE,
    year INTEGER NOT NULL,
    status TEXT DEFAULT 'ENROLLED'
);

-- 6. Library
CREATE TABLE IF NOT EXISTS "Book" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    author TEXT,
    isbn TEXT,
    quantity INTEGER DEFAULT 1,
    available INTEGER DEFAULT 1,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Loan" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "bookId" UUID REFERENCES "Book"(id) ON DELETE CASCADE,
    "studentId" UUID REFERENCES "Student"(id) ON DELETE CASCADE,
    "dueDate" TIMESTAMP WITH TIME ZONE NOT NULL,
    status TEXT DEFAULT 'BORROWED',
    "returnDate" TIMESTAMP WITH TIME ZONE,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);

-- 7. Communication
CREATE TABLE IF NOT EXISTS "Message" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    sender TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Events
CREATE TABLE IF NOT EXISTS "Event" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    "startTime" TEXT,
    location TEXT,
    type TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE
);


-- Auth Tables (Next-Auth Supabase Adapter)
CREATE TABLE IF NOT EXISTS "User" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT,
    email TEXT UNIQUE,
    "emailVerified" TIMESTAMP WITH TIME ZONE,
    image TEXT,
    password TEXT,
    "tenantId" UUID REFERENCES "Tenant"(id),
    role TEXT DEFAULT 'USER'
);

-- Initial Seed Data
INSERT INTO "Tenant" (name, slug) VALUES ('Escola Exemplo', 'escola-exemplo') ON CONFLICT DO NOTHING;

DO $$ 
DECLARE 
    t_id UUID;
BEGIN
    SELECT id INTO t_id FROM "Tenant" WHERE slug = 'escola-exemplo' LIMIT 1;
    
    INSERT INTO "Module" (name) VALUES 
    ('Academic'), ('Financial'), ('HR'), ('Library'), ('CRM'), ('Communication')
    ON CONFLICT DO NOTHING;

    INSERT INTO "TenantModule" ("tenantId", "moduleId", enabled)
    SELECT t_id, id, true FROM "Module"
    ON CONFLICT DO NOTHING;
END $$;
