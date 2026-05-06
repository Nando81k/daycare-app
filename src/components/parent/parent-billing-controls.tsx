"use client"

import type { ReactNode } from "react"
import { CheckCircleIcon, CreditCardIcon } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { cn } from "@/lib/utils"
import type { ParentPaymentMethodPreview } from "@/types/app"

/**
 * Display-only saved-card panel for Paystack. The first successful Paystack
 * charge captures a reusable authorization on `FamilyBillingProfile`; the
 * brand + last4 are shown here so the parent can confirm the school has the
 * right card on file. Removing or replacing the saved card today is done by
 * paying a fresh invoice with a different card — Paystack updates the
 * authorization automatically.
 */
export function ParentSavedCardPanel({
  paymentMethod,
  className,
}: {
  paymentMethod: ParentPaymentMethodPreview
  className?: string
}) {
  return (
    <Card className={cn("border-border/65", className)}>
      <CardHeader className="flex flex-row items-start gap-3 space-y-0">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-yellow/20 text-navy">
          <CreditCardIcon className="h-4 w-4" />
        </span>
        <div className="space-y-1">
          <CardTitle className="text-lg">Saved card</CardTitle>
          <CardDescription>
            Paystack stores a reusable authorization after your first payment so
            the next invoice can be paid in one tap.
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {paymentMethod.brand || paymentMethod.last4 ? (
          <SavedCardSummary paymentMethod={paymentMethod} />
        ) : (
          <Empty className="rounded-2xl border border-dashed border-border/65 bg-muted/30 px-4 py-6 text-left">
            <EmptyHeader>
              <EmptyTitle>No card on file yet</EmptyTitle>
              <EmptyDescription>
                Pay your next invoice with Paystack to save a card or bank account
                for one-tap re-pay.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}

function SavedCardSummary({
  paymentMethod,
}: {
  paymentMethod: ParentPaymentMethodPreview
}) {
  const labelParts: ReactNode[] = []
  if (paymentMethod.brand) labelParts.push(paymentMethod.brand)
  if (paymentMethod.last4) labelParts.push(`ending ${paymentMethod.last4}`)
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/65 bg-background/85 px-4 py-3">
      <CheckCircleIcon className="h-5 w-5 shrink-0 text-success" />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold text-foreground">
          {labelParts.length > 0 ? labelParts.join(" · ") : "Card on file"}
        </p>
        {paymentMethod.label ? (
          <p className="text-xs text-muted-foreground">{paymentMethod.label}</p>
        ) : null}
      </div>
    </div>
  )
}
