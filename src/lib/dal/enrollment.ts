import "server-only"

import { format } from "date-fns"

import { db } from "@/lib/db"

export async function getParentEnrollmentApplications(parentUserId: string) {
  return db.enrollmentApplication.findMany({
    where: { parentUserId },
    orderBy: { submittedAt: "desc" },
    include: {
      documents: true,
      events: {
        orderBy: { createdAt: "desc" },
      },
    },
  })
}

export async function getAdminEnrollmentPipeline() {
  const applications = await db.enrollmentApplication.findMany({
    orderBy: [{ submittedAt: "desc" }],
    include: {
      parentUser: {
        select: {
          name: true,
          email: true,
        },
      },
      events: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  })

  const byStatus = applications.reduce<Record<string, number>>((acc, application) => {
    acc[application.status] = (acc[application.status] ?? 0) + 1
    return acc
  }, {})

  return {
    applications: applications.map((application) => ({
      id: application.id,
      family: application.primaryContactName,
      child: `${application.childFirstName} ${application.childLastName}`,
      program: application.desiredProgramSlug,
      startDate: format(application.desiredStartDate, "MMM d, yyyy"),
      stage: application.status,
      submittedAt: format(application.submittedAt, "MMM d, yyyy"),
      priority:
        application.status === "UNDER_REVIEW" || application.status === "TOUR_SCHEDULED"
          ? "High"
          : application.status === "SUBMITTED"
            ? "Medium"
            : "Low",
      parentEmail: application.parentUser.email,
      latestEvent: application.events[0]?.title ?? "Submitted",
    })),
    counts: {
      openLeads:
        (byStatus.SUBMITTED ?? 0) + (byStatus.UNDER_REVIEW ?? 0) + (byStatus.TOUR_SCHEDULED ?? 0),
      accepted: byStatus.ACCEPTED ?? 0,
      waitlisted: byStatus.WAITLISTED ?? 0,
      total: applications.length,
    },
  }
}
