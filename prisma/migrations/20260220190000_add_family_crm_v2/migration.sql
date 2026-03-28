-- Family CRM v2 additive schema for admin families workspace.

CREATE TYPE "FamilyCrmStage" AS ENUM (
  'LEAD',
  'INTAKE_INCOMPLETE',
  'ADMISSIONS_REVIEW',
  'APPROVED_AWAITING_SPOT',
  'ACTIVE_FAMILY',
  'AT_RISK_BILLING'
);

CREATE TYPE "FamilyCrmTaskStatus" AS ENUM (
  'OPEN',
  'IN_PROGRESS',
  'BLOCKED',
  'DONE'
);

CREATE TYPE "FamilyCrmTaskPriority" AS ENUM (
  'LOW',
  'MEDIUM',
  'HIGH',
  'URGENT'
);

CREATE TABLE "FamilyCrmProfile" (
  "id" TEXT NOT NULL,
  "parentId" TEXT NOT NULL,
  "stage" "FamilyCrmStage" NOT NULL DEFAULT 'LEAD',
  "suggestedStage" "FamilyCrmStage",
  "isStageManuallyOverridden" BOOLEAN NOT NULL DEFAULT false,
  "ownerAdminId" TEXT,
  "nextFollowUpAt" TIMESTAMP(3),
  "lastContactedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FamilyCrmProfile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FamilyCrmTask" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "status" "FamilyCrmTaskStatus" NOT NULL DEFAULT 'OPEN',
  "priority" "FamilyCrmTaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "dueAt" TIMESTAMP(3),
  "ownerAdminId" TEXT,
  "createdByAdminId" TEXT NOT NULL,
  "childId" TEXT,
  "enrollmentId" TEXT,
  "invoiceId" TEXT,
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FamilyCrmTask_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FamilyCrmNote" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "createdByAdminId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isPinned" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FamilyCrmNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FamilyCrmTag" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "color" TEXT NOT NULL DEFAULT '#8AA99A',
  "isSystem" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FamilyCrmTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FamilyCrmProfileTag" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "tagId" TEXT NOT NULL,
  "assignedByAdminId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "FamilyCrmProfileTag_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "FamilyCrmSavedView" (
  "id" TEXT NOT NULL,
  "adminUserId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT false,
  "filtersJson" JSONB NOT NULL,
  "columnsJson" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "FamilyCrmSavedView_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "FamilyCrmProfile_parentId_key" ON "FamilyCrmProfile"("parentId");
CREATE INDEX "FamilyCrmProfile_stage_idx" ON "FamilyCrmProfile"("stage");
CREATE INDEX "FamilyCrmProfile_ownerAdminId_idx" ON "FamilyCrmProfile"("ownerAdminId");
CREATE INDEX "FamilyCrmProfile_nextFollowUpAt_idx" ON "FamilyCrmProfile"("nextFollowUpAt");

CREATE INDEX "FamilyCrmTask_profileId_status_idx" ON "FamilyCrmTask"("profileId", "status");
CREATE INDEX "FamilyCrmTask_ownerAdminId_dueAt_idx" ON "FamilyCrmTask"("ownerAdminId", "dueAt");
CREATE INDEX "FamilyCrmTask_dueAt_status_idx" ON "FamilyCrmTask"("dueAt", "status");

CREATE INDEX "FamilyCrmNote_profileId_createdAt_idx" ON "FamilyCrmNote"("profileId", "createdAt");

CREATE UNIQUE INDEX "FamilyCrmTag_name_key" ON "FamilyCrmTag"("name");

CREATE UNIQUE INDEX "FamilyCrmProfileTag_profileId_tagId_key" ON "FamilyCrmProfileTag"("profileId", "tagId");
CREATE INDEX "FamilyCrmProfileTag_tagId_idx" ON "FamilyCrmProfileTag"("tagId");

CREATE INDEX "FamilyCrmSavedView_adminUserId_isDefault_idx" ON "FamilyCrmSavedView"("adminUserId", "isDefault");

ALTER TABLE "FamilyCrmProfile"
ADD CONSTRAINT "FamilyCrmProfile_parentId_fkey"
FOREIGN KEY ("parentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmProfile"
ADD CONSTRAINT "FamilyCrmProfile_ownerAdminId_fkey"
FOREIGN KEY ("ownerAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmTask"
ADD CONSTRAINT "FamilyCrmTask_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "FamilyCrmProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmTask"
ADD CONSTRAINT "FamilyCrmTask_ownerAdminId_fkey"
FOREIGN KEY ("ownerAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmTask"
ADD CONSTRAINT "FamilyCrmTask_createdByAdminId_fkey"
FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmTask"
ADD CONSTRAINT "FamilyCrmTask_childId_fkey"
FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmTask"
ADD CONSTRAINT "FamilyCrmTask_enrollmentId_fkey"
FOREIGN KEY ("enrollmentId") REFERENCES "EnrollmentApplication"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmTask"
ADD CONSTRAINT "FamilyCrmTask_invoiceId_fkey"
FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmNote"
ADD CONSTRAINT "FamilyCrmNote_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "FamilyCrmProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmNote"
ADD CONSTRAINT "FamilyCrmNote_createdByAdminId_fkey"
FOREIGN KEY ("createdByAdminId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmProfileTag"
ADD CONSTRAINT "FamilyCrmProfileTag_profileId_fkey"
FOREIGN KEY ("profileId") REFERENCES "FamilyCrmProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmProfileTag"
ADD CONSTRAINT "FamilyCrmProfileTag_tagId_fkey"
FOREIGN KEY ("tagId") REFERENCES "FamilyCrmTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmProfileTag"
ADD CONSTRAINT "FamilyCrmProfileTag_assignedByAdminId_fkey"
FOREIGN KEY ("assignedByAdminId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "FamilyCrmSavedView"
ADD CONSTRAINT "FamilyCrmSavedView_adminUserId_fkey"
FOREIGN KEY ("adminUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Backfill CRM profiles for existing parent users.
INSERT INTO "FamilyCrmProfile" (
  "id",
  "parentId",
  "stage",
  "isStageManuallyOverridden",
  "createdAt",
  "updatedAt"
)
SELECT
  CONCAT('crm_profile_', "id"),
  "id",
  'LEAD'::"FamilyCrmStage",
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "User"
WHERE "role" = 'PARENT'
ON CONFLICT ("parentId") DO NOTHING;

-- Seed default CRM tags.
INSERT INTO "FamilyCrmTag" (
  "id",
  "name",
  "color",
  "isSystem",
  "sortOrder",
  "createdAt",
  "updatedAt"
)
VALUES
  ('crm_tag_high_priority', 'High Priority', '#B24545', true, 10, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('crm_tag_billing_watch', 'Billing Watch', '#A06A1A', true, 20, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('crm_tag_follow_up', 'Needs Follow-up', '#4C6078', true, 30, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
