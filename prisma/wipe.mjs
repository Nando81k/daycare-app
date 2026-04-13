import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { randomBytes, scryptSync } from "node:crypto"

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://nando@localhost:5433/daycare_app?schema=public"
const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
})

const demoPassword = "DaycareDemo123!"

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

async function main() {
  console.log("Wiping all data…")

  await prisma.auditLog.deleteMany()
  await prisma.passwordResetToken.deleteMany()
  await prisma.accountInviteToken.deleteMany()
  await prisma.message.deleteMany()
  await prisma.messageThread.deleteMany()
  await prisma.dailyReportPhoto.deleteMany()
  await prisma.dailyReport.deleteMany()
  await prisma.attendanceRecord.deleteMany()
  await prisma.authorizedPickup.deleteMany()
  await prisma.emergencyContact.deleteMany()
  await prisma.parentChild.deleteMany()
  await prisma.document.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.invoice.deleteMany()
  await prisma.familyBillingProfile.deleteMany()
  await prisma.enrollmentLead.deleteMany()
  await prisma.staffProfile.deleteMany()
  await prisma.child.deleteMany()
  await prisma.parentProfile.deleteMany()
  await prisma.session.deleteMany()
  await prisma.calendarEvent.deleteMany()
  await prisma.schoolSetting.deleteMany()
  await prisma.announcement.deleteMany()
  await prisma.user.deleteMany()
  await prisma.classroom.deleteMany()
  await prisma.family.deleteMany()

  console.log("All tables emptied.")

  // Re-create minimal admin + parent accounts so you can log in
  const passwordHash = hashPassword(demoPassword)

  const admin = await prisma.user.create({
    data: {
      email: "admin@daycare.test",
      passwordHash,
      name: "Admin User",
      role: "ADMIN",
    },
  })
  console.log(`Created admin: ${admin.email}`)

  const parent = await prisma.user.create({
    data: {
      email: "parent@daycare.test",
      passwordHash,
      name: "Parent User",
      role: "PARENT",
    },
  })
  console.log(`Created parent: ${parent.email}`)

  console.log(`\nDone! Login with either account using password: ${demoPassword}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
