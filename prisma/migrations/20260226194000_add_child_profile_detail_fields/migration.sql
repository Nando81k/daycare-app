-- Add detailed child profile fields for preferences, education, and routines.
ALTER TABLE "Child"
ADD COLUMN "preferredName" TEXT,
ADD COLUMN "gender" TEXT,
ADD COLUMN "pronouns" TEXT,
ADD COLUMN "gradeLevel" TEXT,
ADD COLUMN "schoolName" TEXT,
ADD COLUMN "favoriteActivities" TEXT,
ADD COLUMN "favoriteFoods" TEXT,
ADD COLUMN "favoriteToys" TEXT,
ADD COLUMN "comfortItems" TEXT,
ADD COLUMN "temperamentNotes" TEXT,
ADD COLUMN "learningStyle" TEXT,
ADD COLUMN "napSchedule" TEXT,
ADD COLUMN "languagePreferences" TEXT,
ADD COLUMN "pottyTrainingStatus" TEXT;
