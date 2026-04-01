import { PrismaPg } from "@prisma/adapter-pg"
import { createHash, randomUUID } from "node:crypto"

import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"
import { Pool } from "pg"

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@localhost:5432/daycare"
const adapter = new PrismaPg(new Pool({ connectionString }))
const prisma = new PrismaClient({ adapter })

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex")
}

async function seedTuitionPlans() {
  const plans = [
    {
      slug: "foundations",
      name: "Foundations",
      description: "3-day schedule for families easing into center care.",
      weeklyRateCents: 43500,
      monthlyRateCents: 188500,
      depositWeeks: 2,
    },
    {
      slug: "signature-care",
      name: "Signature Care",
      description: "5-day full-week routine with meals and enrichment.",
      weeklyRateCents: 56500,
      monthlyRateCents: 244900,
      depositWeeks: 2,
    },
    {
      slug: "extended-day",
      name: "Extended Day",
      description: "5-day schedule with early drop-off and late pickup.",
      weeklyRateCents: 64000,
      monthlyRateCents: 277400,
      depositWeeks: 2,
    },
  ]

  for (const plan of plans) {
    await prisma.tuitionPlan.upsert({
      where: { slug: plan.slug },
      create: plan,
      update: plan,
    })
  }
}

async function seedDemoFamily() {
  const parentEmail = "demo.parent@abassadorscare.com"
  const parentPassword = await hash("ParentDemo#2026", 12)

  const household = await prisma.household.upsert({
    where: { id: "demo-household" },
    create: {
      id: "demo-household",
      name: "Johnson household",
      billingEmail: parentEmail,
      phone: "(555) 214-0182",
    },
    update: {
      billingEmail: parentEmail,
      phone: "(555) 214-0182",
    },
  })

  const parentUser = await prisma.user.upsert({
    where: { email: parentEmail },
    create: {
      email: parentEmail,
      name: "Jordan Johnson",
      role: "PARENT",
      passwordHash: parentPassword,
      householdId: household.id,
    },
    update: {
      name: "Jordan Johnson",
      passwordHash: parentPassword,
      role: "PARENT",
      householdId: household.id,
    },
  })

  await prisma.householdMember.upsert({
    where: {
      householdId_userId: {
        householdId: household.id,
        userId: parentUser.id,
      },
    },
    create: {
      householdId: household.id,
      userId: parentUser.id,
      relationship: "Parent",
      isPrimary: true,
    },
    update: {
      relationship: "Parent",
      isPrimary: true,
    },
  })

  const existingChild = await prisma.child.findFirst({
    where: {
      householdId: household.id,
      firstName: "Maya",
      lastName: "Johnson",
    },
  })

  if (!existingChild) {
    await prisma.child.create({
      data: {
        householdId: household.id,
        firstName: "Maya",
        lastName: "Johnson",
        birthDate: new Date("2023-02-04"),
        startDate: new Date("2026-03-01"),
        allergies: "Strawberries",
        medicalNotes: "No current medications.",
      },
    })
  }
}

async function seedBootstrapAdminInvite() {
  const adminEmail = process.env.BOOTSTRAP_ADMIN_EMAIL ?? "admin@abassadorscare.com"
  const token = randomUUID()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

  await prisma.adminInvite.deleteMany({
    where: {
      email: adminEmail,
      status: "PENDING",
    },
  })

  await prisma.adminInvite.create({
    data: {
      email: adminEmail,
      tokenHash,
      role: "ADMIN",
      status: "PENDING",
      invitedByUserId: (await ensureSystemAdmin()).id,
      expiresAt,
    },
  })

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
  const inviteLink = `${appUrl}/accept-invite?token=${token}`
  console.log(`Bootstrap admin invite for ${adminEmail}: ${inviteLink}`)
}

async function ensureSystemAdmin() {
  const adminEmail = "system.admin@abassadorscare.com"
  const passwordHash = await hash("SystemAdmin#2026", 12)

  return prisma.user.upsert({
    where: { email: adminEmail },
    create: {
      email: adminEmail,
      name: "System Admin",
      role: "ADMIN",
      passwordHash,
    },
    update: {
      name: "System Admin",
      role: "ADMIN",
      passwordHash,
    },
  })
}

async function main() {
  await seedTuitionPlans()
  await seedDemoFamily()
  await seedBootstrapAdminInvite()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
