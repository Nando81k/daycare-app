-- Additive schema update for guardian identity capture and intake readiness metadata.

ALTER TABLE "User"
ADD COLUMN "guardianSsnLast4Encrypted" TEXT,
ADD COLUMN "guardianSsnLast4Masked" TEXT,
ADD COLUMN "guardianIdentityCapturedAt" TIMESTAMP(3),
ADD COLUMN "guardianIdentityUpdatedAt" TIMESTAMP(3);

ALTER TABLE "EnrollmentApplication"
ADD COLUMN "requiredIntakeComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "intakeMissingFields" TEXT[] DEFAULT ARRAY[]::TEXT[];

CREATE INDEX "EnrollmentApplication_requiredIntakeComplete_idx"
ON "EnrollmentApplication"("requiredIntakeComplete");
