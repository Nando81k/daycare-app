import { z } from "zod"

export const runBillingCycleSchema = z.object({
  billingMonth: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),
})

export const setDefaultPaymentMethodSchema = z.object({
  paymentMethodId: z.string().min(4),
})

export const updateTuitionPlanSchema = z.object({
  planId: z.string().min(1),
  weeklyRateCents: z.coerce.number().int().positive(),
  monthlyRateCents: z.coerce.number().int().positive(),
  isActive: z.coerce.boolean(),
  depositWeeks: z.coerce.number().int().min(1).max(8),
})
