import { createHmac, randomBytes } from "node:crypto"

import { cookies, headers } from "next/headers"
import { forbidden, redirect } from "next/navigation"

import { prisma } from "@/lib/db"
import { appEnv } from "@/lib/env"
import { hashPassword, verifyPassword } from "@/lib/password"
import { createOpaqueToken, getFutureDate, hashOpaqueToken } from "@/lib/tokens"

const SESSION_COOKIE_NAME = "abassadors_session"
const SESSION_TTL_DAYS = 14
const PASSWORD_RESET_TTL_HOURS = 2
const INVITE_TTL_HOURS = 72
type UserRole = "PARENT" | "ADMIN"

function getRoleLoginPath(role: UserRole) {
  return role === "PARENT" ? "/login/parent" : "/login/admin"
}

function hashSessionToken(token: string) {
  return createHmac("sha256", appEnv.sessionSecret).update(token).digest("hex")
}

async function getRequestMetadata() {
  const headerStore = await headers()

  return {
    userAgent: headerStore.get("user-agent") ?? null,
    ipAddress:
      headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      headerStore.get("x-real-ip") ??
      null,
  }
}

async function deleteSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}

async function hasSessionCookie() {
  const cookieStore = await cookies()
  return cookieStore.has(SESSION_COOKIE_NAME)
}

export async function authenticateUser({
  email,
  password,
  role,
}: {
  email: string
  password: string
  role: UserRole
}) {
  const user = await prisma.user.findUnique({
    where: {
      email: email.trim().toLowerCase(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      mustSetPassword: true,
    },
  })

  if (!user || user.role !== role) {
    return {
      status: "invalid-credentials" as const,
    }
  }

  if (user.mustSetPassword) {
    return {
      status: "password-setup-required" as const,
    }
  }

  if (!verifyPassword(password, user.passwordHash)) {
    return {
      status: "invalid-credentials" as const,
    }
  }

  return {
    status: "success" as const,
    user,
  }
}

export async function createSession(userId: string) {
  const rawToken = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000)
  const requestMetadata = await getRequestMetadata()

  await prisma.session.deleteMany({
    where: {
      userId,
    },
  })

  await prisma.session.create({
    data: {
      tokenHash: hashSessionToken(rawToken),
      userId,
      expiresAt,
      userAgent: requestMetadata.userAgent,
      ipAddress: requestMetadata.ipAddress,
      lastAccessedAt: new Date(),
    },
  })

  const cookieStore = await cookies()
  cookieStore.set({
    name: SESSION_COOKIE_NAME,
    value: rawToken,
    httpOnly: true,
    sameSite: "lax",
    secure: appEnv.isProduction,
    path: "/",
    expires: expiresAt,
  })
}

export async function destroySession() {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (rawToken) {
    await prisma.session.deleteMany({
      where: {
        tokenHash: hashSessionToken(rawToken),
      },
    })
  }

  await deleteSessionCookie()
}

export async function invalidateUserSessions(userId: string) {
  await prisma.session.deleteMany({
    where: {
      userId,
    },
  })
}

export async function getCurrentSession() {
  const cookieStore = await cookies()
  const rawToken = cookieStore.get(SESSION_COOKIE_NAME)?.value

  if (!rawToken) {
    return null
  }

  const session = await prisma.session.findUnique({
    where: {
      tokenHash: hashSessionToken(rawToken),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          mustSetPassword: true,
        },
      },
    },
  })

  if (!session) {
    return null
  }

  if (session.expiresAt < new Date()) {
    await prisma.session.delete({
      where: {
        id: session.id,
      },
    })
    return null
  }

  await prisma.session.update({
    where: {
      id: session.id,
    },
    data: {
      lastAccessedAt: new Date(),
    },
  })

  return session
}

export async function getCurrentUser() {
  const session = await getCurrentSession()
  return session?.user ?? null
}

export async function requireRole(role: UserRole) {
  const session = await getCurrentSession()

  if (!session) {
    const loginPath = getRoleLoginPath(role)
    const sessionCookiePresent = await hasSessionCookie()
    redirect(
      sessionCookiePresent
        ? `/logout?next=${encodeURIComponent(loginPath)}`
        : loginPath
    )
  }

  if (session.user.role !== role) {
    forbidden()
  }

  return session.user
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = createOpaqueToken()
  const expiresAt = getFutureDate(PASSWORD_RESET_TTL_HOURS)

  await prisma.passwordResetToken.create({
    data: {
      tokenHash: hashOpaqueToken(rawToken),
      userId,
      expiresAt,
    },
  })

  return {
    rawToken,
    expiresAt,
  }
}

export async function getPasswordResetTokenRecord(token: string) {
  const resetToken = await prisma.passwordResetToken.findUnique({
    where: {
      tokenHash: hashOpaqueToken(token),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      },
    },
  })

  if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
    return null
  }

  return resetToken
}

export async function markPasswordResetTokenUsed(id: string) {
  await prisma.passwordResetToken.update({
    where: {
      id,
    },
    data: {
      usedAt: new Date(),
    },
  })
}

export async function createAccountInviteToken({
  userId,
  email,
  role,
  issuedByUserId,
}: {
  userId: string
  email: string
  role: UserRole
  issuedByUserId?: string
}) {
  const rawToken = createOpaqueToken()
  const expiresAt = getFutureDate(INVITE_TTL_HOURS)

  await prisma.accountInviteToken.create({
    data: {
      tokenHash: hashOpaqueToken(rawToken),
      userId,
      email,
      role,
      expiresAt,
      issuedByUserId,
    },
  })

  return {
    rawToken,
    expiresAt,
  }
}

export async function getInviteTokenRecord(token: string) {
  const inviteToken = await prisma.accountInviteToken.findUnique({
    where: {
      tokenHash: hashOpaqueToken(token),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          role: true,
          name: true,
        },
      },
    },
  })

  if (!inviteToken || inviteToken.acceptedAt || inviteToken.expiresAt < new Date()) {
    return null
  }

  return inviteToken
}

export async function acceptInviteToken(id: string) {
  await prisma.accountInviteToken.update({
    where: {
      id,
    },
    data: {
      acceptedAt: new Date(),
    },
  })
}

export async function updateUserPassword({
  userId,
  password,
}: {
  userId: string
  password: string
}) {
  await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      passwordHash: hashPassword(password),
      mustSetPassword: false,
      passwordChangedAt: new Date(),
    },
  })

  await invalidateUserSessions(userId)
}
