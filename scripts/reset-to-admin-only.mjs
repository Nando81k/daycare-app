import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"
import { randomBytes, scryptSync } from "node:crypto"

const prisma = new PrismaClient({
  adapter: new PrismaPg(process.env.DATABASE_URL),
})

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex")
  const hash = scryptSync(password, salt, 64).toString("hex")
  return `${salt}:${hash}`
}

await prisma.user.create({
  data: {
    email: "teddy@ambassadorscare.org",
    passwordHash: hashPassword("Ambassadors2026!"),
    name: "Teddy Ambassadors",
    role: "ADMIN",
  },
})

console.log("Admin-only DB ready. Sign in: teddy@ambassadorscare.org / Ambassadors2026!")
await prisma.$disconnect()
