import { z } from "zod"

const requiredEmail = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .email("Enter a valid email address.")

export const loginSchema = z.object({
  email: requiredEmail,
  password: z
    .string()
    .min(8, "Enter your password."),
})

const passwordSchema = z
  .string()
  .trim()
  .min(12, "Use at least 12 characters.")
  .regex(/[A-Z]/, "Include at least one uppercase letter.")
  .regex(/[a-z]/, "Include at least one lowercase letter.")
  .regex(/[0-9]/, "Include at least one number.")

export const requestPasswordResetSchema = z.object({
  email: requiredEmail,
})

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, "Reset token is missing."),
    password: passwordSchema,
    confirmPassword: z.string().trim().min(1, "Confirm your password."),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords must match.",
      })
    }
  })

export const acceptInviteSchema = z
  .object({
    token: z.string().trim().min(1, "Invite token is missing."),
    password: passwordSchema,
    confirmPassword: z.string().trim().min(1, "Confirm your password."),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords must match.",
      })
    }
  })

export const issueInviteSchema = z.object({
  email: requiredEmail,
  role: z.enum(["PARENT", "ADMIN"]),
})

export const parentSignUpSchema = z
  .object({
    parentName: z.string().trim().min(2, "Enter the parent or guardian name."),
    familyName: z.string().trim().min(2, "Enter the family name."),
    email: requiredEmail,
    phone: z
      .string()
      .trim()
      .refine((value) => value.replace(/\D/g, "").length >= 10, {
        message: "Enter a valid phone number.",
      }),
    password: passwordSchema,
    confirmPassword: z.string().trim().min(1, "Confirm your password."),
  })
  .superRefine((value, context) => {
    if (value.password !== value.confirmPassword) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["confirmPassword"],
        message: "Passwords must match.",
      })
    }
  })
