// DESTRUCTIVE — wipes every row from every table EXCEPT Teddy's admin User
// and his AdminProfile. Idempotent (safe to re-run). Uses a single transaction
// so a mid-flight failure rolls back cleanly.
//
// Usage:
//   node scripts/wipe-database.mjs            # dry-run: prints counts only
//   CONFIRM=YES node scripts/wipe-database.mjs # actually deletes
//
// Reads DATABASE_URL from .env (which points to production Neon).

import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const TEDDY_EMAIL = "teddy@ambassadorscare.org"
const CONFIRMED = process.env.CONFIRM === "YES"

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl) throw new Error("DATABASE_URL is not set")

const prisma = new PrismaClient({ adapter: new PrismaPg(databaseUrl) })

// Tables to TRUNCATE CASCADE (everything that's not the admin's User/AdminProfile).
// Order doesn't matter with CASCADE, but listed roughly bottom-up for clarity.
const TABLES_TO_TRUNCATE = [
  // Audit + auth ephemera
  "AuditLog",
  "PasswordResetToken",
  "AccountInviteToken",
  "Session",
  // Staff onboarding
  "StaffOnboardingProgress",
  "StaffDocument",
  "StaffProfile",
  // Child / family transactional
  "AttendanceRecord",
  "DailyReportPhoto",
  "DailyReport",
  "AuthorizedPickup",
  "EmergencyContact",
  "Document",
  "Message",
  "MessageThread",
  "Payment",
  "Invoice",
  "FamilyBillingProfile",
  "StripeSubscriptionMapping",
  "FamilyNote",
  "ParentChild",
  "Child",
  "ParentProfile",
  "Family",
  // Enrollment + leads
  "EnrollmentApplication",
  "EnrollmentLead",
  // Catalog / config
  "ProgramRate",
  "Schedule",
  "Program",
  "FeeRule",
  "Classroom",
  "CalendarEvent",
  "Announcement",
  "SchoolSetting",
]

async function main() {
  // 1. Locate Teddy. Refuse to proceed if missing.
  const teddy = await prisma.user.findUnique({
    where: { email: TEDDY_EMAIL },
    include: { adminProfile: true },
  })
  if (!teddy) {
    throw new Error(
      `Cannot find user ${TEDDY_EMAIL}. Refusing to wipe — the admin account would be unrecoverable.`,
    )
  }
  console.log(`Found Teddy: id=${teddy.id} role=${teddy.role}`)
  if (teddy.role !== "ADMIN") {
    throw new Error(
      `User ${TEDDY_EMAIL} has role=${teddy.role}, expected ADMIN. Refusing to proceed.`,
    )
  }

  // 2. Snapshot current row counts.
  const before = await snapshot()
  console.log("\n=== Row counts BEFORE ===")
  for (const [t, n] of Object.entries(before)) console.log(`  ${t.padEnd(30)} ${n}`)

  if (!CONFIRMED) {
    console.log(
      "\nDRY RUN — not deleting. Re-run with CONFIRM=YES to actually wipe.",
    )
    return
  }

  // 3. Transactional wipe.
  console.log("\nWiping...")
  await prisma.$transaction(async (tx) => {
    // TRUNCATE every data table CASCADE — safe because Teddy's User row is in
    // a separate table that we're not truncating. AdminProfile FK references
    // User; we'll re-confirm Teddy's AdminProfile below.
    const tableList = TABLES_TO_TRUNCATE.map((t) => `"${t}"`).join(", ")
    await tx.$executeRawUnsafe(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE`)

    // Delete every User row except Teddy. CASCADE on related tables already
    // truncated, so this is just removing the rows themselves.
    await tx.user.deleteMany({ where: { email: { not: TEDDY_EMAIL } } })

    // Make sure Teddy still has an AdminProfile. CASCADE on User shouldn't
    // have hit this since we kept the User row, but truncating AdminProfile
    // would have wiped it. We didn't include AdminProfile in TABLES_TO_TRUNCATE,
    // so it should be intact — verify.
    const stillThere = await tx.adminProfile.findUnique({
      where: { userId: teddy.id },
    })
    if (!stillThere) {
      // Recreate a minimal AdminProfile if it was somehow lost.
      await tx.adminProfile.create({
        data: {
          userId: teddy.id,
          phone: teddy.adminProfile?.phone ?? "",
          title: teddy.adminProfile?.title ?? "Director",
        },
      })
    }
  })

  // 4. Snapshot after.
  const after = await snapshot()
  console.log("\n=== Row counts AFTER ===")
  for (const [t, n] of Object.entries(after)) console.log(`  ${t.padEnd(30)} ${n}`)

  console.log("\nDone. Teddy's account is preserved.")
}

async function snapshot() {
  const counts = {}
  counts.User = await prisma.user.count()
  counts.AdminProfile = await prisma.adminProfile.count()
  counts.Session = await prisma.session.count()
  counts.Family = await prisma.family.count()
  counts.Child = await prisma.child.count()
  counts.ParentProfile = await prisma.parentProfile.count()
  counts.StaffProfile = await prisma.staffProfile.count()
  counts.Classroom = await prisma.classroom.count()
  counts.Program = await prisma.program.count()
  counts.Schedule = await prisma.schedule.count()
  counts.ProgramRate = await prisma.programRate.count()
  counts.Invoice = await prisma.invoice.count()
  counts.Payment = await prisma.payment.count()
  counts.Document = await prisma.document.count()
  counts.EnrollmentLead = await prisma.enrollmentLead.count()
  counts.EnrollmentApplication = await prisma.enrollmentApplication.count()
  counts.AccountInviteToken = await prisma.accountInviteToken.count()
  counts.PasswordResetToken = await prisma.passwordResetToken.count()
  counts.AuditLog = await prisma.auditLog.count()
  counts.MessageThread = await prisma.messageThread.count()
  counts.Message = await prisma.message.count()
  counts.SchoolSetting = await prisma.schoolSetting.count()
  counts.Announcement = await prisma.announcement.count()
  counts.CalendarEvent = await prisma.calendarEvent.count()
  return counts
}

try {
  await main()
} finally {
  await prisma.$disconnect()
}
