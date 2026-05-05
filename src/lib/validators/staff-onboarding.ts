import { z } from "zod"

const requiredString = z.string().trim().min(1)
const optionalTrimmedString = z
  .string()
  .trim()
  .transform((value) => value || undefined)
  .optional()

const phoneSchema = z
  .string()
  .trim()
  .refine((value) => value.replace(/\D/g, "").length >= 10, {
    message: "Enter a valid phone number.",
  })

// Accept either a fully-qualified URL (Vercel Blob) or an internal upload
// path served by the local provider (`/uploads/...`). The local dev
// environment uses the latter; production uses the former.
const uploadUrlSchema = z
  .string()
  .trim()
  .min(1, "Missing upload URL.")
  .refine(
    (value) => /^https?:\/\//.test(value) || value.startsWith("/uploads/"),
    "Missing upload URL.",
  )

const blobAssetSchema = z.object({
  fileName: requiredString,
  blobPathname: requiredString,
  blobUrl: uploadUrlSchema,
  blobDownloadUrl: uploadUrlSchema,
  contentType: requiredString,
  sizeBytes: z.coerce.number().int().positive("Missing upload size."),
})

export const STAFF_POLICY_KEYS = [
  "handbook",
  "safeguarding",
  "code_of_conduct",
] as const
export type StaffPolicyKey = (typeof STAFF_POLICY_KEYS)[number]

export const saveStaffProfileStepSchema = z.object({
  phone: phoneSchema,
  pronouns: optionalTrimmedString,
  bio: z
    .string()
    .trim()
    .max(800, "Keep your bio under 800 characters.")
    .transform((value) => value || undefined)
    .optional(),
  hireDate: z
    .string()
    .trim()
    .transform((value) => value || undefined)
    .optional()
    .refine(
      (value) => !value || !Number.isNaN(Date.parse(value)),
      "Enter a valid date.",
    ),
  emergencyContactName: z
    .string()
    .trim()
    .min(2, "Enter your emergency contact's full name."),
  emergencyContactPhone: phoneSchema,
  // Optional photo upload — if any blob field is present, all must be.
  photoBlobPathname: optionalTrimmedString,
  photoBlobUrl: optionalTrimmedString,
})

export const submitStaffDocumentSchema = z.object({
  documentId: requiredString,
  ...blobAssetSchema.shape,
})

export const signStaffPolicySchema = z.object({
  policyKey: z.enum(STAFF_POLICY_KEYS),
  signerName: z
    .string()
    .trim()
    .min(2, "Type your full name as it appears on your government ID."),
  acknowledged: z
    .string()
    .trim()
    .refine((value) => value === "on" || value === "true", {
      message: "Confirm the legally binding acknowledgement to continue.",
    }),
})

export const advanceStaffOnboardingStepSchema = z.object({
  step: z.enum([
    "welcome",
    "profile",
    "documents",
    "policies",
    "classroom",
    "complete",
  ]),
})
