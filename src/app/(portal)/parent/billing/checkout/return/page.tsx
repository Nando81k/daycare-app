import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { SurfaceCard } from "@/components/shared/surface-card"
import { requireRole } from "@/lib/auth"
import { syncCheckoutSession } from "@/lib/billing"
import { prisma } from "@/lib/db"
import { isStripeConfigured } from "@/lib/env"
import { formatCurrencyFromCents, formatMonthDay } from "@/lib/format"

export default async function CheckoutReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>
}) {
  await requireRole("PARENT")
  const { session_id: sessionId } = await searchParams

  if (!sessionId) redirect("/parent/billing")

  let payment: Awaited<ReturnType<typeof syncCheckoutSession>> | null = null
  let syncError: string | null = null

  if (isStripeConfigured()) {
    try {
      payment = await syncCheckoutSession(sessionId)
    } catch (error) {
      syncError =
        error instanceof Error
          ? error.message
          : "We could not verify the payment immediately. Stripe will retry via webhook."
    }
  }

  const invoice = payment?.invoiceId
    ? await prisma.invoice.findUnique({
        where: { id: payment.invoiceId },
        select: {
          id: true,
          label: true,
          amountCents: true,
          status: true,
          paidAt: true,
        },
      })
    : null

  const isPaid = invoice?.status === "PAID"
  const isProcessing = payment?.status === "processing"

  return (
    <div className="flex flex-col gap-5">
      <SurfaceCard className="space-y-5 p-8">
        <header className="flex items-start gap-4">
          <span
            className={`flex h-12 w-12 items-center justify-center rounded-full ${
              isPaid ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-sky-600"
            }`}
          >
            {isPaid ? (
              <CheckCircle2 className="h-6 w-6" />
            ) : (
              <Loader2 className="h-6 w-6 animate-spin" />
            )}
          </span>
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {isPaid
                ? "Payment received — thank you!"
                : isProcessing
                  ? "Your payment is processing"
                  : "Confirming your payment"}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {isPaid
                ? "We have updated your account and emailed your receipt."
                : isProcessing
                  ? "Some payment methods take a moment to clear. We'll update your invoice as soon as Stripe confirms."
                  : "Hang tight — Stripe will send a webhook with the final result if it isn't ready yet."}
            </p>
          </div>
        </header>

        {invoice && (
          <dl className="grid gap-3 rounded-xl border border-slate-100 bg-slate-50/40 p-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-slate-500">Invoice</dt>
              <dd className="mt-1 font-medium text-slate-800">{invoice.label}</dd>
            </div>
            <div>
              <dt className="text-slate-500">Amount</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {formatCurrencyFromCents(invoice.amountCents)}
              </dd>
            </div>
            <div>
              <dt className="text-slate-500">Paid on</dt>
              <dd className="mt-1 font-medium text-slate-800">
                {invoice.paidAt ? formatMonthDay(invoice.paidAt) : "—"}
              </dd>
            </div>
          </dl>
        )}

        {syncError && (
          <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-800">
            {syncError}
          </p>
        )}

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/parent/billing">Back to billing</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/parent">Go to dashboard</Link>
          </Button>
        </div>
      </SurfaceCard>
    </div>
  )
}
