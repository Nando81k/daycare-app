-- Add admin-uploaded blank template fields + typed-signature record fields to Document.
ALTER TABLE "Document"
  ADD COLUMN "templateBlobPathname" TEXT,
  ADD COLUMN "templateBlobUrl"      TEXT,
  ADD COLUMN "templateDownloadUrl"  TEXT,
  ADD COLUMN "templateFileName"     TEXT,
  ADD COLUMN "templateContentType"  TEXT,
  ADD COLUMN "templateSizeBytes"    INTEGER,
  ADD COLUMN "signedName" TEXT,
  ADD COLUMN "signedAt"   TIMESTAMP(3),
  ADD COLUMN "signedIp"   TEXT;
