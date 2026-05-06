import "dotenv/config"
import { PrismaPg } from "@prisma/adapter-pg"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient({ adapter: new PrismaPg(process.env.DATABASE_URL) })

try {
  const recent = await prisma.payment.findMany({
    where: { paystackReference: { not: null } },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      invoice: { select: { id: true, label: true, status: true, paidAt: true } },
      family: { select: { familyName: true, billingProfile: true } },
    },
  })
  console.log(JSON.stringify(recent, null, 2))
} finally {
  await prisma.$disconnect()
}
