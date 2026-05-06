import Link from "next/link"
import { redirect } from "next/navigation"
import { CheckCircle2, AlertTriangle, Loader2 } from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { recordPaystackPayment } from "@/lib/paystack-record"
import { verifyTransaction } from "@/lib/paystack"
import { isPaystackConfigured } from "@/lib/env"
import { Button } from "@/components/ui/button"
import { getCurrentSession } from "@/lib/auth"

export const dynamic = "force-dynamic"

/**
 * Paystack hosted checkout redirects parents here after they pay or cancel.
 * The query string carries `?ref=<reference>` (we set it as the callback_url
 * in /api/paystack/initialize). We re-verify server-side and then either
 * congratulate them or explain what to try next.
 */
export default async function PaystackReturnPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string; reference?: string }>
}) {
  const session = await getCurrentSession()
  if (!session || session.user.role !== "PARENT") redirect("/login")

  const params = await searchParams
  const reference = params.ref ?? params.reference

  if (!isPaystackConfigured()) {
    return (
      <PageShell variant="portal" className="gap-6 pb-10">
        <ResultCard
          tone="error"
          title="Payments not configured"
          body="Reach out to the school office and we will help complete this payment manually."
        />
      </PageShell>
    )
  }

  if (!reference) {
    return (
      <PageShell variant="portal" className="gap-6 pb-10">
        <ResultCard
          tone="error"
          title="Missing payment reference"
          body="We could not find a transaction to confirm. Try paying from your billing page again."
        />
      </PageShell>
    )
  }

  let verified
  try {
    verified = await verifyTransaction(reference)
  } catch (error) {
    return (
      <PageShell variant="portal" className="gap-6 pb-10">
        <ResultCard
          tone="error"
          title="We couldn't verify your payment yet"
          body={
            error instanceof Error
              ? error.message
              : "Please refresh in a moment — Paystack sometimes takes a few seconds to confirm."
          }
        />
      </PageShell>
    )
  }

  if (verified.status === "success") {
    await recordPaystackPayment(verified)
    return (
      <PageShell variant="portal" className="gap-6 pb-10">
        <ResultCard
          tone="success"
          title="Payment received"
          body="Thank you! Your invoice has been marked paid. A receipt is available on your billing page."
        />
      </PageShell>
    )
  }

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ResultCard
        tone="pending"
        title={
          verified.status === "abandoned"
            ? "Payment cancelled"
            : "Payment not yet confirmed"
        }
        body={
          verified.status === "abandoned"
            ? "Looks like the payment was cancelled before completing. You can try again from your billing page."
            : "Paystack hasn't confirmed this payment yet. If you completed it, refresh this page in a moment."
        }
      />
    </PageShell>
  )
}

function ResultCard({
  tone,
  title,
  body,
}: {
  tone: "success" | "error" | "pending"
  title: string
  body: string
}) {
  const Icon = tone === "success" ? CheckCircle2 : tone === "error" ? AlertTriangle : Loader2
  const accent =
    tone === "success"
      ? "bg-success/15 text-success"
      : tone === "error"
        ? "bg-destructive/15 text-destructive"
        : "bg-brand-yellow/20 text-navy"
  return (
    <article className="rounded-2xl bg-card p-6 shadow-(--shadow-soft) ring-1 ring-border/60 md:p-8">
      <div className="flex items-start gap-4">
        <span className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${accent}`}>
          <Icon className="h-6 w-6" />
        </span>
        <div className="space-y-2">
          <h1 className="font-heading text-2xl leading-tight text-foreground md:text-3xl">
            {title}
          </h1>
          <p className="text-sm leading-7 text-muted-foreground">{body}</p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <Button asChild className="rounded-full">
          <Link href="/parent/billing">Back to billing</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/parent">Open dashboard</Link>
        </Button>
      </div>
    </article>
  )
}
