import { NextResponse } from "next/server"

import { db } from "@/lib/db"
import { hashPassword } from "@/lib/password"
import { hashToken } from "@/lib/security"
import { inviteAcceptanceSchema } from "@/lib/validators/auth"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Missing token." }, { status: 400 })
  }

  const invite = await db.adminInvite.findUnique({
    where: { tokenHash: hashToken(token) },
    select: {
      email: true,
      status: true,
      expiresAt: true,
    },
  })

  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invite invalid or expired." }, { status: 404 })
  }

  return NextResponse.json({
    email: invite.email,
    expiresAt: invite.expiresAt,
  })
}

export async function POST(request: Request) {
  const payload = await request.json()
  const parsed = inviteAcceptanceSchema.safeParse(payload)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid invite payload." }, { status: 400 })
  }

  const tokenHash = hashToken(parsed.data.token)
  const invite = await db.adminInvite.findUnique({
    where: { tokenHash },
  })

  if (!invite || invite.status !== "PENDING" || invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "Invite invalid or expired." }, { status: 404 })
  }

  const passwordHash = await hashPassword(parsed.data.password)

  const user = await db.$transaction(async (tx) => {
    const existing = await tx.user.findUnique({
      where: { email: invite.email },
    })

    const record = existing
      ? await tx.user.update({
          where: { id: existing.id },
          data: {
            name: parsed.data.name,
            role: "ADMIN",
            passwordHash,
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

    return record
  })

  return NextResponse.json({
    success: true,
    email: user.email,
  })
}
