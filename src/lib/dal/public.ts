import type {
  ContactFormValues,
  WaitlistFormValues,
} from "@/types/app"
import { prisma } from "@/lib/db"

function deriveFamilyName(parentName: string) {
  const lastName = parentName.trim().split(/\s+/).at(-1)
  return lastName ? `${lastName} Family` : "Prospective Family"
}

function getLeadPriority(startLabel: string) {
  if (startLabel.includes("As soon as") || startLabel.includes("1-3 months")) {
    return "HIGH" as const
  }

  if (startLabel.includes("3-6 months")) {
    return "NORMAL" as const
  }

  return "LOW" as const
}

export async function createWaitlistLead(values: WaitlistFormValues) {
  const familyName = deriveFamilyName(values.parentName)

  const lead = await prisma.enrollmentLead.create({
    data: {
      parentName: values.parentName,
      familyName,
      email: values.email.trim().toLowerCase(),
      phone: values.phone,
      childName: values.childName,
      childAgeLabel: values.childAgeRange,
      requestedStart: values.preferredStartMonth,
      programInterest: values.programInterest,
      source: "Waitlist form",
      leadType: "WAITLIST",
      stage: "CONTACTED",
      priority: getLeadPriority(values.preferredStartMonth),
      assignedTo: "Sofia Chen",
      note: values.notes || "New waitlist request awaiting first review.",
      scheduleNeed: values.scheduleNeed,
      waitlistStatus: "REVIEW",
      referralSource: values.referralSource,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "lead.create",
      subjectType: "enrollmentLead",
      subjectId: lead.id,
      details: {
        source: "waitlist",
      },
    },
  })

  return lead.id
}

export async function createContactLead(values: ContactFormValues) {
  const familyName = deriveFamilyName(values.parentName)

  const lead = await prisma.enrollmentLead.create({
    data: {
      parentName: values.parentName,
      familyName,
      email: values.email.trim().toLowerCase(),
      phone: values.phone || "(not provided)",
      childName: "General inquiry",
      childAgeLabel: "Not specified",
      requestedStart: "Not specified",
      programInterest: values.topic,
      source: "Website contact form",
      leadType: "CONTACT",
      stage: "CONTACTED",
      priority: "NORMAL",
      assignedTo: "Sofia Chen",
      note: values.message,
    },
  })

  await prisma.auditLog.create({
    data: {
      action: "lead.create",
      subjectType: "enrollmentLead",
      subjectId: lead.id,
      details: {
        source: "contact",
      },
    },
  })

  return lead.id
}
