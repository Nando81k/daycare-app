"use client"

import { useState } from "react"

import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { ParentBillingControls } from "@/components/parent/parent-billing-controls"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button, buttonVariants } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { simpleParentPaymentPageContent } from "@/data/minimal-portal"
import type { SimpleParentPortalPreview } from "@/types/app"

const HISTORY_PAGE_SIZE = 2

function CompactPaymentHistoryCard({
  payments,
}: {
  payments: SimpleParentPortalPreview["payments"]["paymentHistory"]
}) {
  const [page, setPage] = useState(0)
  const totalPages = Math.max(1, Math.ceil(payments.length / HISTORY_PAGE_SIZE))
  const startIndex = page * HISTORY_PAGE_SIZE
  const visiblePayments = payments.slice(startIndex, startIndex + HISTORY_PAGE_SIZE)
  const canGoBack = page > 0
  const canGoForward = page < totalPages - 1

  return (
    <Card className="h-full border-border/65">
      <CardHeader className="gap-2 p-5">
        <p className="editorial-kicker">Receipt history</p>
        <CardTitle className="text-lg">
          {payments.length
            ? `${payments.length} payment${payments.length === 1 ? "" : "s"} recorded`
            : "No receipts yet"}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex h-full flex-col p-5 pt-0">
        {payments.length ? (
          <>
            <div className="flex flex-1 flex-col gap-3">
              {visiblePayments.map((payment, index) => (
                <div key={payment.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-foreground">{payment.label}</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        {payment.date} · {payment.method}
                      </p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-foreground">{payment.amount}</p>
                      <StatusBadge
                        variant={
                          payment.status === "paid"
                            ? "success"
                            : payment.status === "processing"
                              ? "info"
                              : "destructive"
                        }
                      >
                        {payment.status}
                      </StatusBadge>
                    </div>
                  </div>
                  {index < visiblePayments.length - 1 ? <Separator className="mt-3" /> : null}
                </div>
              ))}
            </div>
            {totalPages > 1 ? (
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
                <p className="text-xs text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(startIndex + HISTORY_PAGE_SIZE, payments.length)} of {payments.length}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    disabled={!canGoBack}
                    onClick={() => setPage((current) => Math.max(0, current - 1))}
                  >
                    Previous
                  </Button>
                  <Button
                    type="button"
                    size="xs"
                    variant="outline"
                    disabled={!canGoForward}
                    onClick={() => setPage((current) => Math.min(totalPages - 1, current + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <div className="rounded-[1rem] border border-dashed border-border/60 bg-muted/16 px-4 py-4">
            <p className="text-sm font-medium text-foreground">No payment history yet</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              A receipt will appear here after the first successful payment.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ParentSimplePaymentPageView({
  data,
}: {
  data: SimpleParentPortalPreview
}) {
  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={simpleParentPaymentPageContent.eyebrow}
        title={simpleParentPaymentPageContent.title}
        description={simpleParentPaymentPageContent.description}
        actions={
          <Link href="/parent" className={buttonVariants({ variant: "default" })}>
            Continue Enrollment
          </Link>
        }
      />

      <div className="grid gap-4 xl:grid-cols-3">
        <Card className="h-full border-border/65">
          <CardHeader className="gap-2 p-5">
            <p className="editorial-kicker">Payment status</p>
            <CardTitle className="text-lg">{data.payments.statusLabel}</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <StatusBadge variant={data.payments.statusTone}>{data.payments.statusLabel}</StatusBadge>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{data.payments.detail}</p>
          </CardContent>
        </Card>
        <Card className="h-full border-border/65">
          <CardHeader className="gap-2 p-5">
            <p className="editorial-kicker">Current invoice</p>
            <CardTitle className="text-lg">{data.payments.currentInvoice?.amount ?? "No open invoice"}</CardTitle>
          </CardHeader>
          <CardContent className="p-5 pt-0">
            <p className="text-sm font-medium text-foreground">{data.payments.currentInvoice?.label ?? "Nothing due right now"}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {data.payments.currentInvoice
                ? `Due ${data.payments.currentInvoice.dueDate}`
                : "The center has not posted a payment request to this account yet."}
            </p>
          </CardContent>
        </Card>
        <CompactPaymentHistoryCard payments={data.payments.paymentHistory} />
      </div>

      {data.documents.length > 0 ? (
        <Card className="border-border/65">
          <CardHeader className="gap-2 p-5">
            <p className="editorial-kicker">Document requests</p>
            <CardTitle className="text-xl">Requested documents</CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground">
              The center has requested the following documents. Please upload them at your earliest convenience.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 p-5 pt-0">
            {data.documents.map((doc, index) => (
              <div key={doc.id}>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground">{doc.title}</p>
                    {doc.note ? (
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{doc.note}</p>
                    ) : null}
                    {doc.dueDate ? (
                      <p className="mt-1 text-xs text-muted-foreground">Due {doc.dueDate}</p>
                    ) : null}
                  </div>
                  <StatusBadge
                    variant={
                      doc.status === "approved"
                        ? "success"
                        : doc.status === "submitted"
                          ? "info"
                          : doc.status === "expired"
                            ? "destructive"
                            : "warning"
                    }
                  >
                    {doc.status}
                  </StatusBadge>
                </div>
                {index < data.documents.length - 1 ? <Separator className="mt-3" /> : null}
              </div>
            ))}
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/65">
        <CardHeader className="gap-2 p-5">
          <p className="editorial-kicker">Pay invoice</p>
          <CardTitle className="text-xl">Keep payment simple</CardTitle>
          <CardDescription className="text-sm leading-6 text-muted-foreground">
            If the center has posted an invoice, families can pay it here and keep card details up to date.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-5 pt-0">
          <ParentBillingControls
            paymentMethod={data.payments.paymentMethod}
            invoices={data.payments.invoices}
          />
        </CardContent>
      </Card>
    </PageShell>
  )
}
