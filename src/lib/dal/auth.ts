import "server-only"

import { cache } from "react"
import { redirect } from "next/navigation"
import type { UserRole } from "@prisma/client"

import { auth } from "@/auth"
import { db } from "@/lib/db"

export const getSession = cache(async () => auth())

export async function requireSession() {
  const session = await getSession()

  if (!session?.user?.id) {
    redirect("/login")
  }

  return session
}

export async function requireRole(role: UserRole) {
  const session = await requireSession()

  if (session.user.role !== role) {
    redirect(session.user.role === "ADMIN" ? "/admin" : "/parent")
  }

  return session
}

export async function requireCurrentUser() {
  const session = await requireSession()
  const user = await db.user.findUnique({
    where: { id: session.user.id },
  })

  if (!user) {
    redirect("/login")
  }

  return user
}
