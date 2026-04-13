import { z } from "zod"

const requiredText = (label: string) => z.string().trim().min(1, `${label} is required.`)
const requiredEmail = z
  .string()
  .trim()
  .min(1, "Email address is required.")
  .email("Enter a valid email address.")

const optionalPhone = z
  .string()
  .trim()
  .refine((value) => value === "" || value.replace(/\D/g, "").length >= 10, {
    message: "Enter a valid phone number or leave this field blank.",
  })

const requiredPhone = z.string().trim().refine((value) => value.replace(/\D/g, "").length >= 10, {
  message: "Enter a valid phone number.",
})

export const tourRequestSchema = z.object({
  parentName: requiredText("Parent or guardian name"),
  email: requiredEmail,
  phone: requiredPhone,
  childAgeRange: requiredText("Child age range"),
  programInterest: requiredText("Program interest"),
  startTimeframe: requiredText("Preferred start timeframe"),
  tourTiming: requiredText("Preferred tour timing"),
  notes: z.string().trim().max(600, "Keep notes under 600 characters."),
})

export const waitlistSchema = z.object({
  parentName: requiredText("Parent or guardian name"),
  email: requiredEmail,
  phone: requiredPhone,
  childName: requiredText("Child name"),
  childAgeRange: requiredText("Child age range"),
  programInterest: requiredText("Program interest"),
  scheduleNeed: requiredText("Schedule need"),
  preferredStartMonth: requiredText("Preferred start month"),
  referralSource: requiredText("How you heard about the school"),
  notes: z.string().trim().max(600, "Keep notes under 600 characters."),
})

export const contactFormSchema = z.object({
  parentName: requiredText("Your name"),
  email: requiredEmail,
  phone: optionalPhone,
  topic: requiredText("Topic"),
  message: z
    .string()
    .trim()
    .min(12, "Add a bit more detail so we can respond well.")
    .max(800, "Keep your message under 800 characters."),
})
