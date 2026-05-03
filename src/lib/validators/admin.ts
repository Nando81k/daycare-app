import { z } from "zod"

const requiredString = z.string().trim().min(1)
const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional()

const attendanceTimeSchema = z
  .string()
  .trim()
  .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Enter a valid time.")
  .or(z.literal(""))
  .transform((value) => value || undefined)

const scheduledDateTimeSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Choose a valid schedule time.")
  .or(z.literal(""))
  .transform((value) => value || undefined)

const calendarDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date.")
  .or(z.literal(""))
  .transform((value) => value || undefined)

const timeLabelPattern = /^\d{1,2}:\d{2}\s?(AM|PM)$/i

function getStructuredLines(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
}

function validateStructuredLines(params: {
  value: string
  field: string
  context: z.RefinementCtx
  label: string
  expectedParts: number
  timeRequired?: boolean
  statusOptions?: string[]
}) {
  const { value, field, context, label, expectedParts, timeRequired = true, statusOptions } = params

  getStructuredLines(value).forEach((line, index) => {
    const parts = line.split("|").map((part) => part.trim())

    if (parts.length !== expectedParts || parts.some((part) => !part)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${label} line ${index + 1} should use ${expectedParts} parts separated by |.`,
      })
      return
    }

    if (timeRequired && !timeLabelPattern.test(parts[0])) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${label} line ${index + 1} needs a time like 9:15 AM.`,
      })
    }

    if (statusOptions && !statusOptions.includes(parts[parts.length - 1].toLowerCase())) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [field],
        message: `${label} line ${index + 1} must end with ${statusOptions.join(", ")}.`,
      })
    }
  })
}

export const updateEnrollmentLeadSchema = z.object({
  leadId: requiredString,
  stage: z.enum(["CONTACTED", "APPLICATION_SENT", "ACCEPTED", "DENIED"]),
  priority: z.enum(["HIGH", "MEDIUM", "NORMAL", "LOW"]),
  assignedTo: requiredString,
  note: requiredString,
})

export const updateWaitlistEntrySchema = z.object({
  leadId: requiredString,
  waitlistStatus: z.enum(["REVIEW", "OFFER_READY", "LONG_RANGE"]),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  assignedTo: requiredString,
  note: requiredString,
})

export const upsertAttendanceRecordSchema = z
  .object({
    childId: requiredString,
    status: z.enum(["PRESENT", "ABSENT", "SCHEDULED"]),
    checkInAt: attendanceTimeSchema,
    checkOutAt: attendanceTimeSchema,
    note: z.string().trim().default(""),
  })
  .superRefine((value, context) => {
    if (!value.checkInAt || !value.checkOutAt) {
      return
    }

    if (value.checkOutAt < value.checkInAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["checkOutAt"],
        message: "Check-out must be later than check-in.",
      })
    }
  })

const announcementBaseSchema = z.object({
  title: requiredString,
  audience: requiredString,
  summary: requiredString.max(240, "Keep the summary under 240 characters."),
  body: optionalTrimmedString,
  scheduledFor: scheduledDateTimeSchema,
  intent: z.enum(["save-draft", "schedule", "publish-now"]),
})

export const createAnnouncementSchema = announcementBaseSchema.superRefine((value, context) => {
  if (value.intent === "schedule" && !value.scheduledFor) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["scheduledFor"],
      message: "Choose when this announcement should go out.",
    })
  }
})

export const updateAnnouncementSchema = announcementBaseSchema
  .extend({
    announcementId: requiredString,
  })
  .superRefine((value, context) => {
    if (value.intent === "schedule" && !value.scheduledFor) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["scheduledFor"],
        message: "Choose when this announcement should go out.",
      })
    }
  })

export const updateSchoolSettingSchema = z.object({
  settingId: requiredString,
  value: requiredString,
})

const calendarEventBaseSchema = z
  .object({
    title: requiredString,
    category: z.enum(["CLASSROOM", "FAMILY", "CLOSURE"]),
    targetScope: z.enum(["school", "classroom"]),
    classroomId: optionalTrimmedString,
    timeKind: z.enum(["timed", "all-day"]),
    startsAt: scheduledDateTimeSchema,
    eventDate: calendarDateSchema,
    description: requiredString.max(280, "Keep the description under 280 characters."),
  })
  .superRefine((value, context) => {
    if (value.targetScope === "classroom" && !value.classroomId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["classroomId"],
        message: "Choose which classroom should see this event.",
      })
    }

    if (value.timeKind === "timed" && !value.startsAt) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["startsAt"],
        message: "Choose the event date and time.",
      })
    }

    if (value.timeKind === "all-day" && !value.eventDate) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["eventDate"],
        message: "Choose the event date.",
      })
    }
  })

export const createCalendarEventSchema = calendarEventBaseSchema

export const updateCalendarEventSchema = calendarEventBaseSchema.extend({
  eventId: requiredString,
})

export const deleteCalendarEventSchema = z.object({
  eventId: requiredString,
})

export const reviewDocumentSchema = z.object({
  documentId: requiredString,
  intent: z.enum(["approve", "request-resubmission"]),
  note: requiredString,
})

// Optional template blob attached when admin sends a blank form to a family.
const documentTemplateBlobSchema = z
  .object({
    fileName: requiredString,
    blobPathname: requiredString,
    blobUrl: requiredString,
    blobDownloadUrl: requiredString,
    contentType: requiredString,
    sizeBytes: z.coerce.number().int().positive(),
  })
  .optional()

export const createDocumentRequestSchema = z.object({
  familyId: requiredString,
  title: requiredString,
  note: optionalTrimmedString,
  template: documentTemplateBlobSchema,
})

export const createInvoiceSchema = z.object({
  familyId: requiredString,
  description: requiredString,
  amountCents: z.coerce.number().int().positive(),
  dueDate: calendarDateSchema,
})

export const updateFamilyStageSchema = z.object({
  familyId: requiredString,
  enrollmentStage: requiredString,
})

export const addFamilyNoteSchema = z.object({
  familyId: requiredString,
  body: z
    .string()
    .trim()
    .min(1, "Add a short note before saving.")
    .max(2000, "Notes are capped at 2000 characters."),
})

export const deleteFamilyNoteSchema = z.object({
  noteId: requiredString,
})

export const approveEnrollmentApplicationSchema = z.object({
  leadId: requiredString,
})

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.")

export const acceptEnrollmentApplicationSchema = z.object({
  leadId: requiredString,
  classroomId: requiredString,
  childFirstName: z.string().trim().min(1, "Add a first name."),
  childLastName: z.string().trim().min(1, "Add a last name."),
  birthday: isoDateSchema,
  ageLabel: z.string().trim().min(1, "Add an age label."),
  startDate: isoDateSchema.optional().or(z.literal("")),
  summary: z.string().trim().optional().or(z.literal("")),
})

export const declineEnrollmentApplicationSchema = z.object({
  leadId: requiredString,
  note: optionalTrimmedString,
})

export const sendAdminReplySchema = z.object({
  threadId: requiredString,
  body: requiredString,
})

export const createAdminThreadSchema = z.object({
  familyId: requiredString,
  subject: z.string().trim().min(4, "Add a clearer subject."),
  classroomLabel: z
    .string()
    .trim()
    .min(2, "Choose where this thread should be tagged."),
  body: z
    .string()
    .trim()
    .min(12, "Add a little more detail so the family has context."),
})

export const updateChildProfileSchema = z.object({
  childId: requiredString,
  firstName: requiredString,
  lastName: requiredString,
  classroomId: requiredString,
  allergies: optionalTrimmedString,
  medicalNotes: optionalTrimmedString,
  comfortNotes: optionalTrimmedString,
})

export const upsertChildDailyReportSchema = z
  .object({
    childId: requiredString,
    arrivalMood: requiredString.max(180, "Keep the arrival update under 180 characters."),
    summary: requiredString.max(600, "Keep the summary under 600 characters."),
    mealsText: z.string().trim(),
    restText: z.string().trim(),
    activitiesText: z.string().trim(),
    staffNotesText: z.string().trim(),
  })
  .superRefine((value, context) => {
    validateStructuredLines({
      value: value.mealsText,
      field: "mealsText",
      context,
      label: "Meals",
      expectedParts: 4,
      statusOptions: ["eaten", "partial", "skipped"],
    })
    validateStructuredLines({
      value: value.restText,
      field: "restText",
      context,
      label: "Rest",
      expectedParts: 4,
    })
    validateStructuredLines({
      value: value.activitiesText,
      field: "activitiesText",
      context,
      label: "Activities",
      expectedParts: 3,
    })
  })

// ---------------------------------------------------------------------------
// Programs / Schedules / Pricing
// ---------------------------------------------------------------------------

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const upsertProgramSchema = z.object({
  programId: optionalTrimmedString,
  name: requiredString,
  slug: requiredString.regex(slugPattern, "Lowercase letters, numbers, and hyphens only."),
  ageRange: optionalTrimmedString,
  description: optionalTrimmedString,
  sortOrder: z.coerce.number().int().min(0, "Must be zero or more"),
  isActive: z.coerce.boolean(),
})

export const upsertScheduleSchema = z.object({
  scheduleId: optionalTrimmedString,
  name: requiredString,
  slug: requiredString.regex(slugPattern, "Lowercase letters, numbers, and hyphens only."),
  daysDescription: optionalTrimmedString,
  sortOrder: z.coerce.number().int().min(0, "Must be zero or more"),
  isActive: z.coerce.boolean(),
})

export const upsertProgramRateSchema = z.object({
  rateId: optionalTrimmedString,
  programId: requiredString,
  scheduleId: requiredString,
  rateCents: z.coerce.number().int().positive("Must be a positive amount"),
  billingLabel: optionalTrimmedString,
})

// ---------------------------------------------------------------------------
// Staff management
// ---------------------------------------------------------------------------

const staffStatusSchema = z.enum(["SCHEDULED", "COVERAGE_NEEDED", "OUT"])
const staffAccountKindSchema = z.enum(["NONE", "ADMIN", "TEACHER"])

const optionalEmail = z
  .string()
  .trim()
  .email("Enter a valid email")
  .or(z.literal(""))
  .transform((value) => (value ? value.toLowerCase() : undefined))
  .optional()

export const createStaffMemberSchema = z
  .object({
    name: requiredString,
    roleLabel: requiredString,
    classroomId: optionalTrimmedString,
    certification: optionalTrimmedString,
    note: optionalTrimmedString,
    status: staffStatusSchema.default("SCHEDULED"),
    accountKind: staffAccountKindSchema.default("NONE"),
    email: optionalEmail,
  })
  .refine(
    (data) =>
      data.accountKind === "NONE" || (data.email && data.email.length > 0),
    {
      message: "Email is required when creating a portal account.",
      path: ["email"],
    }
  )

export const updateStaffMemberSchema = z.object({
  staffId: requiredString,
  name: requiredString,
  roleLabel: requiredString,
  classroomId: optionalTrimmedString,
  certification: optionalTrimmedString,
  note: optionalTrimmedString,
  status: staffStatusSchema,
})

export const assignStaffClassroomSchema = z.object({
  staffId: requiredString,
  classroomId: optionalTrimmedString,
})

export const removeStaffMemberSchema = z.object({
  staffId: requiredString,
})

// ---------------------------------------------------------------------------
// Classrooms
// ---------------------------------------------------------------------------

const slugPatternStrict = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const createClassroomSchema = z.object({
  name: requiredString.min(2, "Name is too short"),
  ageGroup: requiredString,
  capacity: z.coerce.number().int().min(1, "Capacity must be at least 1").max(200),
  leadTeacherName: optionalTrimmedString,
  ratioLabel: optionalTrimmedString,
  nextEvent: optionalTrimmedString,
  note: optionalTrimmedString,
  slug: z
    .string()
    .trim()
    .toLowerCase()
    .regex(slugPatternStrict, "Lowercase letters, numbers, and hyphens only.")
    .or(z.literal(""))
    .transform((value) => value || undefined)
    .optional(),
})

export const updateClassroomSchema = createClassroomSchema.extend({
  classroomId: requiredString,
})

export const removeClassroomSchema = z.object({
  classroomId: requiredString,
})
