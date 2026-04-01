"use server"

import { revalidatePath } from "next/cache"

import { db } from "@/lib/db"
import { sendAdminInviteEmail } from "@/lib/email"
import { getRequiredEnv } from "@/lib/env"
import { createToken, hashToken } from "@/lib/security"
import { requireCurrentUser, requireRole } from "@/lib/dal/auth"
import { adminInviteSchema } from "@/lib/validators/auth"
import { updateTuitionPlanSchema } from "@/lib/validators/billing"

export type AdminActionState = {
  error?: string
  success?: string
  inviteLink?: string
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : ""
}

export async function createAdminInvite(
  formData: FormData
): Promise<void> {
  const actor = await requireCurrentUser()
  await requireRole("ADMIN")

  const parsed = adminInviteSchema.safeParse({
    email: asString(formData.get("email")),
  })

  if (!parsed.success) {
    throw new Error("Please provide a valid email.")
  }

  const token = createToken()
  const tokenHash = hashToken(token)
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7)

  const invite = await db.adminInvite.create({
    data: {
      email: parsed.data.email,
      tokenHash,
      invitedByUserId: actor.id,
      role: "ADMIN",
      expiresAt,
    },
  })

  const appUrl = getRequiredEnv("NEXT_PUBLIC_APP_URL")
  const inviteLink = `${appUrl}/accept-invite?token=${token}`

  await sendAdminInviteEmail({
    to: parsed.data.email,
    inviteLink,
    invitedByName: actor.name ?? "Abassadors Care",
  })

  await db.auditLog.create({
    data: {
      actorUserId: actor.id,
      action: "ADMIN_INVITE_CREATED",
      entityType: "AdminInvite",
      entityId: invite.id,
      metadata: {
        email: parsed.data.email,
      },
    },
  })

  revalidatePath("/admin/enrollment")
}

export async function updateTuitionPlan(
  formData: FormData
): Promise<void> {
  const actor = await requireCurrentUser()
  await requireRole("ADMIN")

  const parsed = updateTuitionPlanSchema.safeParse({
    planId: asString(formData.get("planId")),
    weeklyRateCents: formData.get("weeklyRateCents"),
    monthlyRateCents: formData.get("monthlyRateCents"),
    isActive: formData.get("isActive") === "on",
    depositWeeks: formData.get("depositWeeks"),
  })

  if (!parsed.success) {
    throw new Error("Invalid tuition plan payload.")
  }

  await db.tuitionPlan.update({
    where: { id: parsed.data.planId },
    data: {
      weeklyRateCents: parsed.data.weeklyRateCents,
      monthlyRateCents: parsed.data.monthlyRateCents,
      isActive: parsed.data.isActive,
      depositWeeks: parsed.data.depositWeeks,
    },
  })

  await db.auditLog.create({
    data: {
      actorUserId: actor.id,
      action: "TUITION_PLAN_UPDATED",
      entityType: "TuitionPlan",
      entityId: parsed.data.planId,
      metadata: {
        weeklyRateCents: parsed.data.weeklyRateCents,
        monthlyRateCents: parsed.data.monthlyRateCents,
        isActive: parsed.data.isActive,
        depositWeeks: parsed.data.depositWeeks,
      },
    },
  })

  revalidatePath("/admin/billing")
  revalidatePath("/admin/reports")
  revalidatePath("/tuition")
}
