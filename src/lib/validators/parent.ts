import { z } from "zod"

const requiredString = z.string().trim().min(1)
const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional()
const emailSchema = z.string().trim().email("Enter a valid email address.")

const phoneSchema = z.string().trim().refine((value) => value.replace(/\D/g, "").length >= 10, {
  message: "Enter a valid phone number.",
})

const blobAssetSchema = z.object({
  fileName: requiredString,
  blobPathname: requiredString,
  blobUrl: requiredString.url("Missing upload URL."),
  blobDownloadUrl: requiredString.url("Missing download URL."),
  contentType: requiredString,
  sizeBytes: z.coerce.number().int().positive("Missing upload size."),
})

export const createParentThreadSchema = z.object({
  subject: z.string().trim().min(4, "Add a clearer subject."),
  classroomLabel: z.string().trim().min(2, "Choose where this message should go."),
  body: z.string().trim().min(12, "Add a little more detail so staff can help quickly."),
})

export const sendParentReplySchema = z.object({
  threadId: requiredString,
  body: z.string().trim().min(2, "Write a reply before sending."),
})

export const updateParentSettingsSchema = z.object({
  phone: phoneSchema,
  billingContact: z.string().trim().min(2, "Add the billing contact name."),
  notificationPreferenceIds: z.array(z.string().trim().min(1)).default([]),
})

export const upsertAuthorizedPickupSchema = z.object({
  pickupId: optionalTrimmedString,
  childSlug: requiredString,
  name: z.string().trim().min(2, "Enter the pickup contact’s name."),
  relationship: z.string().trim().min(2, "Add the relationship."),
  phone: phoneSchema,
  note: optionalTrimmedString,
})

export const deleteAuthorizedPickupSchema = z.object({
  pickupId: requiredString,
  childSlug: requiredString,
})

export const submitDocumentUploadSchema = z.object({
  documentId: requiredString,
  ...blobAssetSchema.shape,
})

export const createDailyReportPhotoSchema = z.object({
  childSlug: requiredString,
  title: z.string().trim().min(2, "Add a short photo title."),
  caption: optionalTrimmedString,
  ...blobAssetSchema.shape,
})



export const createSetupIntentSchema = z.object({
  familyId: requiredString,
})

export const createInvoicePaymentSchema = z.object({
  invoiceId: requiredString,
})

export const saveEnrollmentApplicationDraftSchema = z.object({
  leadId: optionalTrimmedString,
  familyName: z.string().trim().min(2, "Enter the family name."),
  parentName: z.string().trim().min(2, "Enter the guardian’s name."),
  email: emailSchema,
  phone: phoneSchema,
  childFirstName: z.string().trim().min(2, "Enter the child’s first name."),
  childLastName: optionalTrimmedString,
  childAgeLabel: optionalTrimmedString,
  requestedStart: optionalTrimmedString,
  programInterest: optionalTrimmedString,
  scheduleNeed: optionalTrimmedString,
  note: optionalTrimmedString,
})

export const deleteEnrollmentApplicationDraftSchema = z.object({
  leadId: requiredString,
})

export const submitEnrollmentApplicationSchema = z.object({
  leadId: optionalTrimmedString,
  familyName: z.string().trim().min(2, "Enter the family name."),
  parentName: z.string().trim().min(2, "Enter the guardian’s name."),
  email: emailSchema,
  phone: phoneSchema,
  childFirstName: z.string().trim().min(2, "Enter the child’s first name."),
  childLastName: z.string().trim().min(2, "Enter the child’s last name."),
  childAgeLabel: z.string().trim().min(2, "Choose the child’s age group."),
  requestedStart: z.string().trim().min(2, "Choose a requested start timeframe."),
  programInterest: z.string().trim().min(2, "Choose the program or care need."),
  scheduleNeed: z.string().trim().min(2, "Add the expected schedule."),
  emergencyContactName: z.string().trim().min(2, "Add an emergency contact."),
  emergencyContactPhone: phoneSchema,
  accepted: z
    .string()
    .refine((value) => value === "true", {
      message: "Confirm the application is accurate before submitting.",
    })
    .transform(() => true),
  note: optionalTrimmedString,
})
