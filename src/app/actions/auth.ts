"use server"

import { AuthError } from "next-auth"

import { signIn, signOut } from "@/auth"
import { db } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { hashToken } from "@/lib/security"
import {
  inviteAcceptanceSchema,
  signInSchema,
  signUpSchema,
} from "@/lib/validators/auth"

export type AuthActionState = {
  error?: string
  success?: string
}

function asString(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : ""
}

export async function signInWithCredentials(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = signInSchema.safeParse({
    email: asString(formData.get("email")),
    password: asString(formData.get("password")),
  })

  if (!parsed.success) {
    return { error: "Please enter a valid email and password." }
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/post-login",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invalid credentials." }
    }

    throw error
  }

  return undefined
}

export async function signUpParent(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = signUpSchema.safeParse({
    name: asString(formData.get("name")),
    email: asString(formData.get("email")),
    password: asString(formData.get("password")),
  })

  if (!parsed.success) {
    return { error: "Please check your name, email, and password requirements." }
  }

  const existing = await db.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  })

  if (existing) {
    return { error: "An account with this email already exists." }
  }

  const passwordHash = await hashPassword(parsed.data.password)

  await db.$transaction(async (tx) => {
    const household = await tx.household.create({
      data: {
        name: `${parsed.data.name.split(" ")[0]} household`,
        billingEmail: parsed.data.email,
      },
    })

    const user = await tx.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: "PARENT",
        householdId: household.id,
      },
    })

    await tx.householdMember.create({
      data: {
        householdId: household.id,
        userId: user.id,
        relationship: "Parent",
        isPrimary: true,
      },
    })
  })

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: "/post-login",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Signup succeeded, but sign in failed. Please log in manually." }
    }

    throw error
  }

  return undefined
}

export async function acceptAdminInvite(
  _prevState: AuthActionState | undefined,
  formData: FormData
): Promise<AuthActionState | undefined> {
  const parsed = inviteAcceptanceSchema.safeParse({
    token: asString(formData.get("token")),
    name: asString(formData.get("name")),
    password: asString(formData.get("password")),
  })

  if (!parsed.success) {
    return { error: "Please check invite details and password requirements." }
  }

  const tokenHash = hashToken(parsed.data.token)
  const invite = await db.adminInvite.findUnique({
    where: { tokenHash },
  })

  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return { error: "Invite is invalid or expired." }
  }

  const passwordHash = await hashPassword(parsed.data.password)

  const user = await db.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email: invite.email },
    })

    const userRecord = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: {
            name: parsed.data.name,
            passwordHash,
            role: "ADMIN",
          },
        })
      : await tx.user.create({
          data: {
            email: invite.email,
            name: parsed.data.name,
            role: "ADMIN",
            passwordHash,
          },
        })

    await tx.adminInvite.update({
      where: { id: invite.id },
      data: {
        status: "ACCEPTED",
        acceptedAt: new Date(),
      },
    })

    await tx.auditLog.create({
      data: {
        actorUserId: userRecord.id,
        action: "ADMIN_INVITE_ACCEPTED",
        entityType: "AdminInvite",
        entityId: invite.id,
        metadata: {
          email: invite.email,
        },
      },
    })

    return userRecord
  })

  try {
    await signIn("credentials", {
      email: user.email,
      password: parsed.data.password,
      redirectTo: "/post-login",
    })
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "Invite accepted, but login failed. Please sign in manually." }
    }

    throw error
  }

  return undefined
}

export async function signOutAction() {
  await signOut({
    redirectTo: "/login",
  })
}
