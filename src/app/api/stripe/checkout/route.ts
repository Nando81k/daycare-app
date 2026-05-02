import { getCurrentUser } from "@/lib/auth"
import { createCheckoutSessionForInvoice } from "@/lib/billing"
import { prisma } from "@/lib/db"
import { isStripeCheckoutEnabled } from "@/lib/env"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const user = await getCurrentUser()

  if (!user || user.role !== "PARENT") {
    return Response.json({ error: "Unauthorized." }, { status: 401 })
  }

  if (!isStripeCheckoutEnabled()) {
    return Response.json(
      { error: "Stripe Checkout is not enabled in this environment." },
      { status: 503 }
    )
  }

  const body = (await request.json().catch(() => null)) as {
    invoiceId?: string
  } | null

  const profile = await prisma.parentProfile.findUnique({
    where: { userId: user.id },
    select: { familyId: true },
  })

  if (!profile || !body?.invoiceId) {
    return Response.json({ error: "Invoice not found." }, { status: 404 })
  }

  const invoice = await prisma.invoice.findFirst({
    where: { id: body.invoiceId, familyId: profile.familyId },
    select: { id: true },
  })

  if (!invoice) {
    return Response.json({ error: "Invoice not found." }, { status: 404 })
  }

  try {
    const session = await createCheckoutSessionForInvoice(invoice.id)
    return Response.json(session)
  } catch (error) {
    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Could not start checkout.",
      },
      { status: 400 }
    )
  }
}
