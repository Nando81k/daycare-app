"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import {
  ArrowLeftIcon,
  CalendarDaysIcon,
  CheckCircleIcon,
  CircleDollarSignIcon,
  FileTextIcon,
  ShieldCheckIcon,
} from "lucide-react"

import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { getInvoiceBadgeVariant } from "@/components/parent/parent-status"
import { Badge } from "@/components/ui/badge"
import { Button, buttonVariants } from "@/components/ui/button"
import type { MinimalInvoicePreview } from "@/types/app"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

/* ------------------------------------------------------------------ */
/*  Inline Stripe checkout form                                       */
/* ------------------------------------------------------------------ */

function CheckoutForm({ onComplete }: { onComplete: (paymentIntentId: string) => Promise<void> }) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!stripe || !elements) return

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await stripe.confirmPayment({ elements, redirect: "if_required" })

      if (result.error) {
        setError(result.error.message ?? "Payment failed. Please try again.")
      } else if (result.paymentIntent) {
        await onComplete(result.paymentIntent.id)
      }
    } catch {
      setError("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-[1rem] border border-border/60 bg-background/92 p-4">
        <PaymentElement />
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-[1rem] border border-border/60 bg-background/90 px-4 py-3">
          <Badge variant="destructive" className="mt-0.5 shrink-0">
            Error
          </Badge>
          <p className="text-sm leading-6 text-muted-foreground">{error}</p>
        </div>
      ) : null}

      <Button type="submit" disabled={!stripe || isSubmitting} className="w-full">
        {isSubmitting ? "Processing payment..." : "Confirm & pay"}
      </Button>
    </form>
  )
}

/* ------------------------------------------------------------------ */
/*  Not approved state                                                */
/* ------------------------------------------------------------------ */

function NotApprovedView() {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-amber-500/10">
          <ShieldCheckIcon className="size-8 text-amber-500" />
        </div>
        <p className="text-lg font-medium text-foreground">Payment not available</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Your enrollment application is still being reviewed. Payments will be enabled once
          your application has been approved by the administration.
        </p>
        <Link
          href="/parent/billing"
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ArrowLeftIcon className="mr-2 size-4" />
          Back to billing
        </Link>
      </div>
    </PageShell>
  )
}

/* ------------------------------------------------------------------ */
/*  Payment page view                                                 */
/* ------------------------------------------------------------------ */

interface ParentPaymentPageViewProps {
  invoice: MinimalInvoicePreview
  enrollmentApproved: boolean
}

export function ParentPaymentPageView({ invoice, enrollmentApproved }: ParentPaymentPageViewProps) {
  const router = useRouter()

  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const isDemoMode = !stripePromise

  /* Gate: enrollment must be approved before payment */
  if (!enrollmentApproved) {
    return <NotApprovedView />
  }

  async function preparePayment() {
    setIsLoading(true)
    setError(null)

    /* Demo mode — no Stripe key configured, simulate payment */
    if (isDemoMode) {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setIsLoading(false)
      setShowSuccess(true)
      return
    }

    try {
      const response = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ invoiceId: invoice.id }),
      })
      const payload = (await response.json()) as {
        clientSecret?: string
        error?: string
      }

      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.error ?? "Could not prepare invoice payment.")
      }

      setClientSecret(payload.clientSecret)
    } catch (paymentError) {
      setError(
        paymentError instanceof Error
          ? paymentError.message
          : "Could not prepare invoice payment."
      )
    } finally {
      setIsLoading(false)
    }
  }

  /* ---- Success state ---- */
  if (showSuccess) {
    return (
      <PageShell variant="portal" className="gap-6 pb-10">
        <div className="mx-auto flex w-full max-w-lg flex-col items-center gap-6 py-16 text-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-emerald-500/10">
            <CheckCircleIcon className="size-8 text-emerald-500" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              Payment confirmed
            </h1>
            <p className="text-sm leading-6 text-muted-foreground">
              Your payment of {invoice.amount} for {invoice.label} has been processed
              successfully. The invoice status will update shortly.
            </p>
          </div>
          <Link
            href="/parent/billing"
            className={buttonVariants({ variant: "default", size: "sm" })}
          >
            Return to billing
          </Link>
        </div>
      </PageShell>
    )
  }

  /* ---- Main payment view ---- */
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      {/* Back link */}
      <Link
        href="/parent/billing"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeftIcon className="size-4" />
        Back to billing
      </Link>

      {/* Header */}
      <div className="space-y-1.5">
        <Badge variant="secondary" className="mb-2">
          Payment
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Complete your payment
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Review the invoice details below and complete your payment securely.
        </p>
      </div>

      {/* Content grid */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.8fr)]">
        {/* Left — Invoice breakdown */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[1.1rem] border border-border/60 bg-background/90 p-6">
            <div className="flex flex-col gap-6">
              {/* Amount */}
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-muted-foreground">Amount due</p>
                  <p className="text-4xl font-semibold tracking-tight text-foreground">
                    {invoice.amount}
                  </p>
                </div>
                <StatusBadge variant={getInvoiceBadgeVariant(invoice.status)}>
                  {invoice.status}
                </StatusBadge>
              </div>

              {/* Details */}
              <div className="space-y-3 border-t border-border/60 pt-4">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-muted/16 text-primary [&_svg]:size-4">
                    <FileTextIcon />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{invoice.label}</p>
                    {invoice.description ? (
                      <p className="text-sm text-muted-foreground">{invoice.description}</p>
                    ) : null}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-muted/16 text-primary [&_svg]:size-4">
                    <CalendarDaysIcon />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">Due {invoice.dueDate}</p>
                    <p className="text-sm text-muted-foreground">Payment deadline</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="flex size-9 items-center justify-center rounded-full border border-border/60 bg-muted/16 text-primary [&_svg]:size-4">
                    <CircleDollarSignIcon />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{invoice.amount}</p>
                    <p className="text-sm text-muted-foreground">Total charge</p>
                  </div>
                </div>
              </div>

              {/* Line items summary */}
              <div className="space-y-2 border-t border-border/60 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{invoice.label}</span>
                  <span className="font-medium text-foreground">{invoice.amount}</span>
                </div>
                <div className="flex justify-between border-t border-border/60 pt-2 text-sm">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-semibold text-foreground">{invoice.amount}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Security note */}
          <div className="flex items-start gap-3 rounded-[1rem] border border-border/60 bg-muted/16 px-4 py-3">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary [&_svg]:size-3.5">
              <ShieldCheckIcon />
            </span>
            <p className="text-sm leading-6 text-muted-foreground">
              Payments are processed securely through Stripe. Your card details are never
              stored on our servers.
            </p>
          </div>
        </div>

        {/* Right — Payment form */}
        <div className="flex flex-col gap-4">
          <div className="rounded-[1.1rem] border border-border/60 bg-background/90 p-6">
            <div className="mb-4 space-y-1.5">
              <h2 className="text-lg font-semibold text-foreground">Payment method</h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Enter your card details to complete this payment.
              </p>
            </div>

            {error ? (
              <div className="mb-4 flex items-start gap-3 rounded-[1rem] border border-border/60 bg-background/90 px-4 py-3">
                <Badge variant="destructive" className="mt-0.5 shrink-0">
                  Error
                </Badge>
                <p className="text-sm leading-6 text-muted-foreground">{error}</p>
              </div>
            ) : null}

            {!clientSecret && !isDemoMode ? (
              <Button
                onClick={() => void preparePayment()}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Preparing secure checkout..." : `Pay ${invoice.amount}`}
              </Button>
            ) : null}

            {isDemoMode && !showSuccess ? (
              <Button
                onClick={() => void preparePayment()}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Processing payment..." : `Pay ${invoice.amount}`}
              </Button>
            ) : null}

            {clientSecret && stripePromise ? (
              <Elements stripe={stripePromise} options={{ clientSecret }}>
                <CheckoutForm
                  onComplete={async (paymentIntentId) => {
                    await fetch("/api/stripe/sync-payment-intent", {
                      method: "POST",
                      headers: { "content-type": "application/json" },
                      body: JSON.stringify({ paymentIntentId }),
                    })
                    router.refresh()
                    setShowSuccess(true)
                  }}
                />
              </Elements>
            ) : null}
          </div>
        </div>
      </div>
    </PageShell>
  )
}
