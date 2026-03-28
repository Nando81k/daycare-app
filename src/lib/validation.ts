import { z } from 'zod';

const isoOrDateString = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/));
const programTypeSchema = z.enum(['INFANT', 'TODDLER', 'PRESCHOOL', 'PRE_K']);
const billingCadenceSchema = z.enum(['MONTHLY', 'BIWEEKLY', 'WEEKLY']);
const communicationTypeSchema = z.enum(['GENERAL', 'ENROLLMENT', 'BILLING']);
const intakeSubmissionModeSchema = z.enum(['ADD_ONLY', 'ENROLL_ONLY', 'COMBINED']);
const onboardingScopeSchema = z.enum(['ADMIN_DASHBOARD', 'PARENT_DASHBOARD']);
const onboardingActionSchema = z.enum(['START', 'STEP', 'SKIP', 'COMPLETE', 'RESET']);
const uiRevampPhaseSchema = z.enum(['foundation', 'parent', 'admin']);
const familyCrmStageSchema = z.enum([
  'LEAD',
  'INTAKE_INCOMPLETE',
  'ADMISSIONS_REVIEW',
  'APPROVED_AWAITING_SPOT',
  'ACTIVE_FAMILY',
  'AT_RISK_BILLING',
]);
const familyCrmTaskStatusSchema = z.enum(['OPEN', 'IN_PROGRESS', 'BLOCKED', 'DONE']);
const familyCrmTaskPrioritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']);
const clientMetricsSchema = z
  .object({
    flow: z
      .enum([
        'PARENT_INTAKE',
        'ADMIN_DECISION',
        'ADMIN_BATCH_DECISION',
        'CRM_BULK_ACTION',
        'CRM_TASK_CREATE',
        'CRM_TASK_UPDATE',
        'CRM_COMMUNICATION',
      ])
      .optional(),
    elapsedMs: z.number().int().min(0).max(60 * 60 * 1000).optional(),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    phase: uiRevampPhaseSchema.optional(),
  })
  .strict();

export const MAX_CHILD_PHOTO_BYTES = 5 * 1024 * 1024;
export const ALLOWED_CHILD_PHOTO_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const paginationSchema = z.object({
  query: z.string().optional(),
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(200).default(50),
});

export const enrollmentDecisionSchema = z.object({
  status: z.enum(['PENDING', 'APPROVED', 'WAITLISTED', 'DENIED', 'REQUEST_INFO']),
  reviewNotes: z.string().min(2),
  decisionReason: z.string().nullable().optional(),
  startDate: z.string().datetime().nullable().optional(),
  clientMetrics: clientMetricsSchema.optional(),
});

export const admissionsBatchDecisionSchema = z.object({
  action: z.enum(['APPROVE_BATCH', 'REQUEST_INFO_BATCH', 'DENY_BATCH']),
  reason: z.string().max(400).nullable().optional(),
  reviewNotes: z.string().min(2).max(2000).optional(),
  startDate: z.string().datetime().nullable().optional(),
  clientMetrics: clientMetricsSchema.optional(),
});

export const childSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  preferredName: z.string().max(120).nullable().optional(),
  gender: z.string().max(80).nullable().optional(),
  pronouns: z.string().max(80).nullable().optional(),
  dateOfBirth: isoOrDateString,
  gradeLevel: z.string().max(80).nullable().optional(),
  schoolName: z.string().max(160).nullable().optional(),
  favoriteActivities: z.string().max(500).nullable().optional(),
  favoriteFoods: z.string().max(500).nullable().optional(),
  favoriteToys: z.string().max(500).nullable().optional(),
  comfortItems: z.string().max(500).nullable().optional(),
  temperamentNotes: z.string().max(1000).nullable().optional(),
  learningStyle: z.string().max(500).nullable().optional(),
  napSchedule: z.string().max(500).nullable().optional(),
  languagePreferences: z.string().max(500).nullable().optional(),
  pottyTrainingStatus: z.string().max(160).nullable().optional(),
  childSsnLast4: z
    .string()
    .regex(/^\d{4}$/, 'Child SSN last4 must be exactly 4 digits')
    .nullable()
    .optional(),
  allergies: z.string().nullable().optional(),
  medicalNotes: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  photoStorageKey: z.string().min(1).nullable().optional(),
  photoMimeType: z.enum(ALLOWED_CHILD_PHOTO_MIME_TYPES).nullable().optional(),
  photoSizeBytes: z.number().int().positive().max(MAX_CHILD_PHOTO_BYTES).nullable().optional(),
});

export const enrollmentCreateSchema = z.object({
  childId: z.string().min(1),
  programType: programTypeSchema,
  startDate: isoOrDateString,
  notes: z.string().nullable().optional(),
});

export const secureSpotSchema = z.object({
  billingCadence: billingCadenceSchema.default('MONTHLY'),
});

export const secureSpotBatchSchema = z.object({
  enrollmentIds: z.array(z.string().min(1)).min(1).max(12),
  billingCadence: billingCadenceSchema.default('MONTHLY'),
});

export const planSchema = z.object({
  name: z.string().min(1),
  programType: programTypeSchema.nullable().optional(),
  monthlyAmountCents: z.number().int().positive(),
  registrationFeeCents: z.number().int().min(0),
  allowMonthly: z.boolean().default(true),
  allowBiweekly: z.boolean().default(false),
  allowWeekly: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

export const contractSchema = z.object({
  parentId: z.string().min(1),
  childId: z.string().min(1),
  tuitionPlanId: z.string().min(1),
  billingCadence: billingCadenceSchema,
  startDate: isoOrDateString,
  autoPayEnabled: z.boolean().default(true),
});

export const contractUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['ACTIVE', 'PAUSED', 'CANCELED']).optional(),
  autoPayEnabled: z.boolean().optional(),
  nextChargeDate: isoOrDateString.nullable().optional(),
  billingCadence: billingCadenceSchema.optional(),
  tuitionPlanId: z.string().min(1).optional(),
  recurringAmountCents: z.number().int().positive().optional(),
});

export const cadenceUpdateSchema = z.object({
  billingCadence: billingCadenceSchema,
});

export const invoiceSchema = z.object({
  contractId: z.string().min(1),
  parentId: z.string().min(1),
  childId: z.string().nullable().optional(),
  invoiceNumber: z.string().min(1),
  issueDate: isoOrDateString,
  dueDate: isoOrDateString,
  totalCents: z.number().int().min(0),
  amountDueCents: z.number().int().min(0),
  status: z.enum(['DRAFT', 'OPEN', 'PAID', 'VOID', 'PAST_DUE']).default('OPEN'),
});

export const manualPaymentSchema = z.object({
  invoiceId: z.string().min(1),
  amountCents: z.number().int().positive(),
  paymentMethod: z.string().min(1).default('manual'),
  note: z.string().optional(),
});

export const policySchema = z.object({
  graceDays: z.number().int().min(0).max(30),
  lateFeeCents: z.number().int().min(0),
  pauseAfterDaysPastDue: z.number().int().min(1).max(90),
  reminderOffsets: z.array(z.number().int()).min(1),
  holdHours: z.number().int().min(1).max(72),
});

export const childPhotoUploadRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.enum(ALLOWED_CHILD_PHOTO_MIME_TYPES),
  sizeBytes: z.number().int().positive().max(MAX_CHILD_PHOTO_BYTES),
});

const intakeChildInputSchema = z.object({
  childId: z.string().optional(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  preferredName: z.string().max(120).nullable().optional(),
  gender: z.string().max(80).nullable().optional(),
  pronouns: z.string().max(80).nullable().optional(),
  dateOfBirth: isoOrDateString,
  gradeLevel: z.string().max(80).nullable().optional(),
  schoolName: z.string().max(160).nullable().optional(),
  favoriteActivities: z.string().max(500).nullable().optional(),
  favoriteFoods: z.string().max(500).nullable().optional(),
  favoriteToys: z.string().max(500).nullable().optional(),
  comfortItems: z.string().max(500).nullable().optional(),
  temperamentNotes: z.string().max(1000).nullable().optional(),
  learningStyle: z.string().max(500).nullable().optional(),
  napSchedule: z.string().max(500).nullable().optional(),
  languagePreferences: z.string().max(500).nullable().optional(),
  pottyTrainingStatus: z.string().max(160).nullable().optional(),
  childSsnLast4: z
    .string()
    .regex(/^\d{4}$/, 'Child SSN last4 must be exactly 4 digits')
    .nullable()
    .optional(),
  allergies: z.string().nullable().optional(),
  medicalNotes: z.string().nullable().optional(),
  emergencyContactName: z.string().nullable().optional(),
  emergencyContactPhone: z.string().nullable().optional(),
  photoStorageKey: z.string().nullable().optional(),
  photoMimeType: z.enum(ALLOWED_CHILD_PHOTO_MIME_TYPES).nullable().optional(),
  photoSizeBytes: z.number().int().positive().max(MAX_CHILD_PHOTO_BYTES).nullable().optional(),
  enroll: z.boolean().default(true),
  programType: programTypeSchema.optional(),
  startDate: z.string().datetime().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const familyIntakeBatchSchema = z
  .object({
    submissionMode: intakeSubmissionModeSchema.optional(),
    sharedStartDate: isoOrDateString.optional(),
    clientMetrics: clientMetricsSchema.optional(),
    guardianIdentity: z
      .object({
        guardianSsnLast4: z
          .string()
          .regex(/^\d{4}$/, 'SSN last4 must be exactly 4 digits'),
      })
      .optional(),
    children: z.array(intakeChildInputSchema).min(1),
  })
  .superRefine((value, ctx) => {
    if (value.submissionMode && value.submissionMode !== 'ENROLL_ONLY') {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['submissionMode'],
        message: 'Only enrollment-only submissions are supported',
      });
    }

    if (!value.sharedStartDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['sharedStartDate'],
        message: 'A shared start date is required',
      });
    }

    if (!value.guardianIdentity?.guardianSsnLast4) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['guardianIdentity', 'guardianSsnLast4'],
        message: 'Guardian SSN last4 is required',
      });
    }

    value.children.forEach((child, index) => {
      if (child.childId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['children', index, 'childId'],
          message: 'Existing saved children cannot be used in this intake flow',
        });
      }
      if (!child.enroll) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['children', index, 'enroll'],
          message: 'Children in this flow must be enrolled',
        });
      }
      if (!child.programType) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['children', index, 'programType'],
          message: 'Program type is required',
        });
      }
    });
  });

export const simpleFamilyIntakeSchema = z.object({
  children: z
    .array(
      z.object({
        firstName: z.string().min(1),
        lastName: z.string().min(1),
        dateOfBirth: isoOrDateString,
        programType: programTypeSchema,
        startDate: isoOrDateString,
        emergencyContactName: z.string().min(2),
        emergencyContactPhone: z.string().min(5),
        allergies: z.string().nullable().optional(),
        medicalNotes: z.string().nullable().optional(),
      }),
    )
    .min(1)
    .max(12),
});

export const adminNotificationCreateSchema = z.object({
  parentId: z.string().min(1),
  childId: z.string().nullable().optional(),
  enrollmentId: z.string().nullable().optional(),
  invoiceId: z.string().nullable().optional(),
  type: communicationTypeSchema.default('GENERAL'),
  subject: z.string().min(1).max(140),
  message: z.string().min(2).max(2000),
  delivery: z
    .object({
      inApp: z.boolean().default(true),
      email: z.boolean().default(true),
    })
    .optional(),
  clientMetrics: clientMetricsSchema.optional(),
});

export const notificationReadSchema = z.object({
  id: z.string().min(1),
});

export const onboardingStateQuerySchema = z.object({
  scope: onboardingScopeSchema,
});

export const onboardingStatePatchSchema = z.object({
  scope: onboardingScopeSchema,
  action: onboardingActionSchema,
  currentStepKey: z.string().min(1).max(120).nullable().optional(),
  currentRoute: z.string().min(1).max(240).nullable().optional(),
});

export const adminCommunicationDeliverySchema = z
  .object({
    inApp: z.boolean().default(true),
    email: z.boolean().default(true),
  })
  .refine((value) => value.inApp || value.email, {
    message: 'At least one delivery channel must be selected',
  });

export const familyCrmProfilePatchSchema = z.object({
  stage: familyCrmStageSchema.optional(),
  ownerAdminId: z.string().min(1).nullable().optional(),
  isStageManuallyOverridden: z.boolean().optional(),
  clearManualOverride: z.boolean().optional(),
  nextFollowUpAt: isoOrDateString.nullable().optional(),
  lastContactedAt: isoOrDateString.nullable().optional(),
  tagIds: z.array(z.string().min(1)).max(30).optional(),
});

export const familyCrmTaskCreateSchema = z.object({
  title: z.string().min(2).max(180),
  description: z.string().max(4000).nullable().optional(),
  status: familyCrmTaskStatusSchema.default('OPEN'),
  priority: familyCrmTaskPrioritySchema.default('MEDIUM'),
  dueAt: isoOrDateString.nullable().optional(),
  ownerAdminId: z.string().min(1).nullable().optional(),
  childId: z.string().min(1).nullable().optional(),
  enrollmentId: z.string().min(1).nullable().optional(),
  invoiceId: z.string().min(1).nullable().optional(),
  clientMetrics: clientMetricsSchema.optional(),
});

export const familyCrmTaskPatchSchema = z.object({
  title: z.string().min(2).max(180).optional(),
  description: z.string().max(4000).nullable().optional(),
  status: familyCrmTaskStatusSchema.optional(),
  priority: familyCrmTaskPrioritySchema.optional(),
  dueAt: isoOrDateString.nullable().optional(),
  ownerAdminId: z.string().min(1).nullable().optional(),
  childId: z.string().min(1).nullable().optional(),
  enrollmentId: z.string().min(1).nullable().optional(),
  invoiceId: z.string().min(1).nullable().optional(),
  clientMetrics: clientMetricsSchema.optional(),
});

export const familyCrmNoteCreateSchema = z.object({
  body: z.string().min(2).max(5000),
  isPinned: z.boolean().default(false),
});

export const familyCrmNotePatchSchema = z.object({
  body: z.string().min(2).max(5000).optional(),
  isPinned: z.boolean().optional(),
});

export const familyCrmTagSchema = z.object({
  name: z.string().min(1).max(60),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/)
    .default('#8AA99A'),
  isSystem: z.boolean().default(false),
  sortOrder: z.number().int().min(0).max(999).default(0),
});

export const familyCrmSavedViewSchema = z.object({
  name: z.string().min(1).max(120),
  isDefault: z.boolean().default(false),
  filtersJson: z.record(z.string(), z.any()),
  columnsJson: z.record(z.string(), z.any()).nullable().optional(),
});

const crmBulkActionSchema = z.enum([
  'ASSIGN_OWNER',
  'SET_STAGE',
  'CLEAR_MANUAL_OVERRIDE',
  'SET_ACTIVE',
  'CREATE_TASK',
]);

export const familyCrmBulkActionSchema = z
  .object({
    action: crmBulkActionSchema,
    familyIds: z.array(z.string().min(1)).min(1).max(200),
    ownerAdminId: z.string().min(1).nullable().optional(),
    stage: familyCrmStageSchema.optional(),
    isStageManuallyOverridden: z.boolean().optional(),
    isActive: z.boolean().optional(),
    task: familyCrmTaskCreateSchema.optional(),
    clientMetrics: clientMetricsSchema.optional(),
  })
  .superRefine((value, ctx) => {
    if (value.action === 'ASSIGN_OWNER' && value.ownerAdminId === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['ownerAdminId'],
        message: 'ownerAdminId is required when assigning owner',
      });
    }

    if (value.action === 'SET_STAGE' && !value.stage) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['stage'],
        message: 'stage is required when setting stage',
      });
    }

    if (value.action === 'SET_ACTIVE' && value.isActive === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['isActive'],
        message: 'isActive is required for account status bulk updates',
      });
    }

    if (value.action === 'CREATE_TASK' && !value.task) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['task'],
        message: 'task payload is required when creating shared tasks',
      });
    }
  });
