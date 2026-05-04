"use server"

import { redirect } from "next/navigation"

import {
  acceptInviteToken,
  authenticateUser,
  createAccountInviteToken,
  createPasswordResetToken,
  createSession,
  getInviteTokenRecord,
  getPasswordResetTokenRecord,
  lookupPasswordResetToken,
  updateUserPassword,
} from "@/lib/auth"
import { getFieldErrors, getMutationState, getStringValue, type MutationActionState } from "@/lib/action-state"
import { prisma } from "@/lib/db"
import { buildAppUrl } from "@/lib/env"
import { consumeRateLimit } from "@/lib/rate-limit"
import { sendTransactionalEmail } from "@/lib/email"
import { hashPassword } from "@/lib/password"
import { verifyTotpCode } from "@/lib/totp"
import { verifyTurnstileToken } from "@/lib/turnstile"
import {
  acceptInviteSchema,
  issueInviteSchema,
  loginSchema,
  parentSignUpSchema,
  requestPasswordResetSchema,
  resetPasswordSchema,
} from "@/lib/validators/auth"

export type LoginActionState = {
  error: string | null
  requiresTwoFactor?: boolean
}

export type AuthMutationActionState = MutationActionState
type UserRole = "PARENT" | "ADMIN" | "TEACHER"

function getPortalRole(role: "parent" | "admin"): UserRole | UserRole[] {
  // Admin login form accepts both ADMIN and TEACHER accounts; the post-login
  // redirect routes them to /admin or /teacher respectively.
  return role === "parent" ? "PARENT" : (["ADMIN", "TEACHER"] satisfies UserRole[])
}

function getPortalDestination(role: UserRole) {
  if (role === "PARENT") return "/parent"
  if (role === "TEACHER") return "/teacher"
  return "/admin"
}

export async function signInToPortal(
  role: "parent" | "admin",
  _previousState: LoginActionState,
  formData: FormData
): Promise<LoginActionState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  })

  if (!parsed.success) {
    return {
      error: parsed.error.issues[0]?.message ?? "Enter a valid email and password.",
    }
  }

  const totpCode = String(formData.get("totpCode") ?? "").trim()

  // Captcha gate — no-op when Turnstile is not configured (dev), enforced in prod.
  const captcha = await verifyTurnstileToken(
    String(formData.get("turnstileToken") ?? "") || undefined,
  )
  if (!captcha.ok) {
    return { error: "Captcha verification failed. Refresh the page and try again." }
  }

  // 8 attempts per IP+email per 15 minutes — friendly to typos, slow to bruteforce.
  const limit = await consumeRateLimit(
    { scope: `login:${role}`, limit: 8, windowSec: 60 * 15 },
    parsed.data.email
  )
  if (!limit.ok) {
    return {
      error: `Too many sign-in attempts. Try again in ${limit.retryAfterSec} seconds.`,
    }
  }

  const authenticationResult = await authenticateUser({
    email: parsed.data.email,
    password: parsed.data.password,
    role: getPortalRole(role),
  })

  if (authenticationResult.status === "password-setup-required") {
    return {
      error: "This account still needs an invite or password reset before it can sign in.",
    }
  }

  if (authenticationResult.status !== "success") {
    return {
      error: "The email, password, or portal role does not match an active account.",
    }
  }

  const authedUser = authenticationResult.user
  if (authedUser.twoFactorEnabledAt && authedUser.twoFactorSecret) {
    if (!totpCode) {
      return {
        error: null,
        requiresTwoFactor: true,
      }
    }

    if (!verifyTotpCode(totpCode, authedUser.twoFactorSecret)) {
      return {
        error: "That two-factor code is invalid or expired. Try again.",
        requiresTwoFactor: true,
      }
    }
  }

  await prisma.user.update({
    where: {
      id: authenticationResult.user.id,
    },
    data: {
      lastSignedInAt: new Date(),
    },
  })

  await createSession(authenticationResult.user.id)

  await prisma.auditLog.create({
    data: {
      actorUserId: authenticationResult.user.id,
      action: "auth.login",
      subjectType: "session",
      subjectId: authenticationResult.user.id,
      details: {
        portal: role,
      },
    },
  })

  redirect(getPortalDestination(authenticationResult.user.role))
}

function getDefaultParentNotificationPreferences() {
  return [
    {
      id: "enrollment-updates",
      label: "Enrollment updates",
      description: "Receive updates when the center reviews or approves your enrollment.",
      enabled: true,
    },
    {
      id: "payment-reminders",
      label: "Payment reminders",
      description: "Receive reminders when an invoice is posted or due.",
      enabled: true,
    },
  ]
}

export async function registerParentAccount(
  _previousState: AuthMutationActionState,
  formData: FormData
): Promise<AuthMutationActionState> {
  const parsed = parentSignUpSchema.safeParse({
    parentName: getStringValue(formData, "parentName"),
    familyName: getStringValue(formData, "familyName"),
    email: getStringValue(formData, "email"),
    phone: getStringValue(formData, "phone"),
    password: getStringValue(formData, "password"),
    confirmPassword: getStringValue(formData, "confirmPassword"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted account details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const captcha = await verifyTurnstileToken(
    getStringValue(formData, "turnstileToken") || undefined,
  )
  if (!captcha.ok) {
    return getMutationState({
      error: "Captcha verification failed. Refresh the page and try again.",
    })
  }

  const limit = await consumeRateLimit(
    { scope: "signup", limit: 5, windowSec: 60 * 60 },
    parsed.data.email,
  )
  if (!limit.ok) {
    return getMutationState({
      error: `Too many signup attempts from this address. Try again in ${limit.retryAfterSec} seconds.`,
    })
  }

  const existingUser = await prisma.user.findUnique({
    where: {
      email: parsed.data.email.trim().toLowerCase(),
    },
    select: {
      id: true,
    },
  })

  if (existingUser) {
    return getMutationState({
      error: "An account with that email already exists. Sign in instead.",
      fieldErrors: {
        email: "An account with that email already exists.",
      },
    })
  }

  const newUser = await prisma.$transaction(async (tx) => {
    const family = await tx.family.create({
      data: {
        familyName: parsed.data.familyName,
        enrollmentStage: "Account created",
      },
    })

    const user = await tx.user.create({
      data: {
        email: parsed.data.email.trim().toLowerCase(),
        passwordHash: hashPassword(parsed.data.password),
        name: parsed.data.parentName,
        role: "PARENT",
      },
      select: {
        id: true,
      },
    })

    await tx.parentProfile.create({
      data: {
        userId: user.id,
        familyId: family.id,
        phone: parsed.data.phone,
        billingContact: parsed.data.parentName,
        pickupPolicy:
          "Pickup changes should be shared with the center as early as possible so the team can confirm the right adult at dismissal.",
        notificationPreferences: getDefaultParentNotificationPreferences(),
      },
    })

    await tx.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "auth.parent-signup",
        subjectType: "User",
        subjectId: user.id,
        details: {
          familyId: family.id,
          familyName: parsed.data.familyName,
        },
      },
    })

    return user
  })

  await createSession(newUser.id)

  redirect("/parent")
}

export async function requestPasswordReset(
  _previousState: AuthMutationActionState,
  formData: FormData
): Promise<AuthMutationActionState> {
  const parsed = requestPasswordResetSchema.safeParse({
    email: getStringValue(formData, "email"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted email address and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const captcha = await verifyTurnstileToken(
    getStringValue(formData, "turnstileToken") || undefined,
  )
  if (!captcha.ok) {
    // Preserve email-enumeration resistance on captcha failure too — return
    // the same generic message rather than letting an attacker probe.
    return getMutationState({
      success: true,
      message: "If that email is active, a password reset link is on its way.",
    })
  }

  // 5 reset emails per IP+email per hour. Generous enough for a real user
  // who can't find the email, tight enough to stop mailbomb / inbox-spam
  // abuse and to protect transactional email quota. Returning the same
  // generic success message preserves email-enumeration resistance.
  const limit = await consumeRateLimit(
    { scope: "password-reset", limit: 5, windowSec: 60 * 60 },
    parsed.data.email,
  )
  if (!limit.ok) {
    return getMutationState({
      success: true,
      message: "If that email is active, a password reset link is on its way.",
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email.trim().toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  if (user) {
    const token = await createPasswordResetToken(user.id)
    const resetUrl = buildAppUrl(`/reset-password/${token.rawToken}`)

    await sendTransactionalEmail({
      to: user.email,
      subject: "Reset your Ambassadors Care portal password",
      text: `Hi ${user.name},\n\nUse this secure link to reset your ${user.role === "PARENT" ? "parent" : "admin"} portal password:\n${resetUrl}\n\nThis link expires in 2 hours.`,
      html: `<p>Hi ${user.name},</p><p>Use this secure link to reset your ${user.role === "PARENT" ? "parent" : "admin"} portal password:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>This link expires in 2 hours.</p>`,
    })

    await prisma.auditLog.create({
      data: {
        actorUserId: user.id,
        action: "auth.password-reset.requested",
        subjectType: "User",
        subjectId: user.id,
        details: {
          email: user.email,
        },
      },
    })
  }

  return getMutationState({
    success: true,
    message: "If that email is active, a password reset link is on its way.",
  })
}

export async function resetPassword(
  _previousState: AuthMutationActionState,
  formData: FormData
): Promise<AuthMutationActionState> {
  const parsed = resetPasswordSchema.safeParse({
    token: getStringValue(formData, "token"),
    password: getStringValue(formData, "password"),
    confirmPassword: getStringValue(formData, "confirmPassword"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted password fields and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const lookup = await lookupPasswordResetToken(parsed.data.token)
  if (!lookup.ok) {
    const errorMessage =
      lookup.reason === "expired"
        ? "This reset link has expired. Request a new one to continue."
        : lookup.reason === "used"
          ? "This reset link has already been used. Request a new one if you still need to change your password."
          : "This reset link is not valid. Double-check the URL or request a new one."
    return getMutationState({ error: errorMessage })
  }
  const tokenRecord = lookup.token

  await updateUserPassword({
    userId: tokenRecord.user.id,
    password: parsed.data.password,
  })

  await prisma.passwordResetToken.updateMany({
    where: {
      userId: tokenRecord.user.id,
      usedAt: null,
    },
    data: {
      usedAt: new Date(),
    },
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: tokenRecord.user.id,
      action: "auth.password-reset.completed",
      subjectType: "User",
      subjectId: tokenRecord.user.id,
      details: {
        email: tokenRecord.user.email,
      },
    },
  })

  await createSession(tokenRecord.user.id)

  redirect(getPortalDestination(tokenRecord.user.role))
}

export async function acceptPortalInvite(
  _previousState: AuthMutationActionState,
  formData: FormData
): Promise<AuthMutationActionState> {
  const parsed = acceptInviteSchema.safeParse({
    token: getStringValue(formData, "token"),
    password: getStringValue(formData, "password"),
    confirmPassword: getStringValue(formData, "confirmPassword"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the highlighted password fields and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const inviteRecord = await getInviteTokenRecord(parsed.data.token)

  if (!inviteRecord) {
    return getMutationState({
      error: "This invitation is invalid or has expired.",
    })
  }

  await updateUserPassword({
    userId: inviteRecord.user.id,
    password: parsed.data.password,
  })

  await acceptInviteToken(inviteRecord.id)

  await prisma.auditLog.create({
    data: {
      actorUserId: inviteRecord.user.id,
      action: "auth.invite.accepted",
      subjectType: "User",
      subjectId: inviteRecord.user.id,
      details: {
        email: inviteRecord.user.email,
        role: inviteRecord.role,
      },
    },
  })

  await createSession(inviteRecord.user.id)

  redirect(getPortalDestination(inviteRecord.user.role))
}

export async function issuePortalInvite(
  issuedByUserId: string,
  _previousState: AuthMutationActionState,
  formData: FormData
): Promise<AuthMutationActionState> {
  const parsed = issueInviteSchema.safeParse({
    email: getStringValue(formData, "email"),
    role: getStringValue(formData, "role"),
  })

  if (!parsed.success) {
    return getMutationState({
      error: "Check the invite details and try again.",
      fieldErrors: getFieldErrors(parsed.error),
    })
  }

  const user = await prisma.user.findUnique({
    where: {
      email: parsed.data.email.trim().toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  if (!user || user.role !== parsed.data.role) {
    return getMutationState({
      error: "Only existing parent or admin accounts can be invited in this phase.",
    })
  }

  const token = await createAccountInviteToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    issuedByUserId,
  })

  const inviteUrl = buildAppUrl(`/invite/${token.rawToken}`)

  await prisma.user.update({
    where: {
      id: user.id,
    },
    data: {
      mustSetPassword: true,
    },
  })

  await sendTransactionalEmail({
    to: user.email,
    subject: "Your Ambassadors Care portal invitation",
    text: `Hi ${user.name},\n\nUse this secure link to finish setting up your ${user.role === "PARENT" ? "parent" : "admin"} portal access:\n${inviteUrl}\n\nThis link expires in 72 hours.`,
    html: `<p>Hi ${user.name},</p><p>Use this secure link to finish setting up your ${user.role === "PARENT" ? "parent" : "admin"} portal access:</p><p><a href="${inviteUrl}">${inviteUrl}</a></p><p>This link expires in 72 hours.</p>`,
  })

  await prisma.auditLog.create({
    data: {
      actorUserId: issuedByUserId,
      action: "auth.invite.issued",
      subjectType: "User",
      subjectId: user.id,
      details: {
        email: user.email,
        role: user.role,
      },
    },
  })

  return getMutationState({
    success: true,
    message: "Invite sent.",
  })
}
