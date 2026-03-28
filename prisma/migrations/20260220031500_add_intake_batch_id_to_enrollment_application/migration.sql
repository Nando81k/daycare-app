-- Add optional intake batch identifier to support grouped multi-child admissions entries.
ALTER TABLE "EnrollmentApplication"
ADD COLUMN "intakeBatchId" TEXT;

CREATE INDEX "EnrollmentApplication_intakeBatchId_idx"
ON "EnrollmentApplication"("intakeBatchId");

CREATE INDEX "EnrollmentApplication_parentId_intakeBatchId_idx"
ON "EnrollmentApplication"("parentId", "intakeBatchId");
