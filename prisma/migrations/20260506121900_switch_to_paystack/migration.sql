/*
  Warnings:

  - You are about to drop the column `defaultPaymentMethodId` on the `FamilyBillingProfile` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `FamilyBillingProfile` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCheckoutSessionId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `subscriptionId` on the `Invoice` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentIntentId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `stripePaymentMethodId` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the `StripeSubscriptionMapping` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[paystackCustomerCode]` on the table `FamilyBillingProfile` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paystackReference]` on the table `Invoice` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[paystackReference]` on the table `Payment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "TuitionPlanStatus" AS ENUM ('ACTIVE', 'PAUSED', 'ENDED');

-- DropForeignKey
ALTER TABLE "Invoice" DROP CONSTRAINT "Invoice_subscriptionId_fkey";

-- DropForeignKey
ALTER TABLE "StripeSubscriptionMapping" DROP CONSTRAINT "StripeSubscriptionMapping_familyId_fkey";

-- DropIndex
DROP INDEX "FamilyBillingProfile_stripeCustomerId_key";

-- DropIndex
DROP INDEX "Invoice_stripeCheckoutSessionId_key";

-- DropIndex
DROP INDEX "Invoice_stripePaymentIntentId_key";

-- DropIndex
DROP INDEX "Payment_stripePaymentIntentId_key";

-- AlterTable
ALTER TABLE "FamilyBillingProfile" DROP COLUMN "defaultPaymentMethodId",
DROP COLUMN "stripeCustomerId",
ADD COLUMN     "paystackAuthorizationCode" TEXT,
ADD COLUMN     "paystackCustomerCode" TEXT;

-- AlterTable
ALTER TABLE "Invoice" DROP COLUMN "stripeCheckoutSessionId",
DROP COLUMN "stripePaymentIntentId",
DROP COLUMN "subscriptionId",
ADD COLUMN     "paystackAccessCode" TEXT,
ADD COLUMN     "paystackReference" TEXT,
ADD COLUMN     "tuitionPlanId" TEXT;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "stripePaymentIntentId",
DROP COLUMN "stripePaymentMethodId",
ADD COLUMN     "authorizationCode" TEXT,
ADD COLUMN     "channelLabel" TEXT,
ADD COLUMN     "channelLast4" TEXT,
ADD COLUMN     "paystackReference" TEXT;

-- DropTable
DROP TABLE "StripeSubscriptionMapping";

-- CreateTable
CREATE TABLE "TuitionPlan" (
    "id" TEXT NOT NULL,
    "familyId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "programRateId" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "invoiceDay" INTEGER NOT NULL DEFAULT 1,
    "dueDayOffset" INTEGER NOT NULL DEFAULT 10,
    "status" "TuitionPlanStatus" NOT NULL DEFAULT 'ACTIVE',
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TuitionPlan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TuitionPlan_familyId_status_idx" ON "TuitionPlan"("familyId", "status");

-- CreateIndex
CREATE INDEX "TuitionPlan_childId_idx" ON "TuitionPlan"("childId");

-- CreateIndex
CREATE UNIQUE INDEX "FamilyBillingProfile_paystackCustomerCode_key" ON "FamilyBillingProfile"("paystackCustomerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Invoice_paystackReference_key" ON "Invoice"("paystackReference");

-- CreateIndex
CREATE UNIQUE INDEX "Payment_paystackReference_key" ON "Payment"("paystackReference");

-- AddForeignKey
ALTER TABLE "Invoice" ADD CONSTRAINT "Invoice_tuitionPlanId_fkey" FOREIGN KEY ("tuitionPlanId") REFERENCES "TuitionPlan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionPlan" ADD CONSTRAINT "TuitionPlan_familyId_fkey" FOREIGN KEY ("familyId") REFERENCES "Family"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionPlan" ADD CONSTRAINT "TuitionPlan_childId_fkey" FOREIGN KEY ("childId") REFERENCES "Child"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TuitionPlan" ADD CONSTRAINT "TuitionPlan_programRateId_fkey" FOREIGN KEY ("programRateId") REFERENCES "ProgramRate"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
