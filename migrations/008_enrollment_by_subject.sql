-- Migration 008: Enrollment by Subject
-- Finalidade: Alunos agora se matriculam em Cadeiras/Disciplinas (Subjects), não mais em turmas específicas.

-- 1. Adicionar subjectId à tabela Enrollment
ALTER TABLE "Enrollment" ADD COLUMN "subjectId" UUID REFERENCES "Subject"(id) ON DELETE CASCADE;

-- 2. Migrar dados existentes (se houver)
UPDATE "Enrollment" e
SET "subjectId" = (SELECT "subjectId" FROM "Class" c WHERE c.id = e."classId")
WHERE e."subjectId" IS NULL AND e."classId" IS NOT NULL;

-- 3. Remover a coluna classId (Desacoplamento)
ALTER TABLE "Enrollment" DROP COLUMN "classId";

-- 4. Adicionar tenantId para consistência de segurança (se não houver)
ALTER TABLE "Enrollment" ADD COLUMN "tenantId" UUID REFERENCES "Tenant"(id) ON DELETE CASCADE;

-- 5. Garantir que a tabela Grade use a EnrollmentId (já faz isso)
-- A tabela Grade vincula notas à matrícula (Cadeira/Aluno), o que é ideal.
