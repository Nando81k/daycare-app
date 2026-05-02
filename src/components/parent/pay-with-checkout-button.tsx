"use client"

import { useState, useTransition } from "react"
import Link from "next/link"
import { Loader2 } from "lucide-react"

import { Button, buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type PayWithCheckoutButtonProps = {
  invoiceId: string
  label?: string
  variant?: "default" | "outline" | "ghost"
  size?: "default" | "sm" | "lg"
  className?: string
  /** When false, render a link to the legacy Elements payment page instead. */
  checkoutEnabled?: boolean
  /** Path to the Elements fallback when checkoutEnabled is false. */
  fallbackHref?: string
}

export function PayWithCheckoutButton({
  invoiceId,
  label = "Pay invoice",
  variant = "default",
  size = "default",
  className,
  checkoutEnabled = true,
  fallbackHref,
}: PayWithCheckoutButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  if (!checkoutEnabled) {
    return (
      <Link
        href={fallbackHref ?? `/parent/billing/pay/${invoiceId}`}
        className={cn(buttonVariants({ variant, size }), className)}
      >
        {label}
      </Link>
    )
  }

  function startCheckout() {
    setError(null)
    startTransition(async () => {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ invoiceId }),
        })
        const payload = (await response.json().catch(() => ({}))) as {
          url?: string
          error?: string
        }
        if (!response.ok || !payload.url) {
          setError(payload.error ?? "Could not start checkout.")
          return
        }
        window.location.assign(payload.url)
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not start checkout.")
      }
    })
  }

  return (
    <div className="flex flex-col items-stretch gap-1.5">
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
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
      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}
    </div>
  )
}
