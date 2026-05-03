import { z } from "zod"

const requiredString = z.string().trim().min(1)

export const createTeacherThreadSchema = z.object({
  familyId: requiredString,
  subject: z.string().trim().min(4, "Add a clearer subject."),
  body: z
    .string()
    .trim()
    .min(12, "Add a little more detail so the family has context."),
})

export const sendTeacherReplySchema = z.object({
  threadId: requiredString,
  body: z.string().trim().min(2, "Write a reply before sending."),
})
