// One-shot script for the staff-onboarding Playwright walkthrough.
// Creates (or resets) a test teacher with a known password + a fresh
// onboarding row + 3 required documents in REQUIRED state.
//
// Usage:
//   node scripts/create-test-teacher.mjs
//
// Prints the credentials to stdout.

import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { randomBytes, scryptSync } from "node:crypto"

const TEST_EMAIL = "test-teacher@ambassadorscare.local"
const TEST_PASSWORD = "TeacherTest123!"
const TEST_NAME = "Test Teacher"

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) {
  throw new Error("DATABASE_URL is not set")
}
const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) })

try {
  // Wipe any prior test teacher so the script is idempotent.
  const existing = await prisma.user.findUnique({ where: { email: TEST_EMAIL } })
  if (existing) {
    await prisma.staffProfile.deleteMany({ where: { userId: existing.id } })
    await prisma.user.delete({ where: { id: existing.id } })
    console.log("Removed prior test teacher")
  }

  const user = await prisma.user.create({
    data: {
      email: TEST_EMAIL,
      passwordHash: hashPassword(TEST_PASSWORD),
      name: TEST_NAME,
      role: "TEACHER",
      mustSetPassword: false,
      passwordChangedAt: new Date(),
    },
  })

  const staff = await prisma.staffProfile.create({
    data: {
      userId: user.id,
      name: TEST_NAME,
      roleLabel: "Lead Teacher",
      certification: "ECE certified",
      status: "SCHEDULED",
      note: "Test teacher seeded for onboarding walkthrough.",
    },
  })

  await prisma.staffOnboardingProgress.create({
    data: { staffProfileId: staff.id },
  })

  await prisma.staffDocument.createMany({
    data: [
      { staffProfileId: staff.id, category: "BACKGROUND_CHECK" },
      { staffProfileId: staff.id, category: "FIRST_AID" },
      { staffProfileId: staff.id, category: "GOVERNMENT_ID" },
    ],
  })

  console.log("\n=== Test teacher ready ===")
  console.log(`Email:    ${TEST_EMAIL}`)
  console.log(`Password: ${TEST_PASSWORD}`)
  console.log(`StaffProfileId: ${staff.id}`)
} finally {
  await prisma.$disconnect()
}
