import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { createHash, randomBytes, scryptSync } from "node:crypto"

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://nando@localhost:5433/daycare_app?schema=public"
const prisma = new PrismaClient({
  adapter: new PrismaPg(databaseUrl),
})

const demoPassword = "DaycareDemo123!"

const demoInviteToken = "demo-parent-invite-token"
const demoResetToken = "demo-parent-reset-token"

// Teddy admin account password (secure but easy to type)
const teddyAdminPassword = "Ambassadors2026!"

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")

  return `${salt}:${hash}`
}

function date(value) {
  return new Date(value)
}

function hashOpaqueToken(token) {
  return createHash("sha256").update(token).digest("hex")
}

function placeholderImageUrl(label) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900">
      <rect width="1200" height="900" fill="#dce6de" />
      <rect x="72" y="72" width="1056" height="756" rx="48" fill="#f4eee5" />
      <text x="600" y="420" text-anchor="middle" font-family="Georgia, serif" font-size="54" fill="#355c59">${label}</text>
      <text x="600" y="500" text-anchor="middle" font-family="Arial, sans-serif" font-size="28" fill="#61726f">Abassadors Care</text>
    </svg>`
  )}`
}

async function resetDatabase() {
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
}

async function main() {
  await resetDatabase()

  const [willowInfants, meadowToddlers, sunrisePreschool] = await Promise.all([
    prisma.classroom.create({
      data: {
        slug: "willow-infants",
        name: "Willow Infants",
        ageGroup: "6 weeks - 15 months",
        capacity: 8,
        leadTeacherName: "Dana Lewis",
        ratioLabel: "1:4 coverage on site",
        nextEvent: "Bottle schedule review at 2:30 PM",
        note: "Full room. One likely summer transition to toddlers.",
      },
    }),
    prisma.classroom.create({
      data: {
        slug: "meadow-toddlers",
        name: "Meadow Toddlers",
        ageGroup: "15 months - 3 years",
        capacity: 14,
        leadTeacherName: "Aria Flores",
        ratioLabel: "1:6 coverage on site",
        nextEvent: "Outdoor sensory setup tomorrow",
        note: "Two part-time inquiries could fit after September schedule reset.",
      },
    }),
    prisma.classroom.create({
      data: {
        slug: "sunrise-preschool",
        name: "Sunrise Preschool",
        ageGroup: "3 - 5 years",
        capacity: 16,
        leadTeacherName: "Elena Morales",
        ratioLabel: "1:8 coverage on site",
        nextEvent: "Family breakfast Friday",
        note: "One likely June opening tied to kindergarten transition.",
      },
    }),
  ])


  const adminUser = await prisma.user.create({
    data: {
      email: "director@abassadorscare.com",
      passwordHash: hashPassword(demoPassword),
      name: "Sofia Chen",
      role: "ADMIN",
    },
  })

  // Add Teddy admin account
  await prisma.user.create({
    data: {
      email: "Teddy@Ambassadorscare.org",
      passwordHash: hashPassword(teddyAdminPassword),
      name: "Teddy Ambassadors",
      role: "ADMIN",
    },
  })

  const oliviaUser = await prisma.user.create({
    data: {
      email: "olivia@harperfamily.com",
      passwordHash: hashPassword(demoPassword),
      name: "Olivia Harper",
      role: "PARENT",
    },
  })

  const [
    marcusUser,
    luciaUser,
    rafaelUser,
    graceUser,
    taylorUser,
    aminaUser,
    faridUser,
  ] = await Promise.all([
    prisma.user.create({
      data: {
        email: "marcus@harperfamily.com",
        passwordHash: hashPassword(demoPassword),
        name: "Marcus Harper",
        role: "PARENT",
      },
    }),
    prisma.user.create({
      data: {
        email: "lucia@martinezfamily.com",
        passwordHash: hashPassword(demoPassword),
        name: "Lucia Martinez",
        role: "PARENT",
      },
    }),
    prisma.user.create({
      data: {
        email: "rafael@martinezfamily.com",
        passwordHash: hashPassword(demoPassword),
        name: "Rafael Martinez",
        role: "PARENT",
      },
    }),
    prisma.user.create({
      data: {
        email: "grace@sullivanfamily.com",
        passwordHash: hashPassword(demoPassword),
        name: "Grace Sullivan",
        role: "PARENT",
      },
    }),
    prisma.user.create({
      data: {
        email: "taylor@brooksfamily.com",
        passwordHash: hashPassword(demoPassword),
        name: "Taylor Brooks",
        role: "PARENT",
      },
    }),
    prisma.user.create({
      data: {
        email: "amina@khanfamily.com",
        passwordHash: hashPassword(demoPassword),
        name: "Amina Khan",
        role: "PARENT",
      },
    }),
    prisma.user.create({
      data: {
        email: "farid@khanfamily.com",
        passwordHash: hashPassword(demoPassword),
        name: "Farid Khan",
        role: "PARENT",
      },
    }),
  ])

  const [harperFamily, martinezFamily, sullivanFamily, brooksFamily, khanFamily] =
    await Promise.all([
      prisma.family.create({
        data: {
          familyName: "Harper Family",
          enrollmentStage: "Enrolled",
        },
      }),
      prisma.family.create({
        data: {
          familyName: "Martinez Family",
          enrollmentStage: "Enrolled",
        },
      }),
      prisma.family.create({
        data: {
          familyName: "Sullivan Family",
          enrollmentStage: "Enrolled",
        },
      }),
      prisma.family.create({
        data: {
          familyName: "Brooks Family",
          enrollmentStage: "Enrolled",
        },
      }),
      prisma.family.create({
        data: {
          familyName: "Khan Family",
          enrollmentStage: "Waitlist review",
        },
      }),
    ])

  const oliviaProfile = await prisma.parentProfile.create({
    data: {
      userId: oliviaUser.id,
      familyId: harperFamily.id,
      phone: "(617) 555-0174",
      billingContact: "Olivia Harper",
      pickupPolicy:
        "Changes to pickup contacts should be communicated before 2:00 PM whenever possible so the classroom team can confirm ID and end-of-day notes.",
      notificationPreferences: [
        {
          id: "daily-summary",
          label: "Daily summary",
          description:
            "Receive Ellie’s end-of-day summary with meals, rest, activities, and staff notes.",
          enabled: true,
        },
        {
          id: "message-alerts",
          label: "Message alerts",
          description:
            "Get notified when the classroom or office sends a new message that needs review.",
          enabled: true,
        },
        {
          id: "billing-reminders",
          label: "Billing reminders",
          description: "Receive due-date reminders for invoices and payment-related notices.",
          enabled: true,
        },
        {
          id: "event-reminders",
          label: "Event reminders",
          description:
            "Receive school and classroom event reminders the day before an event.",
          enabled: false,
        },
      ],
    },
  })

  await prisma.parentProfile.createMany({
    data: [
      {
        userId: marcusUser.id,
        familyId: harperFamily.id,
        phone: "(617) 555-0188",
        billingContact: "Olivia Harper",
        pickupPolicy:
          "Changes to pickup contacts should be communicated before 2:00 PM whenever possible so the classroom team can confirm ID and end-of-day notes.",
        notificationPreferences: [],
      },
      {
        userId: luciaUser.id,
        familyId: martinezFamily.id,
        phone: "(617) 555-0191",
        billingContact: "Lucia Martinez",
        pickupPolicy:
          "Please notify the school by early afternoon if pickup plans shift so the toddler room can confirm the change calmly.",
        notificationPreferences: [],
      },
      {
        userId: rafaelUser.id,
        familyId: martinezFamily.id,
        phone: "(617) 555-0192",
        billingContact: "Lucia Martinez",
        pickupPolicy:
          "Please notify the school by early afternoon if pickup plans shift so the toddler room can confirm the change calmly.",
        notificationPreferences: [],
      },
      {
        userId: graceUser.id,
        familyId: sullivanFamily.id,
        phone: "(617) 555-0193",
        billingContact: "Grace Sullivan",
        pickupPolicy:
          "Please notify the school by early afternoon if pickup plans shift so the infant room can confirm the change calmly.",
        notificationPreferences: [],
      },
      {
        userId: taylorUser.id,
        familyId: brooksFamily.id,
        phone: "(617) 555-0194",
        billingContact: "Taylor Brooks",
        pickupPolicy:
          "Please notify the school by early afternoon if pickup plans shift so the preschool room can confirm the change calmly.",
        notificationPreferences: [],
      },
      {
        userId: aminaUser.id,
        familyId: khanFamily.id,
        phone: "(617) 555-0195",
        billingContact: "Amina Khan",
        pickupPolicy:
          "Waitlist families can update preferred contacts anytime before an offer conversation moves forward.",
        notificationPreferences: [],
      },
      {
        userId: faridUser.id,
        familyId: khanFamily.id,
        phone: "(617) 555-0196",
        billingContact: "Amina Khan",
        pickupPolicy:
          "Waitlist families can update preferred contacts anytime before an offer conversation moves forward.",
        notificationPreferences: [],
      },
    ],
  })

  await prisma.staffProfile.createMany({
    data: [
      {
        userId: adminUser.id,
        name: "Sofia Chen",
        roleLabel: "Director",
        certification: "Administration · CPR current",
        status: "SCHEDULED",
        note: "Leads enrollment review and family communication planning.",
      },
      {
        classroomId: sunrisePreschool.id,
        name: "Elena Morales",
        roleLabel: "Lead Teacher",
        certification: "ECE Lead · CPR current",
        status: "SCHEDULED",
        note: "Leads preschool family breakfast prep this week.",
      },
      {
        classroomId: willowInfants.id,
        name: "Dana Lewis",
        roleLabel: "Lead Teacher",
        certification: "Infant/Toddler · CPR current",
        status: "SCHEDULED",
        note: "Updated bottle routine notes for two infant families.",
      },
      {
        name: "Jamie Ortiz",
        roleLabel: "Float Teacher",
        certification: "ECE Assistant · CPR current",
        status: "COVERAGE_NEEDED",
        note: "Needed to cover toddler lunch block Friday afternoon.",
      },
      {
        classroomId: meadowToddlers.id,
        name: "Monique Howard",
        roleLabel: "Assistant Teacher",
        certification: "ECE Assistant · CPR current",
        status: "OUT",
        note: "Out sick today. Substitute requested for tomorrow morning.",
      },
    ],
  })

  const [ellie, theo, ava, mason] = await Promise.all([
    prisma.child.create({
      data: {
        slug: "ellie-harper",
        familyId: harperFamily.id,
        classroomId: sunrisePreschool.id,
        firstName: "Ellie",
        lastName: "Harper",
        ageLabel: "3 years old",
        birthday: date("2023-01-12T12:00:00.000Z"),
        teacherLabel: "Ms. Elena Morales",
        summary:
          "Ellie is in a confident preschool stage and does best with calm transitions, clear expectations, and a little quiet time before group activities.",
        allergies: ["Strawberries"],
        medicalNotes: [
          "Mild eczema. Cream is kept in the classroom cubby if a dry patch needs attention.",
        ],
        comfortNotes: [
          "Usually settles fastest with a book or puzzle after arrival.",
          "Prefers water after rest time before rejoining outdoor play.",
        ],
      },
    }),
    prisma.child.create({
      data: {
        slug: "theo-martinez",
        familyId: martinezFamily.id,
        classroomId: meadowToddlers.id,
        firstName: "Theo",
        lastName: "Martinez",
        ageLabel: "19 months",
        birthday: date("2024-08-10T12:00:00.000Z"),
        teacherLabel: "Ms. Aria Flores",
        summary:
          "Theo is in an active toddler stage and settles best when outdoor play and sensory routines stay predictable.",
        allergies: [],
        medicalNotes: [],
        comfortNotes: ["Usually transitions well with a favorite truck or sensory bin invitation."],
      },
    }),
    prisma.child.create({
      data: {
        slug: "ava-sullivan",
        familyId: sullivanFamily.id,
        classroomId: willowInfants.id,
        firstName: "Ava",
        lastName: "Sullivan",
        ageLabel: "8 months",
        birthday: date("2025-08-01T12:00:00.000Z"),
        teacherLabel: "Ms. Dana Lewis",
        summary:
          "Ava responds best to a consistent feeding rhythm and a little extra quiet time after bottle feeds.",
        allergies: ["Dairy"],
        medicalNotes: ["Allergy plan reviewed with the kitchen and infant room."],
        comfortNotes: ["Settles quickly when held upright for a few minutes after feeds."],
      },
    }),
    prisma.child.create({
      data: {
        slug: "mason-brooks",
        familyId: brooksFamily.id,
        classroomId: sunrisePreschool.id,
        firstName: "Mason",
        lastName: "Brooks",
        ageLabel: "4 years old",
        birthday: date("2022-03-05T12:00:00.000Z"),
        teacherLabel: "Ms. Elena Morales",
        summary:
          "Mason thrives with clear group expectations and loves helping lead classroom routines.",
        allergies: [],
        medicalNotes: [],
        comfortNotes: ["Likes a helper role during transitions and cleanup."],
      },
    }),
  ])

  await prisma.parentChild.create({
    data: {
      parentProfileId: oliviaProfile.id,
      childId: ellie.id,
      relationship: "Mother",
    },
  })

  await prisma.emergencyContact.createMany({
    data: [
      {
        childId: ellie.id,
        name: "Olivia Harper",
        relationship: "Mother",
        phone: "(617) 555-0174",
        priority: "Primary",
      },
      {
        childId: ellie.id,
        name: "Marcus Harper",
        relationship: "Father",
        phone: "(617) 555-0188",
        priority: "Secondary",
      },
    ],
  })

  await prisma.authorizedPickup.createMany({
    data: [
      {
        childId: ellie.id,
        name: "Olivia Harper",
        relationship: "Mother",
        phone: "(617) 555-0174",
        note: "Primary pickup unless work travel changes the week.",
      },
      {
        childId: ellie.id,
        name: "Marcus Harper",
        relationship: "Father",
        phone: "(617) 555-0188",
      },
      {
        childId: ellie.id,
        name: "Aunt Nina Chen",
        relationship: "Aunt",
        phone: "(617) 555-0161",
        note: "Approved for Friday pickups with ID on file.",
      },
    ],
  })

  await prisma.attendanceRecord.createMany({
    data: [
      {
        childId: ellie.id,
        date: date("2026-04-03T12:00:00.000Z"),
        status: "PRESENT",
        checkInAt: date("2026-04-03T12:14:00.000Z"),
        checkOutAt: date("2026-04-03T20:53:00.000Z"),
        note: "Full day in Sunrise Preschool.",
      },
      {
        childId: ellie.id,
        date: date("2026-04-02T12:00:00.000Z"),
        status: "PRESENT",
        checkInAt: date("2026-04-02T12:06:00.000Z"),
        checkOutAt: date("2026-04-02T20:47:00.000Z"),
        note: "Rested quietly after lunch.",
      },
      {
        childId: ellie.id,
        date: date("2026-04-01T12:00:00.000Z"),
        status: "PRESENT",
        checkInAt: date("2026-04-01T12:22:00.000Z"),
        checkOutAt: date("2026-04-01T20:38:00.000Z"),
        note: "Outdoor play shortened for rain.",
      },
      {
        childId: ellie.id,
        date: date("2026-03-31T12:00:00.000Z"),
        status: "SCHEDULED",
        note: "Planned family day.",
      },
      {
        childId: ellie.id,
        date: date("2026-03-28T12:00:00.000Z"),
        status: "PRESENT",
        checkInAt: date("2026-03-28T12:11:00.000Z"),
        checkOutAt: date("2026-03-28T20:41:00.000Z"),
        note: "Classroom baking activity in the afternoon.",
      },
      {
        childId: theo.id,
        date: date("2026-04-03T12:00:00.000Z"),
        status: "PRESENT",
        checkInAt: date("2026-04-03T12:08:00.000Z"),
        note: "Present in Meadow Toddlers.",
      },
      {
        childId: ava.id,
        date: date("2026-04-03T12:00:00.000Z"),
        status: "ABSENT",
        note: "Planned pediatrician appointment.",
      },
      {
        childId: mason.id,
        date: date("2026-04-03T12:00:00.000Z"),
        status: "SCHEDULED",
        note: "Scheduled family day.",
      },
    ],
  })

  const ellieDailyReport = await prisma.dailyReport.create({
    data: {
      childId: ellie.id,
      date: date("2026-04-03T12:00:00.000Z"),
      arrivalMood: "Curious and settled after a short drop-off hug.",
      summary:
        "Ellie had a steady day with garden journaling, a long outdoor block, and a calm rest transition. She was especially proud of helping set up afternoon snack.",
      meals: [
        {
          label: "Morning snack",
          time: "9:15 AM",
          details: "Banana slices and whole-grain crackers",
          status: "eaten",
        },
        {
          label: "Lunch",
          time: "11:40 AM",
          details: "Turkey meatballs, rice, peas, and milk",
          status: "partial",
        },
        {
          label: "Afternoon snack",
          time: "3:05 PM",
          details: "Yogurt and cinnamon apples",
          status: "eaten",
        },
      ],
      rest: [
        {
          label: "Rest time",
          time: "12:38 PM",
          duration: "48 minutes",
          note: "Rested quietly, then looked through books until the room reset.",
        },
      ],
      activities: [
        {
          time: "9:45 AM",
          title: "Garden journal drawings",
          description: "Children sketched seedlings and talked about what plants need to grow.",
        },
        {
          time: "10:50 AM",
          title: "Outdoor climbing and trike loop",
          description:
            "Ellie spent most of the block on the climbing bridge and practiced waiting turns calmly.",
        },
        {
          time: "2:25 PM",
          title: "Small-group story retelling",
          description:
            "She volunteered details from the story and helped pass out felt pieces to friends.",
        },
      ],
      staffNotes: [
        "Ellie asked for a quieter transition into rest time and responded well when given two minutes with books first.",
        "Please send the green rain jacket tomorrow if possible. The class is planning a longer morning walk.",
      ],
    },
  })

  await prisma.dailyReportPhoto.createMany({
    data: [
      {
        dailyReportId: ellieDailyReport.id,
        title: "Garden sketch table",
        caption:
          "Focused on drawing seed trays and naming the colors she could see in the planters.",
        fileName: "garden-sketch-table.svg",
        blobPathname: "seed/daily-reports/ellie/garden-sketch-table.svg",
        blobUrl: placeholderImageUrl("Garden Sketch"),
        blobDownloadUrl: placeholderImageUrl("Garden Sketch"),
        contentType: "image/svg+xml",
        sizeBytes: 2048,
        uploadedByUserId: adminUser.id,
      },
      {
        dailyReportId: ellieDailyReport.id,
        title: "Outdoor balance bridge",
        caption:
          "Practicing careful steps and cheering on classmates during the second outdoor block.",
        fileName: "outdoor-balance-bridge.svg",
        blobPathname: "seed/daily-reports/ellie/outdoor-balance-bridge.svg",
        blobUrl: placeholderImageUrl("Balance Bridge"),
        blobDownloadUrl: placeholderImageUrl("Balance Bridge"),
        contentType: "image/svg+xml",
        sizeBytes: 2048,
        uploadedByUserId: adminUser.id,
      },
    ],
  })

  const [, marchInvoice] = await Promise.all([
    prisma.invoice.create({
      data: {
        familyId: harperFamily.id,
        label: "April Tuition",
        description: "Five-day preschool tuition for April.",
        amountCents: 152000,
        dueDate: date("2026-04-10T17:00:00.000Z"),
        status: "DUE",
      },
    }),
    prisma.invoice.create({
      data: {
        familyId: harperFamily.id,
        label: "March Tuition",
        description: "Five-day preschool tuition for March.",
        amountCents: 152000,
        dueDate: date("2026-03-10T17:00:00.000Z"),
        status: "PAID",
        paidAt: date("2026-03-08T15:30:00.000Z"),
      },
    }),
    prisma.invoice.create({
      data: {
        familyId: harperFamily.id,
        label: "May Tuition",
        description: "Draft preschool tuition invoice for May.",
        amountCents: 152000,
        dueDate: date("2026-05-10T17:00:00.000Z"),
        status: "DRAFT",
      },
    }),
  ])

  await prisma.invoice.createMany({
    data: [
      {
        familyId: brooksFamily.id,
        label: "April Tuition",
        description: "Five-day preschool tuition for April.",
        amountCents: 152000,
        dueDate: date("2026-04-07T17:00:00.000Z"),
        status: "DUE",
      },
      {
        familyId: brooksFamily.id,
        label: "March Tuition",
        description: "Three-day preschool tuition for March.",
        amountCents: 65000,
        dueDate: date("2026-03-10T17:00:00.000Z"),
        status: "DUE",
      },
      {
        familyId: martinezFamily.id,
        label: "April Tuition",
        description: "Toddler tuition for April.",
        amountCents: 148000,
        dueDate: date("2026-04-10T17:00:00.000Z"),
        status: "PAID",
        paidAt: date("2026-04-04T14:00:00.000Z"),
      },
      {
        familyId: sullivanFamily.id,
        label: "April Tuition",
        description: "Infant tuition for April.",
        amountCents: 164000,
        dueDate: date("2026-04-10T17:00:00.000Z"),
        status: "PAID",
        paidAt: date("2026-04-02T13:00:00.000Z"),
      },
    ],
  })

  await prisma.payment.createMany({
    data: [
      {
        familyId: harperFamily.id,
        invoiceId: marchInvoice.id,
        label: "March Tuition",
        amountCents: 152000,
        method: "Visa ending in 4242",
        status: "PAID",
        paidAt: date("2026-03-08T15:30:00.000Z"),
      },
      {
        familyId: harperFamily.id,
        label: "Annual registration fee",
        amountCents: 15000,
        method: "Bank transfer",
        status: "PAID",
        paidAt: date("2026-01-12T15:00:00.000Z"),
      },
      {
        familyId: brooksFamily.id,
        label: "March partial payment",
        amountCents: 25000,
        method: "ACH on file",
        status: "PROCESSING",
        paidAt: date("2026-04-02T18:00:00.000Z"),
      },
    ],
  })

  await prisma.familyBillingProfile.createMany({
    data: [
      {
        familyId: harperFamily.id,
        defaultPaymentMethodId: "pm_seed_harper_4242",
        defaultPaymentMethodBrand: "visa",
        defaultPaymentMethodLast4: "4242",
        defaultPaymentMethodLabel: "Visa ending in 4242",
      },
      {
        familyId: brooksFamily.id,
        defaultPaymentMethodId: "pm_seed_brooks_1881",
        defaultPaymentMethodBrand: "visa",
        defaultPaymentMethodLast4: "1881",
        defaultPaymentMethodLabel: "Visa ending in 1881",
        lastPaymentError: "Awaiting the final result of the March partial payment.",
      },
    ],
  })

  await prisma.document.createMany({
    data: [
      {
        familyId: harperFamily.id,
        childId: ellie.id,
        title: "Garden field trip waiver",
        category: "Permission",
        owner: "Preschool",
        status: "REQUIRED",
        dueDate: date("2026-04-07T17:00:00.000Z"),
        note: "Needed before next Thursday’s classroom garden trip.",
      },
      {
        familyId: harperFamily.id,
        childId: ellie.id,
        title: "Medication authorization",
        category: "Health",
        owner: "Front office",
        status: "APPROVED",
        note: "Current through the spring term.",
        approvedAt: date("2026-02-14T15:00:00.000Z"),
        reviewedByName: "Sofia Chen",
      },
      {
        familyId: harperFamily.id,
        childId: ellie.id,
        title: "Emergency contact sheet",
        category: "Family information",
        owner: "Front office",
        status: "SUBMITTED",
        note: "Pending review after the new pickup contact was added.",
        fileName: "ellie-emergency-contacts.pdf",
        blobPathname: "seed/documents/ellie-emergency-contacts.pdf",
        blobUrl: "https://example.com/ellie-emergency-contacts.pdf",
        blobDownloadUrl: "https://example.com/ellie-emergency-contacts.pdf",
        contentType: "application/pdf",
        sizeBytes: 128000,
        submittedAt: date("2026-04-02T16:45:00.000Z"),
      },
      {
        familyId: harperFamily.id,
        childId: ellie.id,
        title: "Allergy action plan",
        category: "Health",
        owner: "Preschool",
        status: "APPROVED",
        note: "Shared with classroom and kitchen staff.",
        approvedAt: date("2026-01-20T13:15:00.000Z"),
        reviewedByName: "Sofia Chen",
      },
      {
        familyId: sullivanFamily.id,
        childId: ava.id,
        title: "Allergy action plan",
        category: "Health",
        owner: "Infant room",
        status: "APPROVED",
        note: "Current plan confirmed with kitchen staff.",
        approvedAt: date("2026-03-04T12:30:00.000Z"),
        reviewedByName: "Sofia Chen",
      },
      {
        familyId: brooksFamily.id,
        childId: mason.id,
        title: "Emergency contact update",
        category: "Family information",
        owner: "Front office",
        status: "SUBMITTED",
        note: "New pickup contact awaiting final review.",
        fileName: "mason-emergency-update.pdf",
        blobPathname: "seed/documents/mason-emergency-update.pdf",
        blobUrl: "https://example.com/mason-emergency-update.pdf",
        blobDownloadUrl: "https://example.com/mason-emergency-update.pdf",
        contentType: "application/pdf",
        sizeBytes: 96000,
        submittedAt: date("2026-04-01T11:20:00.000Z"),
      },
      {
        familyId: brooksFamily.id,
        childId: mason.id,
        title: "Medication authorization",
        category: "Health",
        owner: "Front office",
        status: "EXPIRED",
        dueDate: date("2026-03-22T17:00:00.000Z"),
        note: "Renewal reminder already sent to family.",
        reviewedByName: "Sofia Chen",
      },
    ],
  })

  const fieldTripThread = await prisma.messageThread.create({
    data: {
      familyId: harperFamily.id,
      subject: "Field trip waiver reminder",
      classroomLabel: "Sunrise Preschool",
      status: "RESPONSE_NEEDED",
      participants: ["Ms. Elena Morales", "Olivia Harper"],
      lastMessageAt: date("2026-04-03T18:28:00.000Z"),
    },
  })

  const restThread = await prisma.messageThread.create({
    data: {
      familyId: harperFamily.id,
      subject: "Rest time update",
      classroomLabel: "Sunrise Preschool",
      status: "ACTIVE",
      participants: ["Ms. Elena Morales", "Marcus Harper", "Olivia Harper"],
      lastMessageAt: date("2026-04-02T21:03:00.000Z"),
    },
  })

  const billingThread = await prisma.messageThread.create({
    data: {
      familyId: harperFamily.id,
      subject: "April tuition timing",
      classroomLabel: "Billing",
      status: "CLOSED",
      participants: ["Billing Office", "Olivia Harper"],
      lastMessageAt: date("2026-03-28T14:14:00.000Z"),
    },
  })

  await prisma.message.createMany({
    data: [
      {
        threadId: fieldTripThread.id,
        senderName: "Ms. Elena Morales",
        role: "STAFF",
        body: "Hi Olivia, we’re finalizing next Thursday’s garden trip headcount. Can you confirm whether Ellie will attend so we can keep the class roster accurate?",
        sentAt: date("2026-04-03T18:16:00.000Z"),
      },
      {
        threadId: fieldTripThread.id,
        authorUserId: oliviaUser.id,
        senderName: "Olivia Harper",
        role: "PARENT",
        body: "Thanks for the reminder. We’re planning for her to attend. I’ll complete the waiver tonight.",
        sentAt: date("2026-04-03T18:28:00.000Z"),
      },
      {
        threadId: restThread.id,
        senderName: "Ms. Elena Morales",
        role: "STAFF",
        body: "Quick note from today: Ellie settled more easily into rest after we gave her a quieter two-minute transition with books. We’ll keep that in place this week.",
        sentAt: date("2026-04-02T20:42:00.000Z"),
      },
      {
        threadId: restThread.id,
        senderName: "Marcus Harper",
        role: "PARENT",
        body: "That sounds helpful. We’ve been doing something similar at home before bedtime too.",
        sentAt: date("2026-04-02T21:03:00.000Z"),
      },
      {
        threadId: billingThread.id,
        senderName: "Billing Office",
        role: "DIRECTOR",
        body: "Your April tuition invoice is ready in the portal. Please let us know if your billing contact should change before the due date.",
        sentAt: date("2026-03-28T14:14:00.000Z"),
      },
    ],
  })

  await prisma.enrollmentLead.createMany({
    data: [
      {
        familyId: harperFamily.id,
        familyName: "Ramirez Family",
        parentName: "Ana Ramirez",
        email: "ana@ramirezfamily.com",
        phone: "(617) 555-0101",
        childName: "Noah Ramirez",
        childAgeLabel: "Toddler",
        requestedStart: "May 2026",
        programInterest: "Toddler program",
        source: "Website contact form",
        leadType: "CONTACT",
        stage: "CONTACTED",
        priority: "HIGH",
        assignedTo: "Sofia Chen",
        note: "Parents asked about early drop-off options and upcoming toddler openings.",
        createdAt: date("2026-04-02T14:00:00.000Z"),
      },
      {
        familyId: sullivanFamily.id,
        familyName: "Bennett Family",
        parentName: "Maya Bennett",
        email: "maya@bennettfamily.com",
        phone: "(617) 555-0102",
        childName: "Lena Bennett",
        childAgeLabel: "Infant",
        requestedStart: "June 2026",
        programInterest: "Infant care",
        source: "Website contact form",
        leadType: "CONTACT",
        stage: "CONTACTED",
        priority: "NORMAL",
        assignedTo: "Sofia Chen",
        note: "Looking for a first childcare placement and wants a smaller classroom feel.",
        createdAt: date("2026-04-01T16:00:00.000Z"),
      },
      {
        familyId: khanFamily.id,
        familyName: "Khan Family",
        parentName: "Amina Khan",
        email: "amina@khanfamily.com",
        phone: "(617) 555-0103",
        childName: "Amira Khan",
        childAgeLabel: "Preschool",
        requestedStart: "June 2026",
        programInterest: "Preschool program",
        source: "Waitlist form",
        leadType: "CONTACT",
        stage: "APPLICATION_SENT",
        priority: "NORMAL",
        assignedTo: "Mina Patel",
        note: "Family asked about kindergarten readiness support. Application sent.",
        createdAt: date("2026-03-31T15:00:00.000Z"),
      },
      {
        familyId: brooksFamily.id,
        familyName: "Owens Family",
        parentName: "Seth Owens",
        email: "seth@owensfamily.com",
        phone: "(617) 555-0104",
        childName: "Miles Owens",
        childAgeLabel: "Toddler",
        requestedStart: "August 2026",
        programInterest: "Toddler program",
        source: "Community referral",
        leadType: "CONTACT",
        stage: "APPLICATION_SENT",
        priority: "NORMAL",
        assignedTo: "Mina Patel",
        note: "Sibling may enroll next year. Family is reviewing tuition and calendar fit.",
        createdAt: date("2026-03-29T14:30:00.000Z"),
      },
      {
        familyId: khanFamily.id,
        familyName: "Khan Family",
        parentName: "Amina Khan",
        email: "amina@khanfamily.com",
        phone: "(617) 555-0103",
        childName: "Amira Khan",
        childAgeLabel: "4 years old",
        requestedStart: "June 2026",
        programInterest: "Preschool program",
        source: "Waitlist form",
        leadType: "WAITLIST",
        stage: "CONTACTED",
        priority: "HIGH",
        assignedTo: "Mina Patel",
        note: "Likely preschool opening after end-of-term move-out.",
        scheduleNeed: "Full time",
        waitlistStatus: "REVIEW",
        referralSource: "Website",
        createdAt: date("2026-03-31T14:30:00.000Z"),
      },
      {
        familyName: "Lee Family",
        parentName: "Jina Lee",
        email: "jina@leefamily.com",
        phone: "(617) 555-0105",
        childName: "Isaac Lee",
        childAgeLabel: "18 months",
        requestedStart: "September 2026",
        programInterest: "Toddler program",
        source: "Waitlist form",
        leadType: "WAITLIST",
        stage: "CONTACTED",
        priority: "MEDIUM",
        assignedTo: "Sofia Chen",
        note: "Parents interested once the toddler room summer schedule is posted.",
        scheduleNeed: "3 days per week",
        waitlistStatus: "REVIEW",
        referralSource: "Friend referral",
        createdAt: date("2026-03-30T15:00:00.000Z"),
      },
      {
        familyName: "Santos Family",
        parentName: "Lia Santos",
        email: "lia@santosfamily.com",
        phone: "(617) 555-0106",
        childName: "Eva Santos",
        childAgeLabel: "8 months",
        requestedStart: "July 2026",
        programInterest: "Infant care",
        source: "Waitlist form",
        leadType: "WAITLIST",
        stage: "CONTACTED",
        priority: "HIGH",
        assignedTo: "Sofia Chen",
        note: "Infant room has a likely opening; family needs final decision call this week.",
        scheduleNeed: "Full time",
        waitlistStatus: "OFFER_READY",
        referralSource: "Neighborhood parent group",
        createdAt: date("2026-03-29T11:00:00.000Z"),
      },
      {
        familyName: "Greene Family",
        parentName: "Maya Greene",
        email: "maya@greenefamily.com",
        phone: "(617) 555-0107",
        childName: "Nora Greene",
        childAgeLabel: "2 years old",
        requestedStart: "January 2027",
        programInterest: "Toddler program",
        source: "Waitlist form",
        leadType: "WAITLIST",
        stage: "CONTACTED",
        priority: "LOW",
        assignedTo: "Mina Patel",
        note: "Planning ahead while family relocates in late fall.",
        scheduleNeed: "Morning schedule",
        waitlistStatus: "LONG_RANGE",
        referralSource: "Website",
        createdAt: date("2026-03-28T13:00:00.000Z"),
      },
    ],
  })

  await prisma.announcement.createMany({
    data: [
      {
        title: "Spring family breakfast reminder",
        audience: "All families",
        publishStatus: "SCHEDULED",
        scheduledFor: date("2026-04-08T22:00:00.000Z"),
        summary:
          "Reminder with parking notes, breakfast timing, and classroom check-in details.",
      },
      {
        title: "Infant room supply note",
        audience: "Infant families",
        publishStatus: "DRAFT",
        summary:
          "Request for labeled extra outfits and updated comfort items before the weather shift.",
      },
      {
        title: "Professional development closure follow-up",
        audience: "All families",
        publishStatus: "PUBLISHED",
        scheduledFor: date("2026-04-01T20:30:00.000Z"),
        summary:
          "Closure reminder and thank-you note with upcoming classroom prep highlights.",
      },
    ],
  })

  await prisma.calendarEvent.createMany({
    data: [
      {
        title: "Spring family breakfast",
        date: date("2026-04-11T12:00:00.000Z"),
        timeLabel: "8:00 AM",
        category: "FAMILY",
        description:
          "Families are invited to join the preschool room for breakfast before morning circle.",
      },
      {
        classroomId: sunrisePreschool.id,
        title: "Garden walk and planting day",
        date: date("2026-04-18T13:30:00.000Z"),
        timeLabel: "9:30 AM",
        category: "CLASSROOM",
        description:
          "Children will visit the neighborhood garden for planting and journal sketches.",
      },
      {
        title: "Professional development closure",
        date: date("2026-04-26T12:00:00.000Z"),
        timeLabel: "All day",
        category: "CLOSURE",
        description: "School closed for staff development and classroom prep.",
      },
    ],
  })

  await prisma.schoolSetting.createMany({
    data: [
      {
        sectionKey: "school-defaults",
        sectionTitle: "School defaults",
        sectionDescription:
          "Operational settings that shape enrollment and family communication.",
        label: "Business hours",
        value: "7:30 AM - 5:45 PM",
        sortOrder: 1,
      },
      {
        sectionKey: "school-defaults",
        sectionTitle: "School defaults",
        sectionDescription:
          "Operational settings that shape enrollment and family communication.",
        label: "Open house schedule",
        value: "Monthly community open house events",
        sortOrder: 2,
      },
      {
        sectionKey: "school-defaults",
        sectionTitle: "School defaults",
        sectionDescription:
          "Operational settings that shape enrollment and family communication.",
        label: "Waitlist follow-up cadence",
        value: "Within 2 business days",
        note: "Long-range families reviewed monthly.",
        sortOrder: 3,
      },
      {
        sectionKey: "billing-rules",
        sectionTitle: "Billing rules",
        sectionDescription:
          "Parent-facing payment expectations that should remain easy to explain.",
        label: "Monthly tuition due",
        value: "10th of each month",
        sortOrder: 1,
      },
      {
        sectionKey: "billing-rules",
        sectionTitle: "Billing rules",
        sectionDescription:
          "Parent-facing payment expectations that should remain easy to explain.",
        label: "Late reminder sequence",
        value: "3, 7, and 14 days after due date",
        sortOrder: 2,
      },
      {
        sectionKey: "notification-settings",
        sectionTitle: "Notification settings",
        sectionDescription:
          "How the school currently frames family communication priorities.",
        label: "Urgent alerts",
        value: "Email and call",
        sortOrder: 1,
      },
      {
        sectionKey: "notification-settings",
        sectionTitle: "Notification settings",
        sectionDescription:
          "How the school currently frames family communication priorities.",
        label: "General announcements",
        value: "Email digest and portal notice",
        sortOrder: 2,
      },
      {
        sectionKey: "notification-settings",
        sectionTitle: "Notification settings",
        sectionDescription:
          "How the school currently frames family communication priorities.",
        label: "Classroom updates",
        value: "Parent portal daily summary",
        sortOrder: 3,
      },
    ],
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: adminUser.id,
      action: "seed.run",
      subjectType: "system",
      subjectId: "operational-completion-seed",
      details: {
        note: "Operational completion seed completed.",
        demoInviteToken,
        demoResetToken,
      },
    },
  })

  await prisma.accountInviteToken.create({
    data: {
      tokenHash: hashOpaqueToken(demoInviteToken),
      userId: marcusUser.id,
      email: marcusUser.email,
      role: "PARENT",
      expiresAt: date("2026-04-10T17:00:00.000Z"),
      issuedByUserId: adminUser.id,
    },
  })

  await prisma.user.update({
    where: {
      id: marcusUser.id,
    },
    data: {
      mustSetPassword: true,
    },
  })

  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashOpaqueToken(demoResetToken),
      userId: oliviaUser.id,
      expiresAt: date("2026-04-03T23:59:00.000Z"),
    },
  })

  console.log("Seeded daycare app data.")
  console.log(`Parent login: ${oliviaUser.email} / ${demoPassword}`)
  console.log(`Admin login: ${adminUser.email} / ${demoPassword}`)
  console.log(`Demo invite token (${marcusUser.email}): ${demoInviteToken}`)
  console.log(`Demo reset token: ${demoResetToken}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
