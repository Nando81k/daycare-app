import { z } from "zod"

export const signInSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
  password: z.string().min(8),
})

export const signUpSchema = z.object({
  name: z.string().min(2).max(120).trim(),
  email: z.string().email().trim().toLowerCase(),
  password: z
    .string()
    .min(8)
    .regex(/[a-zA-Z]/, "Password must include letters.")
    .regex(/[0-9]/, "Password must include numbers.")
    .regex(/[^a-zA-Z0-9]/, "Password must include a symbol."),
})

export const inviteAcceptanceSchema = z.object({
  token: z.string().min(20),
  name: z.string().min(2).max(120).trim(),
  password: signUpSchema.shape.password,
})

export const adminInviteSchema = z.object({
  email: z.string().email().trim().toLowerCase(),
})
