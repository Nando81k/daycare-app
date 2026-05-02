-- Adds TOTP two-factor fields to users.
ALTER TABLE "User"
  ADD COLUMN "twoFactorSecret" TEXT,
  ADD COLUMN "twoFactorEnabledAt" TIMESTAMP(3);
