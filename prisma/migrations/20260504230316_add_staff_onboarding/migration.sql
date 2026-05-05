-- CreateEnum
CREATE TYPE "StaffDocumentCategory" AS ENUM ('BACKGROUND_CHECK', 'FIRST_AID', 'GOVERNMENT_ID', 'CERTIFICATION', 'OFFER_LETTER', 'OTHER');

-- CreateEnum
CREATE TYPE "StaffDocumentStatus" AS ENUM ('REQUIRED', 'SUBMITTED', 'APPROVED', 'REJECTED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "StaffOnboardingStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETE');

-- AlterTable
ALTER TABLE "StaffProfile" ADD COLUMN     "bio" TEXT,
ADD COLUMN     "emergencyContactName" TEXT,
ADD COLUMN     "emergencyContactPhone" TEXT,
ADD COLUMN     "hireDate" TIMESTAMP(3),
ADD COLUMN     "isPublicProfile" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "photoBlobPathname" TEXT,
ADD COLUMN     "photoBlobUrl" TEXT,
ADD COLUMN     "pronouns" TEXT;

-- CreateTable
CREATE TABLE "StaffDocument" (
    "id" TEXT NOT NULL,
    "staffProfileId" TEXT NOT NULL,
    "category" "StaffDocumentCategory" NOT NULL,
    "status" "StaffDocumentStatus" NOT NULL DEFAULT 'REQUIRED',
    "fileName" TEXT,
    "blobPathname" TEXT,
    "blobUrl" TEXT,
    "blobDownloadUrl" TEXT,
    "contentType" TEXT,
    "sizeBytes" INTEGER,
    "submittedAt" TIMESTAMP(3),
    "approvedAt" TIMESTAMP(3),
    "reviewedByName" TEXT,
    "expiresOn" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffOnboardingProgress" (
    "id" TEXT NOT NULL,
    "staffProfileId" TEXT NOT NULL,
    "status" "StaffOnboardingStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "currentStep" TEXT NOT NULL DEFAULT 'welcome',
    "acknowledgments" JSONB,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffOnboardingProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffDocument_staffProfileId_status_idx" ON "StaffDocument"("staffProfileId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "StaffOnboardingProgress_staffProfileId_key" ON "StaffOnboardingProgress"("staffProfileId");

-- AddForeignKey
ALTER TABLE "StaffDocument" ADD CONSTRAINT "StaffDocument_staffProfileId_fkey" FOREIGN KEY ("staffProfileId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffOnboardingProgress" ADD CONSTRAINT "StaffOnboardingProgress_staffProfileId_fkey" FOREIGN KEY ("staffProfileId") REFERENCES "StaffProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
