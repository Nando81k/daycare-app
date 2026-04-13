import type {
  AdminAnnouncementPreview,
  AdminBillingReminderPreview,
  AdminCalendarEventPreview,
  AdminChildRecordPreview,
  AdminMessageThreadPreview,
  DocumentQueuePreview,
  EnrollmentLeadPreview,
  FamilyBalancePreview,
  FamilyDirectoryPreview,
  StaffProfilePreview,
  StatusBadgeVariant,
  WaitlistEntryPreview,
} from "@/types/app"

export function formatAdminLabel(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

export function getEnrollmentStageVariant(
  stage: EnrollmentLeadPreview["stage"]
): StatusBadgeVariant {
  switch (stage) {
    case "tour-requested":
      return "warning"
    case "contacted":
      return "info"
    case "tour-scheduled":
      return "success"
    case "application-sent":
      return "secondary"
    case "accepted":
      return "success"
    case "denied":
      return "destructive"
  }
}

export function getMessageStatusVariant(
  status: AdminMessageThreadPreview["status"]
): StatusBadgeVariant {
  switch (status) {
    case "open":
      return "info"
    case "closed":
      return "secondary"
  }
}

export function getPriorityVariant(
  priority: EnrollmentLeadPreview["priority"] | WaitlistEntryPreview["priority"]
): StatusBadgeVariant {
  switch (priority) {
    case "high":
      return "warning"
    case "medium":
      return "info"
    case "normal":
      return "secondary"
    case "low":
      return "secondary"
  }
}

export function getWaitlistStatusVariant(
  status: WaitlistEntryPreview["status"]
): StatusBadgeVariant {
  switch (status) {
    case "offer-ready":
      return "success"
    case "tour-pending":
      return "info"
    case "review":
      return "warning"
    case "long-range":
      return "secondary"
  }
}

export function getChildAttendanceVariant(
  status: AdminChildRecordPreview["attendanceStatus"]
): StatusBadgeVariant {
  switch (status) {
    case "present":
      return "success"
    case "scheduled":
      return "info"
    case "absent":
      return "warning"
  }
}

export function getFamilyBalanceVariant(
  status: FamilyBalancePreview["status"] | FamilyDirectoryPreview["balanceStatus"]
): StatusBadgeVariant {
  switch (status) {
    case "current":
      return "success"
    case "due":
      return "warning"
    case "overdue":
      return "destructive"
  }
}

export function getDocumentVariant(
  status: DocumentQueuePreview["status"] | AdminChildRecordPreview["documentsStatus"]
): StatusBadgeVariant {
  switch (status) {
    case "approved":
    case "complete":
      return "success"
    case "submitted":
      return "info"
    case "required":
    case "pending":
      return "warning"
    case "expired":
      return "destructive"
  }
}

export function getAnnouncementVariant(
  status: AdminAnnouncementPreview["publishStatus"]
): StatusBadgeVariant {
  switch (status) {
    case "published":
      return "success"
    case "scheduled":
      return "info"
    case "draft":
      return "secondary"
  }
}

export function getCalendarEventVariant(
  category: AdminCalendarEventPreview["category"]
): StatusBadgeVariant {
  switch (category) {
    case "family":
      return "success"
    case "classroom":
      return "info"
    case "closure":
      return "destructive"
  }
}

export function getBillingReminderVariant(
  status: AdminBillingReminderPreview["status"]
): StatusBadgeVariant {
  switch (status) {
    case "due":
      return "warning"
    case "overdue":
      return "destructive"
  }
}

export function getStaffVariant(status: StaffProfilePreview["status"]): StatusBadgeVariant {
  switch (status) {
    case "scheduled":
      return "success"
    case "coverage-needed":
      return "warning"
    case "out":
      return "destructive"
  }
}
