// One-shot helper: mint a fresh password-reset token for a given email and
// print the raw token + reset URL. Used in the audit smoke test, not in
// production. Run: pnpm tsx scripts/issue-reset-token.mjs <email>

import { PrismaClient } from "@prisma/client"
import { createHash, randomBytes } from "node:crypto"

const prisma = new PrismaClient()
const email = process.argv[2]
if (!email) {
  console.error("Usage: pnpm tsx scripts/issue-reset-token.mjs <email>")
  process.exit(1)
}

const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
if (!user) {
  console.error(`No user with email ${email}`)
  process.exit(1)
}

const rawToken = randomBytes(32).toString("hex")
const tokenHash = createHash("sha256").update(rawToken).digest("hex")
const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000)

await prisma.passwordResetToken.create({
  data: { tokenHash, userId: user.id, expiresAt },
})

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"
console.log(`Reset URL: ${baseUrl}/reset-password/${rawToken}`)
console.log(`Expires:   ${expiresAt.toISOString()}`)

await prisma.$disconnect()
