import "dotenv/config"

import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) })

try {
  const staff = await prisma.staffProfile.findFirst({
    where: { user: { email: "test-teacher@ambassadorscare.local" } },
    include: {
      user: { select: { email: true, role: true } },
      onboarding: true,
      documents: {
        select: { category: true, status: true, fileName: true, blobUrl: true },
      },
    },
  })

  console.log(JSON.stringify(staff, null, 2))
} finally {
  await prisma.$disconnect()
}
