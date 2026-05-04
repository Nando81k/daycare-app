"use server"

import { revalidatePath } from "next/cache"

import {
  getMutationState,
  type MutationActionState,
} from "@/lib/action-state"
import { requireRole } from "@/lib/auth"
import { prisma } from "@/lib/db"
import { verifyPassword } from "@/lib/password"
import {
  buildOtpAuthQrCodeDataUrl,
  generateTotpSecret,
  verifyTotpCode,
} from "@/lib/totp"

export type TwoFactorEnrollmentResult =
  | { ok: true; qrCodeDataUrl: string; secret: string }
  | { ok: false; error: string }

export async function startTwoFactorEnrollment(): Promise<TwoFactorEnrollmentResult> {
  const user = await requireRole("ADMIN")

  const secret = generateTotpSecret()
  const qrCodeDataUrl = await buildOtpAuthQrCodeDataUrl(user.email, secret)

  await prisma.user.update({
    where: { id: user.id },
    data: {
      twoFactorSecret: secret,
      twoFactorEnabledAt: null,
    },
  })

  return { ok: true, qrCodeDataUrl, secret }
}

export async function confirmTwoFactorEnrollment(
  _previousState: MutationActionState,
  formData: FormData
): Promise<MutationActionState> {
  const user = await requireRole("ADMIN")
  const code = String(formData.get("code") ?? "").trim()

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { twoFactorSecret: true, twoFactorEnabledAt: true },
  })

  if (!record?.twoFactorSecret) {
    return getMutationState({
      error: "Start the enrollment again — no pending secret was found.",
    })
  }

  if (record.twoFactorEnabledAt) {
    return getMutationState({
      error: "Two-factor authentication is already enabled.",
    })
  }

  if (!verifyTotpCode(code, record.twoFactorSecret)) {
    return getMutationState({
      error: "That code is invalid or expired. Try the next one from your app.",
    })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorEnabledAt: new Date() },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "auth.two-factor.enabled",
      subjectType: "User",
      subjectId: user.id,
      details: {},
    },
  })

  revalidatePath("/admin/settings")

  return getMutationState({
    success: true,
    message:
      "Two-factor authentication is enabled. You'll be asked for a code on every sign in.",
  })
}

export async function disableTwoFactor(
  _previousState: MutationActionState,
  formData: FormData
): Promise<MutationActionState> {
  const user = await requireRole("ADMIN")
  const password = String(formData.get("password") ?? "")

  if (!password) {
    return getMutationState({
      error: "Enter your password to disable two-factor authentication.",
    })
  }

  const record = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true, twoFactorEnabledAt: true },
  })

  if (!record || !verifyPassword(password, record.passwordHash)) {
    return getMutationState({
      error: "That password is incorrect.",
    })
  }

  if (!record.twoFactorEnabledAt) {
    return getMutationState({
      error: "Two-factor authentication is not currently enabled.",
    })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { twoFactorSecret: null, twoFactorEnabledAt: null },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: user.id,
      action: "auth.two-factor.disabled",
      subjectType: "User",
      subjectId: user.id,
      details: {},
    },
  })

  revalidatePath("/admin/settings")

  return getMutationState({
    success: true,
    message: "Two-factor authentication has been turned off.",
  })
}
