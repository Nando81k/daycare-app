"use client"

import { useState, useTransition } from "react"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PayWithPaystackButtonProps = {
  invoiceId: string
  label?: string
  size?: "default" | "sm" | "lg"
  className?: string
}

/**
 * Initiates a Paystack hosted-checkout transaction and redirects the browser
 * to the authorization URL. After the parent pays (or cancels), Paystack
 * sends them to /parent/billing/paystack-return which verifies and updates
 * the Invoice.
 */
export function PayWithPaystackButton({
  invoiceId,
  label = "Pay invoice",
  size = "default",
  className,
}: PayWithPaystackButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  function startCheckout() {
    setError(null)
    startTransition(async () => {
      try {
        const response = await fetch("/api/paystack/initialize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId }),
        })
        const payload = (await response.json().catch(() => ({}))) as {
          url?: string
          error?: string
        }
        if (!response.ok || !payload.url) {
          setError(payload.error ?? "Could not start payment.")
          return
        }
        window.location.assign(payload.url)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not start payment.")
      }
    })
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <Button
        type="button"
        size={size}
        className={cn(
          "rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90",
          className,
        )}
        onClick={startCheckout}
        disabled={isPending}
      >
        {isPending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Redirecting…
          </>
        ) : (
          label
        )}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
