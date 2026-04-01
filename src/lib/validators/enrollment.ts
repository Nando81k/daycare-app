import { z } from "zod"

export const enrollmentDocumentSchema = z.object({
  blobUrl: z.string().url(),
  blobPath: z.string().min(1),
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
  type: z
    .enum([
      "IMMUNIZATION_RECORD",
      "HEALTH_FORM",
      "EMERGENCY_CONTACT",
      "PHOTO_RELEASE",
      "OTHER",
    ])
    .default("OTHER"),
})

export const enrollmentApplicationSchema = z.object({
  primaryContactName: z.string().min(2).max(140).trim(),
  primaryContactEmail: z.string().email().trim().toLowerCase(),
  primaryContactPhone: z.string().min(7).max(40).trim(),
  secondaryContactName: z.string().max(140).trim().optional(),
  secondaryContactPhone: z.string().max(40).trim().optional(),
  childFirstName: z.string().min(1).max(80).trim(),
  childLastName: z.string().min(1).max(80).trim(),
  childBirthDate: z.coerce.date(),
  desiredProgramSlug: z.string().min(2).max(80).trim(),
  desiredStartDate: z.coerce.date(),
  careSchedule: z.string().max(120).trim().optional(),
  tourPreference: z.string().max(160).trim().optional(),
  allergies: z.string().max(2000).trim().optional(),
  medicalNotes: z.string().max(4000).trim().optional(),
  emergencyContacts: z.string().min(2).max(6000),
  additionalNotes: z.string().max(4000).trim().optional(),
  consentPolicies: z.literal(true),
  consentPhoto: z.literal(true),
  documents: z.array(enrollmentDocumentSchema).default([]),
})

export const updateApplicationStatusSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum([
    "SUBMITTED",
    "UNDER_REVIEW",
    "TOUR_SCHEDULED",
    "ACCEPTED",
    "WAITLISTED",
    "DECLINED",
    "WITHDRAWN",
  ]),
  reviewNote: z.string().max(4000).optional(),
})

export const acceptApplicationSchema = z.object({
  applicationId: z.string().min(1),
  tuitionPlanId: z.string().min(1).optional(),
})
