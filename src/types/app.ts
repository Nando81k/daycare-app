import type { LucideIcon } from "lucide-react"
import type { ComponentPropsWithoutRef, ReactNode } from "react"

export type PortalKind = "parent" | "admin"

export type SiteMetadata = {
  title: string
  description: string
  pathname?: string
}

export type BrandConfig = {
  name: string
  shortName: string
  siteUrl: string
  description: string
  supportEmail: string
  phone: string
  address: string
  tagline: string
  primaryCtaLabel: string
}

export type SiteNavLink = {
  label: string
  href: string
  description?: string
  accent?: boolean
}

export type PortalNavItem = {
  title: string
  href: string
  icon: LucideIcon
  badge?: string
  summary?: string
}

export type PortalNavGroup = {
  title: string
  items: PortalNavItem[]
}

export type StatusBadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive"
  | "info"

export type MarketingMediaAsset = {
  src: string
  alt: string
  caption?: string
  objectPosition?: string
}

export type PageIntroProps = {
  eyebrow?: string
  title: string
  description: string
  actions?: ReactNode
  align?: "start" | "center"
}

export type SectionShellProps = {
  eyebrow?: string
  title?: string
  description?: string
  children: ReactNode
  actions?: ReactNode
  className?: string
  contentClassName?: string
}

export type SurfaceCardProps = ComponentPropsWithoutRef<"div"> & {
  tone?: "default" | "accent" | "muted" | "strong"
  interactive?: boolean
  density?: "default" | "compact"
}

export type StatCardProps = {
  label: string
  value: string
  description?: string
  trend?: string
  icon?: LucideIcon
  density?: "default" | "compact"
}

export type TableSurfaceProps = {
  title: string
  description?: string
  children: ReactNode
  toolbar?: ReactNode
  footer?: ReactNode
  className?: string
  size?: "default" | "compact"
  contentClassName?: string
}

export type FormSectionProps = {
  title: string
  description?: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export type EmptyStateProps = {
  title: string
  description: string
  icon?: LucideIcon
  action?: ReactNode
}

export type AlertBannerProps = {
  title: string
  description: string
  tone?: "default" | "success" | "warning" | "destructive" | "info"
  action?: ReactNode
}

export type ProgramSummary = {
  id: string
  name: string
  ageRange: string
  schedule: string
  summary: string
}

export type ProgramDetail = ProgramSummary & {
  overview: string
  learningFocus: string
  dailyRhythm: string[]
  careHighlights: string[]
  environmentNote: string
  featuredMoments: string[]
}

export type FaqItem = {
  question: string
  answer: string
}

export type FaqGroup = {
  id: string
  title: string
  description: string
  items: FaqItem[]
}

export type TuitionTier = {
  name: string
  cadence: string
  amount: string
  blurb: string
  includes: string[]
  note?: string
}

export type ValuePillar = {
  title: string
  description: string
  points: string[]
}

export type TrustPoint = {
  title: string
  description: string
  detail: string
}

export type Testimonial = {
  quote: string
  parentName: string
  childStage: string
  tenure: string
}

export type GalleryMoment = {
  title: string
  description: string
  timeframe: string
}

export type ContactMethod = {
  label: string
  value: string
  href: string
  description: string
}

export type WaitlistFormValues = {
  parentName: string
  email: string
  phone: string
  childName: string
  childAgeRange: string
  programInterest: string
  scheduleNeed: string
  preferredStartMonth: string
  referralSource: string
  notes: string
}

export type ContactFormValues = {
  parentName: string
  email: string
  phone: string
  topic: string
  message: string
}

export type ParentReminder = {
  label: string
  value: string
  tone?: StatusBadgeVariant
}

export type MinimalChildPreview = {
  id: string
  name: string
  ageLabel: string
  classroom: string
  attendanceNote: string
}

export type ParentEmergencyContactPreview = {
  name: string
  relationship: string
  phone: string
  priority: "Primary" | "Secondary"
}

export type AuthorizedPickupPreview = {
  id: string
  name: string
  relationship: string
  phone: string
  note?: string
}

export type ChildProfilePreview = MinimalChildPreview & {
  birthday: string
  teacher: string
  summary: string
  allergies: string[]
  medicalNotes: string[]
  comfortNotes: string[]
  emergencyContacts: ParentEmergencyContactPreview[]
  authorizedPickups: AuthorizedPickupPreview[]
}

export type MinimalInvoicePreview = {
  id: string
  label: string
  amount: string
  dueDate: string
  status: "paid" | "due" | "draft"
  description?: string
}

export type ParentPaymentPreview = {
  id: string
  label: string
  date: string
  amount: string
  method: string
  status: "paid" | "processing" | "failed"
}

export type ParentPaymentMethodPreview = {
  familyId: string
  label: string
  detail: string
  note: string
  brand?: string
  last4?: string
  stripeConfigured: boolean
}

export type DailyMealPreview = {
  label: string
  time: string
  details: string
  status: "eaten" | "partial" | "skipped"
}

export type DailyRestPreview = {
  label: string
  time: string
  duration: string
  note: string
}

export type DailyActivityPreview = {
  time: string
  title: string
  description: string
}

export type DailyPhotoPreview = {
  id: string
  title: string
  caption: string
  url?: string
  downloadUrl?: string
  uploadedAt?: string
}

export type DailyReportPreview = {
  dateLabel: string
  arrivalMood: string
  summary: string
  meals: DailyMealPreview[]
  rest: DailyRestPreview[]
  activities: DailyActivityPreview[]
  staffNotes: string[]
  photos: DailyPhotoPreview[]
}

export type ParentMessagePreview = {
  id: string
  sender: string
  role: "staff" | "parent" | "director"
  sentAt: string
  body: string
}

export type ParentMessageThreadPreview = {
  id: string
  subject: string
  classroom: string
  lastMessageAt: string
  preview: string
  unreadCount: number
  status: "active" | "response-needed" | "closed"
  participants: string[]
  messages: ParentMessagePreview[]
}

export type ParentDocumentPreview = {
  id: string
  title: string
  category: string
  status: "required" | "submitted" | "approved" | "expired"
  dueDate?: string
  lastUpdated: string
  note: string
  fileName?: string
  downloadUrl?: string
  submittedAt?: string
  sizeLabel?: string
}

export type ParentEventPreview = {
  id: string
  title: string
  dateLabel: string
  timeLabel: string
  startsAtIso: string
  timeKind: "timed" | "all-day" | "deadline"
  category: "classroom" | "family" | "closure" | "billing"
  description: string
  classroomLabel?: string
}

export type ParentAttendanceRecordPreview = {
  dateLabel: string
  checkIn?: string
  checkOut?: string
  status: "present" | "absent" | "scheduled"
  note: string
}

export type ParentNotificationPreference = {
  id: string
  label: string
  description: string
  enabled: boolean
}

export type ParentSettingsPreview = {
  accountEmail: string
  phone: string
  billingContact: string
  pickupPolicy: string
  notificationPreferences: ParentNotificationPreference[]
}

export type EnrollmentPreview = {
  id: string
  familyName: string
  childName: string
  stage: string
  requestedStart: string
}

export type AnnouncementPreview = {
  id: string
  title: string
  audience: string
  publishStatus: "scheduled" | "draft" | "published"
}

export type ParentDashboardPreview = {
  child: ChildProfilePreview
  dailyReport: DailyReportPreview
  reminders: ParentReminder[]
  invoice: MinimalInvoicePreview
  documents: ParentDocumentPreview[]
  threads: ParentMessageThreadPreview[]
  upcomingEvents: ParentEventPreview[]
  domains: DashboardDomainSummary[]
}

export type ParentEnrollmentDraft = {
  familyName: string
  phone: string
  childName: string
  childAgeLabel: string
  requestedStart: string
  programInterest: string
  scheduleNeed: string
  note: string
}

export type ParentEnrollmentPickupDraft = {
  id: string
  name: string
  relationship: string
  phone: string
}

export type ParentEnrollmentHealthChecklist = {
  immunizationRecords: boolean
  emergencyContacts: boolean
  authorizedPickups: boolean
  healthChanges: boolean
}

export type ParentEnrollmentApplicationDraft = {
  leadId?: string
  familyName: string
  childFirstName: string
  childLastName: string
  dateOfBirth: string
  childAgeLabel: string
  homeAddress: string
  preferredStartDate: string
  primaryLanguage: string
  parentName: string
  relationshipToChild: string
  email: string
  phone: string
  emergencyContactName: string
  emergencyContactPhone: string
  authorizedPickups: ParentEnrollmentPickupDraft[]
  requestedStart: string
  programInterest: string
  scheduleNeed: string
  pediatricianName: string
  pediatricianPhone: string
  healthNotes: string
  healthChecklist: ParentEnrollmentHealthChecklist
  note: string
  accepted: boolean
}

export type ParentEnrollmentApplicationPreview = {
  id: string
  childName: string
  ageLabel: string
  programLabel: string
  statusLabel: string
  statusTone: StatusBadgeVariant
  submittedAt?: string
  updatedAt: string
  draft: ParentEnrollmentApplicationDraft
}

export type SimpleParentPortalPreview = {
  parentName: string
  familyName: string
  accountEmail: string
  phone: string
  billingContact: string
  enrollment: {
    leadId: string | null
    stageLabel: string
    stageTone: StatusBadgeVariant
    detail: string
    submittedAt?: string
    draft: ParentEnrollmentDraft
  }
  applications: ParentEnrollmentApplicationPreview[]
  documents: ParentDocumentPreview[]
  payments: {
    statusLabel: string
    statusTone: StatusBadgeVariant
    detail: string
    currentInvoice: MinimalInvoicePreview | null
    invoices: MinimalInvoicePreview[]
    paymentHistory: ParentPaymentPreview[]
    paymentMethod: ParentPaymentMethodPreview
  }
}

export type DashboardDomainKey =
  | "child-day"
  | "messages"
  | "documents"
  | "billing"
  | "calendar"
  | "settings"

export type DashboardDomainStat = {
  label: string
  value: string
}

export type DashboardDomainSummary = {
  key: DashboardDomainKey
  label: string
  title: string
  description: string
  ownerLabel: string
  recentLabel: string
  actionLabel: string
  actionHref: string
  statusLabel?: string
  statusTone?: StatusBadgeVariant
  stats: DashboardDomainStat[]
}

export type AdminMetricPreview = {
  label: string
  value: string
  detail: string
}

export type EnrollmentLeadPreview = {
  id: string
  familyName: string
  childName: string
  childAgeLabel: string
  requestedStart: string
  programInterest: string
  source: string
  submittedAt: string
  stage:
    | "contacted"
    | "application-sent"
    | "accepted"
    | "denied"
  priority: "high" | "medium" | "normal" | "low"
  assignedTo: string
  note: string
}

export type WaitlistEntryPreview = {
  id: string
  familyName: string
  childName: string
  ageLabel: string
  scheduleNeed: string
  requestedStart: string
  priority: "high" | "medium" | "low"
  status: "review" | "offer-ready" | "long-range"
  assignedTo: string
  note: string
}

export type AdminChildRecordPreview = {
  id: string
  slug: string
  name: string
  ageLabel: string
  classroom: string
  familyName: string
  attendanceStatus: "present" | "absent" | "scheduled"
  checkInTime?: string
  checkOutTime?: string
  attendanceNote: string
  allergies: string[]
  balanceStatus: "current" | "due" | "overdue"
  documentsStatus: "complete" | "pending"
  latestPhotoCount: number
}

export type AdminChildHubRecord = {
  id: string
  slug: string
  firstName: string
  lastName: string
  name: string
  ageLabel: string
  birthday: string
  classroom: string
  classroomId: string
  familyName: string
  familyId: string
  attendanceStatus: "present" | "absent" | "scheduled"
  checkInTime?: string
  checkOutTime?: string
  attendanceNote: string
  allergies: string[]
  medicalNotes: string
  comfortNotes: string
  balanceStatus: "current" | "due" | "overdue"
  documentsStatus: "complete" | "pending"
  latestPhotoCount: number
  latestDailyReport: {
    dateLabel: string
    isToday: boolean
    arrivalMood: string
    summary: string
    meals: DailyMealPreview[]
    rest: DailyRestPreview[]
    activities: DailyActivityPreview[]
    staffNotes: string[]
  } | null
  siblings: Array<{ id: string; name: string; ageLabel: string; classroom: string }>
}

export type FamilyDirectoryPreview = {
  id: string
  familyName: string
  guardians: string[]
  children: string[]
  primaryEmail: string
  balanceStatus: "current" | "due" | "overdue"
  documentsDue: number
  enrollmentStage: string
}

export type ClassroomSummaryPreview = {
  id: string
  name: string
  ageGroup: string
  leadTeacher: string
  enrolled: number
  capacity: number
  ratio: string
  nextEvent: string
  note: string
}

export type ClassroomAttendancePreview = {
  classroom: string
  expected: number
  present: number
  absent: number
  late: number
  note: string
}

export type FamilyBalancePreview = {
  id: string
  familyName: string
  totalDue: string
  dueDate: string
  invoiceCount: number
  method: string
  status: "current" | "due" | "overdue"
  paymentMethodDetail?: string
  lastPaymentStatus?: "paid" | "processing" | "failed"
  lastPaymentDate?: string
}

export type FamilyHubRecord = FamilyDirectoryPreview & {
  childRecords: AdminChildHubRecord[]
  balance: FamilyBalancePreview | null
}

export type StaffProfilePreview = {
  id: string
  name: string
  role: string
  classroom: string
  certification: string
  status: "scheduled" | "coverage-needed" | "out"
  note: string
}

export type DocumentQueuePreview = {
  id: string
  title: string
  familyName: string
  childName: string
  dueDate: string
  status: "required" | "submitted" | "approved" | "expired"
  owner: string
  note: string
  fileName?: string
  downloadUrl?: string
  submittedAt?: string
  reviewedByName?: string
}

export type AdminAnnouncementPreview = {
  id: string
  title: string
  audience: string
  publishStatus: "scheduled" | "draft" | "published"
  scheduledFor: string
  scheduledForValue?: string
  summary: string
  body?: string
}

export type AdminCalendarEventPreview = {
  id: string
  title: string
  description: string
  category: "classroom" | "family" | "closure"
  targetScope: "school" | "classroom"
  targetLabel: string
  classroomId?: string
  classroomLabel?: string
  dateLabel: string
  timeLabel: string
  timeKind: "timed" | "all-day"
  startsAtValue?: string
  eventDateValue: string
}

export type AdminBillingReminderPreview = {
  id: string
  familyName: string
  label: string
  amount: string
  dueDate: string
  timeLabel: string
  status: "due" | "overdue"
  description: string
}

export type PortalInvitePreview = {
  id: string
  email: string
  role: "parent" | "admin"
  expiresAt: string
  status: "pending" | "accepted" | "expired"
}

export type ReportBarPreview = {
  label: string
  value: number
  total: number
  note: string
}

export type AdminSettingsSectionPreview = {
  id: string
  sectionKey: string
  title: string
  description: string
  items: Array<{
    id: string
    label: string
    value: string
    note?: string
  }>
}

export type AdminTableStackCell = {
  primary: string
  secondary?: string
}

export type AdminTableBadgeCell = {
  label: string
  variant: StatusBadgeVariant
}

export type AdminTableCustomCell = {
  type: "custom"
  content: ReactNode
  searchValue?: string
}

export type AdminTableCellValue =
  | string
  | number
  | AdminTableStackCell
  | AdminTableBadgeCell
  | AdminTableCustomCell

export type AdminTableRow = Record<string, AdminTableCellValue>

export type AdminTableColumn = {
  key: string
  header: string
  align?: "start" | "end"
}

export type AdminDashboardPreview = {
  metrics: AdminMetricPreview[]
  leads: EnrollmentLeadPreview[]
  attendance: {
    present: number
    absent: number
    ratio: string
  }
  balances: FamilyBalancePreview[]
  announcements: AdminAnnouncementPreview[]
  domains: DashboardDomainSummary[]
}

export type SimpleAdminDocumentPreview = {
  id: string
  title: string
  status: string
  statusTone: StatusBadgeVariant
  fileName: string | null
  blobUrl: string | null
  blobDownloadUrl: string | null
  category: string
  submittedAt: string | null
}

export type SimpleAdminChildPreview = {
  id: string
  firstName: string
  lastName: string
  ageLabel: string
  birthday: string
  teacherLabel: string
  summary: string
  allergies: unknown
  medicalNotes: unknown
  comfortNotes: unknown
  classroomName: string
  classroomAgeGroup: string
  classroomCapacity: number
  classroomLeadTeacher: string
  classroomRatioLabel: string
}

export type SimpleAdminInvoicePreview = {
  id: string
  label: string
  amountCents: number
  amount: string
  dueDate: string
  status: string
  statusTone: StatusBadgeVariant
}

export type SimpleAdminEnrollmentPreview = {
  id: string
  familyId: string | null
  parentName: string
  familyName: string
  email: string
  phone: string
  childName: string
  childAgeLabel: string
  requestedStart: string
  programInterest: string
  scheduleNeed?: string
  note: string
  submittedAt: string
  enrollmentStatusLabel: string
  enrollmentStatusTone: StatusBadgeVariant
  paymentStatusLabel: string
  paymentStatusTone: StatusBadgeVariant
  paymentDetail: string
  documents: SimpleAdminDocumentPreview[]
  invoices: SimpleAdminInvoicePreview[]
  children: SimpleAdminChildPreview[]
}

export type SimpleAdminWorkspacePreview = {
  enrollments: SimpleAdminEnrollmentPreview[]
  waitlistEntries: WaitlistEntryPreview[]
}

export type MutationActionState = {
  success: boolean
  message: string | null
  error: string | null
  fieldErrors: Record<string, string>
  entityId?: string | null
}

export type AdminActionState = MutationActionState
export type ParentActionState = MutationActionState

export type UpdateEnrollmentLeadValues = {
  leadId: string
  stage:
    | "CONTACTED"
    | "APPLICATION_SENT"
    | "ACCEPTED"
    | "DENIED"
  priority: "HIGH" | "MEDIUM" | "NORMAL" | "LOW"
  assignedTo: string
  note: string
}

export type UpdateWaitlistEntryValues = {
  leadId: string
  waitlistStatus: "REVIEW" | "OFFER_READY" | "LONG_RANGE"
  priority: "HIGH" | "MEDIUM" | "LOW"
  assignedTo: string
  note: string
}

export type UpsertAttendanceRecordValues = {
  childId: string
  status: "PRESENT" | "ABSENT" | "SCHEDULED"
  checkInAt?: string
  checkOutAt?: string
  note: string
}

export type AnnouncementActionIntent = "save-draft" | "schedule" | "publish-now"

export type CreateAnnouncementValues = {
  title: string
  audience: string
  summary: string
  body?: string
  scheduledFor?: string
  intent: AnnouncementActionIntent
}

export type UpdateAnnouncementValues = CreateAnnouncementValues & {
  announcementId: string
}

export type CalendarEventTargetScope = "school" | "classroom"
export type CalendarEventTimeKind = "timed" | "all-day"

export type CreateCalendarEventValues = {
  title: string
  category: "CLASSROOM" | "FAMILY" | "CLOSURE"
  targetScope: CalendarEventTargetScope
  classroomId?: string
  timeKind: CalendarEventTimeKind
  startsAt?: string
  eventDate?: string
  description: string
}

export type UpdateCalendarEventValues = CreateCalendarEventValues & {
  eventId: string
}

export type DeleteCalendarEventValue = {
  eventId: string
}

export type UpdateSchoolSettingValue = {
  settingId: string
  value: string
}

export type UpdateChildDailyReportValues = {
  childId: string
  arrivalMood: string
  summary: string
  mealsText: string
  restText: string
  activitiesText: string
  staffNotesText: string
}

export type CreateParentThreadValues = {
  subject: string
  classroomLabel: string
  body: string
}

export type SendParentReplyValues = {
  threadId: string
  body: string
}

export type UpdateParentSettingsValues = {
  phone: string
  billingContact: string
  notificationPreferenceIds: string[]
}

export type UpsertAuthorizedPickupValues = {
  pickupId?: string
  childSlug: string
  name: string
  relationship: string
  phone: string
  note?: string
}

export type DeleteAuthorizedPickupValue = {
  pickupId: string
  childSlug: string
}

export type BlobAssetValue = {
  fileName: string
  blobPathname: string
  blobUrl: string
  blobDownloadUrl: string
  contentType: string
  sizeBytes: number
}

export type SubmitParentDocumentValues = BlobAssetValue & {
  documentId: string
}

export type CreateDailyReportPhotoValues = BlobAssetValue & {
  childSlug: string
  title: string
  caption?: string
}

export type IssueInviteValues = {
  email: string
  role: "PARENT" | "ADMIN"
}

export type RegisterParentAccountValues = {
  parentName: string
  familyName: string
  email: string
  phone: string
  password: string
  confirmPassword: string
}

export type SubmitEnrollmentApplicationValues = ParentEnrollmentDraft

export type ApproveEnrollmentApplicationValue = {
  leadId: string
}

export type AdminMessageThreadPreview = {
  id: string
  subject: string
  familyName: string
  classroomLabel: string
  lastMessageAt: string
  preview: string
  unreadCount: number
  status: "open" | "closed"
}

export type ParentAnnouncementPreview = {
  id: string
  title: string
  summary: string
  body: string | null
  audience: string
  publishedAt: string
}

export type CreateDocumentRequestValues = {
  familyId: string
  title: string
  note: string
}

export type CreateInvoiceValues = {
  familyId: string
  description: string
  amountCents: number
  dueDate: string
}

export type UpdateFamilyStageValues = {
  familyId: string
  enrollmentStage: string
}

export type SendAdminReplyValues = {
  threadId: string
  body: string
}

// ---------------------------------------------------------------------------
// Admin Programs / Schedules / Pricing
// ---------------------------------------------------------------------------

export type AdminProgramPreview = {
  id: string
  slug: string
  name: string
  ageRange: string | null
  description: string | null
  sortOrder: number
  isActive: boolean
  rateCount: number
}

export type AdminSchedulePreview = {
  id: string
  slug: string
  name: string
  daysDescription: string | null
  sortOrder: number
  isActive: boolean
  rateCount: number
}

export type AdminProgramRatePreview = {
  id: string
  programId: string
  programName: string
  scheduleId: string
  scheduleName: string
  rateCents: number
  billingLabel: string | null
  isActive: boolean
}

export type PricingMatrixCell = {
  rateId: string | null
  rateCents: number | null
  billingLabel: string | null
  isActive: boolean
}

export type PricingMatrixRow = {
  programId: string
  programName: string
  ageRange: string | null
  cells: Record<string, PricingMatrixCell>
}

export type PricingMatrixData = {
  schedules: { id: string; name: string }[]
  rows: PricingMatrixRow[]
}

export type UpsertProgramValues = {
  programId?: string
  name: string
  slug: string
  ageRange: string
  description: string
  sortOrder: string
  isActive: boolean
}

export type UpsertScheduleValues = {
  scheduleId?: string
  name: string
  slug: string
  daysDescription: string
  sortOrder: string
  isActive: boolean
}

export type UpsertProgramRateValues = {
  rateId?: string
  programId: string
  scheduleId: string
  rateCents: string
  billingLabel: string
}
