"use client"

import { useMemo, useState } from "react"
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js"
import { loadStripe } from "@stripe/stripe-js"
import { CreditCardIcon, Loader2Icon } from "lucide-react"

import { setDefaultPaymentMethod } from "@/app/actions/billing"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

const publishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
const stripePromise = publishableKey ? loadStripe(publishableKey) : null

function SetupMethodForm({
  onComplete,
}: {
  onComplete: (message: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!stripe || !elements) {
      return
    }

    setSubmitting(true)
    setError(null)

    try {
      const result = await stripe.confirmSetup({
        elements,
        redirect: "if_required",
      })

      if (result.error) {
        setError(result.error.message ?? "Card setup failed.")
        return
      }

      const paymentMethod = result.setupIntent?.payment_method
      if (typeof paymentMethod !== "string") {
        setError("No payment method was returned by Stripe.")
        return
      }

      const formData = new FormData()
      formData.set("paymentMethodId", paymentMethod)
      const state = await setDefaultPaymentMethod(formData)
      if (state.error) {
        setError(state.error)
        return
      }

      onComplete("Card saved and autopay default enabled.")
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Card setup failed.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4">
      <PaymentElement
        options={{
          fields: {
            billingDetails: {
              name: "auto",
              email: "auto",
              phone: "auto",
              address: "never",
            },
          },
        }}
      />
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <Button type="submit" disabled={submitting || !stripe || !elements}>
        {submitting ? (
          <>
            <Loader2Icon className="size-4 animate-spin" />
            Saving card...
          </>
        ) : (
          "Save card for autopay"
        )}
      </Button>
      <p className="text-xs text-muted-foreground">
        Setup intents are card-only in this phase. Card details are handled by Stripe.
      </p>
    </form>
  )
}

export function PaymentMethodSetupCard() {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [bootstrapping, setBootstrapping] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const elementOptions = useMemo(
    () =>
      clientSecret
        ? {
            clientSecret,
            appearance: {
              theme: "stripe" as const,
            },
          }
        : undefined,
    [clientSecret]
  )

  async function initializeSetup() {
    if (!stripePromise) {
      setError("Stripe publishable key is not configured.")
      return
    }

    setBootstrapping(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/stripe/setup-intent", {
        method: "POST",
      })

      if (!response.ok) {
        const body = (await response.json()) as { error?: string }
        throw new Error(body.error ?? "Unable to create setup intent.")
      }

      const data = (await response.json()) as { clientSecret: string }
      setClientSecret(data.clientSecret)
    } catch (intentError) {
      setError(intentError instanceof Error ? intentError.message : "Unable to start card setup.")
    } finally {
      setBootstrapping(false)
    }
  }

  return (
    <Card className="border-border/70 bg-card/90">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-heading text-xl tracking-tight">
          <CreditCardIcon className="size-5 text-primary" />
          Payment method and autopay
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4">
        {!clientSecret ? (
          <Button type="button" onClick={initializeSetup} disabled={bootstrapping}>
            {bootstrapping ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                Preparing secure card form...
              </>
            ) : (
              "Set up autopay card"
            )}
          </Button>
        ) : stripePromise && elementOptions ? (
          <Elements stripe={stripePromise} options={elementOptions}>
            <SetupMethodForm onComplete={setMessage} />
          </Elements>
        ) : null}

        {message ? (
          <p className="text-sm text-primary" role="status">
            {message}
          </p>
        ) : null}
        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
