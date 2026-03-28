-- Add child identity fields for secure SSN last4 capture.
ALTER TABLE "Child"
ADD COLUMN "childSsnLast4Encrypted" TEXT,
ADD COLUMN "childSsnLast4Masked" TEXT,
ADD COLUMN "childIdentityUpdatedAt" TIMESTAMP(3);
