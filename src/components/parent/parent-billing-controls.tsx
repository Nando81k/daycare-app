"use client"

import type { FormEvent, ReactNode } from "react"
import { CheckCircleIcon, CircleDollarSignIcon, CreditCardIcon } from "lucide-react"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import type { MinimalInvoicePreview, ParentPaymentMethodPreview } from "@/types/app"

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

function InlineStripeForm({
  mode,
  onComplete,
}: {
  mode: "setup" | "payment"
  onComplete: (intentId: string) => Promise<void>
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsSubmitting(true)
    setError(null)

    if (mode === "setup") {
      const result = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      })

      if (result.error) {
        setError(result.error.message ?? "Card setup could not be completed.")
        setIsSubmitting(false)
        return
      }

      if (result.setupIntent?.id) {
        await onComplete(result.setupIntent.id)
      }

      setIsSubmitting(false)
      return
    }

    const result = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
    })

    if (result.error) {
      setError(result.error.message ?? "Payment could not be completed.")
      setIsSubmitting(false)
      return
    }

    if (result.paymentIntent?.id) {
      await onComplete(result.paymentIntent.id)
    }

    setIsSubmitting(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="rounded-[1rem] border border-border/60 bg-background/92 p-4">
        <PaymentElement />
      </div>
      {error ? (
        <InlineMessage tone="destructive" label="Stripe error" description={error} />
      ) : null}
      <div className="flex flex-wrap gap-3">
        <Button type="submit" size="sm" disabled={!stripe || isSubmitting}>
          {isSubmitting
            ? mode === "setup"
              ? "Saving card..."
              : "Paying..."
            : mode === "setup"
              ? "Save card"
              : "Confirm payment"}
        </Button>
      </div>
    </form>
  )
}

function InlineMessage({
  tone,
  label,
  description,
}: {
  tone: "destructive" | "info" | "success"
  label: string
  description: string
}) {
  return (
    <div className="rounded-[1rem] border border-border/60 bg-background/90 px-4 py-3">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={tone}>{label}</Badge>
        </div>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  )
}

function BillingPanel({
  icon,
  title,
  description,
  badge,
  action,
  children,
  prominent = false,
  className,
}: {
  icon: ReactNode
  title: string
  description: string
  badge?: ReactNode
  action?: ReactNode
  children: ReactNode
  prominent?: boolean
  className?: string
}) {
  return (
    <Card
      className={cn(
        "gap-0 border-border/60 shadow-none",
        prominent ? "bg-primary/6" : "bg-muted/14",
        className
      )}
    >
      <CardHeader className="gap-4 pb-0">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-start gap-3">
            <span className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/90 text-primary [&_svg]:size-4">
              {icon}
            </span>
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle className="text-lg">{title}</CardTitle>
                {badge}
              </div>
              <CardDescription>{description}</CardDescription>
            </div>
          </div>
          {action ? <div className="flex flex-wrap gap-2">{action}</div> : null}
        </div>
      </CardHeader>
      <CardContent className="pt-5">{children}</CardContent>
    </Card>
  )
}

function hasSavedCard(paymentMethod: ParentPaymentMethodPreview) {
  return (
    Boolean(paymentMethod.last4) ||
    /ending in|visa|mastercard|amex|discover/i.test(paymentMethod.detail)
  )
}

function StripeSetupSection({
  familyId,
  paymentMethod,
  className,
}: {
  familyId: string
  paymentMethod: ParentPaymentMethodPreview
  className?: string
}) {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const canUseStripe = paymentMethod.stripeConfigured && Boolean(stripePromise)
  const savedCardExists = hasSavedCard(paymentMethod)

  async function prepareSetup() {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/setup-intent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          familyId,
        }),
      })
      const payload = (await response.json()) as {
        clientSecret?: string
        error?: string
      }

      if (!response.ok || !payload.clientSecret) {
        throw new Error(payload.error ?? "Could not create a setup intent.")
      }

      setClientSecret(payload.clientSecret)
    } catch (setupError) {
      setError(setupError instanceof Error ? setupError.message : "Could not create a setup intent.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BillingPanel
      icon={<CreditCardIcon />}
      title="Saved card"
      description="Use a saved card for secure online payments."
      badge={
        <Badge variant={canUseStripe ? "success" : "info"}>
          {canUseStripe ? "Online payments ready" : "Online setup unavailable"}
        </Badge>
      }
      action={
        !clientSecret ? (
          <Button
            type="button"
            size="sm"
            onClick={() => void prepareSetup()}
            disabled={isLoading || !canUseStripe}
          >
            {isLoading ? "Preparing..." : savedCardExists ? "Update card" : "Set up card"}
          </Button>
        ) : null
      }
      className={className}
    >
      <div className="flex flex-col gap-4">
        <div className="rounded-[1rem] border border-border/60 bg-background/90 px-4 py-4">
          <p className="text-sm font-medium text-foreground">{paymentMethod.detail}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{paymentMethod.note}</p>
        </div>

        {error ? (
          <InlineMessage
            tone="destructive"
            label="Unable to start secure setup"
            description={error}
          />
        ) : null}

        {clientSecret && stripePromise ? (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <InlineStripeForm
              mode="setup"
              onComplete={async (setupIntentId) => {
                await fetch("/api/stripe/sync-setup-intent", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify({
                    setupIntentId,
                  }),
                })
                setClientSecret(null)
                router.refresh()
                setShowSuccess(true)
              }}
            />
          </Elements>
        ) : null}
      </div>

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircleIcon className="size-6 text-emerald-500" />
            </div>
            <DialogTitle className="text-center">Card saved</DialogTitle>
            <DialogDescription className="text-center">
              Your payment method has been updated successfully. It will be used
              for future payments.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button size="sm" onClick={() => setShowSuccess(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </BillingPanel>
  )
}

export function ParentSavedCardPanel({
  paymentMethod,
  className,
}: {
  paymentMethod: ParentPaymentMethodPreview
  className?: string
}) {
  return (
    <StripeSetupSection
      familyId={paymentMethod.familyId}
      paymentMethod={paymentMethod}
      className={className}
    />
  )
}

function StripePaymentSection({
  invoice,
  canUseStripe,
}: {
  invoice: MinimalInvoicePreview | undefined
  canUseStripe: boolean
}) {
  const router = useRouter()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  async function preparePayment() {
    if (!invoice) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/payment-intent", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          invoiceId: invoice.id,
        }),
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
      setError(paymentError instanceof Error ? paymentError.message : "Could not prepare invoice payment.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <BillingPanel
      icon={<CircleDollarSignIcon />}
      title="Pay current invoice"
      description="Keep the next tuition charge visible and actionable without jumping into a separate billing table."
      prominent
      action={
        invoice && !clientSecret ? (
          <Button
            type="button"
            size="sm"
            onClick={() => void preparePayment()}
            disabled={isLoading || !canUseStripe || !stripePromise}
          >
            {isLoading ? "Preparing..." : "Pay invoice"}
          </Button>
        ) : null
      }
    >
      {!invoice ? (
        <Empty className="items-start rounded-[1rem] border border-border/60 bg-background/90 p-6 text-left">
          <EmptyHeader className="items-start text-left">
            <EmptyTitle>Nothing due right now</EmptyTitle>
            <EmptyDescription>
              There is no open invoice that needs a manual payment at the moment.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,0.86fr)_minmax(17rem,1.14fr)]">
            <div className="rounded-[1rem] border border-border/60 bg-background/90 px-4 py-4">
              <p className="text-sm font-medium text-muted-foreground">{invoice.label}</p>
              <p className="mt-2 text-4xl font-semibold tracking-tight text-foreground">
                {invoice.amount}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Due {invoice.dueDate}
              </p>
            </div>
            <div className="rounded-[1rem] border border-border/60 bg-background/90 px-4 py-4">
              <p className="text-sm font-medium text-foreground">What happens next</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Once payment is confirmed, the invoice status updates here and in the invoice
                history tab. Families can use the saved card or complete payment manually.
              </p>
            </div>
          </div>

          {error ? (
            <InlineMessage
              tone="destructive"
              label="Unable to prepare payment"
              description={error}
            />
          ) : null}

          {clientSecret && stripePromise ? (
            <Elements stripe={stripePromise} options={{ clientSecret }}>
              <InlineStripeForm
                mode="payment"
                onComplete={async (paymentIntentId) => {
                  await fetch("/api/stripe/sync-payment-intent", {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify({
                      paymentIntentId,
                    }),
                  })
                  setClientSecret(null)
                  router.refresh()
                  setShowSuccess(true)
                }}
              />
            </Elements>
          ) : null}
        </div>
      )}

      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
              <CheckCircleIcon className="size-6 text-emerald-500" />
            </div>
            <DialogTitle className="text-center">Payment confirmed</DialogTitle>
            <DialogDescription className="text-center">
              Your payment of {invoice?.amount} has been processed successfully.
              The invoice status will update shortly.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center">
            <Button size="sm" onClick={() => setShowSuccess(false)}>
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </BillingPanel>
  )
}

export function ParentBillingControls({
  paymentMethod,
  invoices,
}: {
  paymentMethod: ParentPaymentMethodPreview
  invoices: MinimalInvoicePreview[]
}) {
  const currentDueInvoice = useMemo(
    () => invoices.find((invoice) => invoice.status === "due"),
    [invoices]
  )
  const canUseStripe = paymentMethod.stripeConfigured && Boolean(stripePromise)

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(22rem,0.88fr)]">
        <StripePaymentSection invoice={currentDueInvoice} canUseStripe={canUseStripe} />

        <div className="grid gap-4 content-start">
          <ParentSavedCardPanel paymentMethod={paymentMethod} />
        </div>
      </div>
    </div>
  )
}
