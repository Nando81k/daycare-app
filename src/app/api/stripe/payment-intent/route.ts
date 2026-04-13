import { createInvoicePaymentIntent } from "@/lib/billing"
import { getCurrentUser } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user || user.role !== "PARENT") {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  const body = (await request.json()) as {
    invoiceId?: string
  }

  const profile = await prisma.parentProfile.findUnique({
    where: {
      userId: user.id,
    },
    select: {
      familyId: true,
    },
  })

  if (!profile || !body.invoiceId) {
    return Response.json({ error: "Invoice not found." }, { status: 404 })
  }

  const invoice = await prisma.invoice.findFirst({
    where: {
      id: body.invoiceId,
      familyId: profile.familyId,
    },
    select: {
      id: true,
    },
  })

  if (!invoice) {
    return Response.json({ error: "Invoice not found." }, { status: 404 })
  }

  try {
    const paymentIntent = await createInvoicePaymentIntent(invoice.id)
    return Response.json(paymentIntent)
  } catch (error) {
    return Response.json(
      {
        error: error instanceof Error ? error.message : "Could not create payment intent.",
      },
      {
        status: 400,
      }
    )
  }
}
