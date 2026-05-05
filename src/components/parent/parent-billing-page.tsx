import type { ReactNode } from "react"
import { CalendarDaysIcon, FileDown } from "lucide-react"

import { ParentSavedCardPanel } from "@/components/parent/parent-billing-controls"
import { ParentPageHeader } from "@/components/parent/parent-page-header"
import { PayWithCheckoutButton } from "@/components/parent/pay-with-checkout-button"
import {
  getInvoiceBadgeVariant,
  getPaymentBadgeVariant,
} from "@/components/parent/parent-status"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { parentBillingPageContent } from "@/data/parent"
import type {
  MinimalInvoicePreview,
  ParentPaymentMethodPreview,
  ParentPaymentPreview,
  ParentSettingsPreview,
} from "@/types/app"

function BillingSummaryItem({
  label,
  value,
  supporting,
}: {
  label: string
  value: string
  supporting?: string
}) {
  return (
    <div className="rounded-[1rem] border border-border/65 bg-background/88 px-4 py-3.5">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-brand-blue">
        {label}
      </p>
      <p className="mt-2 text-base font-semibold text-foreground">{value}</p>
      {supporting ? (
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{supporting}</p>
      ) : null}
    </div>
  )
}

function BillingSection({
  title,
  description,
  children,
  toolbar,
}: {
  title: string
  description: string
  children: ReactNode
  toolbar?: ReactNode
}) {
  return (
    <Card className="gap-0 overflow-hidden border-border/65">
      <CardHeader className="gap-2 p-5 md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <CardTitle className="text-lg">{title}</CardTitle>
            <CardDescription className="text-sm leading-6 text-muted-foreground">
              {description}
            </CardDescription>
          </div>
          {toolbar}
        </div>
      </CardHeader>
      <CardContent className="p-0">{children}</CardContent>
    </Card>
  )
}

function InvoicesTable({
  invoices,
  checkoutEnabled,
}: {
  invoices: MinimalInvoicePreview[]
  checkoutEnabled: boolean
}) {
  if (invoices.length === 0) {
    return (
      <Empty className="rounded-none border-0 py-12">
        <EmptyHeader>
          <EmptyTitle>No invoices yet</EmptyTitle>
          <EmptyDescription>
            New invoices will appear here once the school posts them to your account.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea className="w-full">
      <Table className="min-w-[40rem] text-left text-sm">
        <TableHeader className="bg-muted/45 text-muted-foreground [&_tr]:border-border/60">
          <TableRow>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Invoice
            </TableHead>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Due date
            </TableHead>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Amount
            </TableHead>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Status
            </TableHead>
            <TableHead className="px-4 py-3 text-right text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              <span className="sr-only">Action</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id} className="border-border/50">
              <TableCell className="px-4 py-3 text-foreground">{invoice.label}</TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground">{invoice.dueDate}</TableCell>
              <TableCell className="px-4 py-3 text-foreground">{invoice.amount}</TableCell>
              <TableCell className="px-4 py-3">
                <StatusBadge variant={getInvoiceBadgeVariant(invoice.status)}>
                  {invoice.status}
                </StatusBadge>
              </TableCell>
              <TableCell className="px-4 py-3 text-right">
                {invoice.status === "due" ? (
                  <PayWithCheckoutButton
                    invoiceId={invoice.id}
                    label="Pay"
                    variant="outline"
                    size="sm"
                    checkoutEnabled={checkoutEnabled}
                  />
                ) : null}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

function PaymentHistoryTable({ payments }: { payments: ParentPaymentPreview[] }) {
  if (payments.length === 0) {
    return (
      <Empty className="rounded-none border-0 py-12">
        <EmptyHeader>
          <EmptyTitle>No payment history yet</EmptyTitle>
          <EmptyDescription>
            Completed payments will appear here after the first successful charge.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea className="w-full">
      <Table className="min-w-[44rem] text-left text-sm">
        <TableHeader className="bg-muted/45 text-muted-foreground [&_tr]:border-border/60">
          <TableRow>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Payment
            </TableHead>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Date
            </TableHead>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Amount
            </TableHead>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Method
            </TableHead>
            <TableHead className="px-4 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em]">
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {payments.map((payment) => (
            <TableRow key={payment.id} className="border-border/50">
              <TableCell className="px-4 py-3 text-foreground">{payment.label}</TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground">{payment.date}</TableCell>
              <TableCell className="px-4 py-3 text-foreground">{payment.amount}</TableCell>
              <TableCell className="px-4 py-3 text-muted-foreground">{payment.method}</TableCell>
              <TableCell className="px-4 py-3">
                <StatusBadge variant={getPaymentBadgeVariant(payment.status)}>
                  {payment.status}
                </StatusBadge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}

function StatementsPanel() {
  return (
    <Empty className="rounded-none border-0 py-12">
      <EmptyHeader>
        <EmptyTitle>Statements coming soon</EmptyTitle>
        <EmptyDescription>
          Quarterly and year-end PDF statements will be available here once
          generated by the center.
        </EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" disabled className="mt-2">
        <FileDown className="h-4 w-4" />
        Download statement
      </Button>
    </Empty>
  )
}

export function ParentBillingPageView({
  invoices,
  paymentHistory,
  paymentMethod,
  settings,
  checkoutEnabled = true,
}: {
  invoices: MinimalInvoicePreview[]
  paymentHistory: ParentPaymentPreview[]
  paymentMethod: ParentPaymentMethodPreview
  settings: ParentSettingsPreview
  checkoutEnabled?: boolean
}) {
  const dueInvoice = invoices.find((invoice) => invoice.status === "due")
  const upcomingInvoice = invoices.find((invoice) => invoice.status === "draft")
  const recentPayment = paymentHistory[0]

  const amountDueValue = dueInvoice?.amount ?? "Nothing due"
  const dueDateValue = dueInvoice?.dueDate ?? upcomingInvoice?.dueDate ?? "Not scheduled"
  const dueDateSupporting = dueInvoice
    ? dueInvoice.label
    : upcomingInvoice
      ? `Next invoice: ${upcomingInvoice.label}`
      : "No upcoming invoice"

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentBillingPageContent.eyebrow}
        title={parentBillingPageContent.title}
        description={parentBillingPageContent.description}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <BillingSummaryItem
          label="Amount due"
          value={amountDueValue}
          supporting={dueInvoice ? dueInvoice.label : "No open invoice"}
        />
        <BillingSummaryItem
          label="Due date"
          value={dueDateValue}
          supporting={dueDateSupporting}
        />
        <BillingSummaryItem
          label="Saved card"
          value={paymentMethod.detail}
          supporting={
            paymentMethod.stripeConfigured
              ? "Online payments available"
              : "Online payments unavailable"
          }
        />
        <BillingSummaryItem
          label="Billing contact"
          value={settings.billingContact}
          supporting={settings.accountEmail}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(22rem,0.85fr)]">
        <Card className="gap-0 border-border/65">
          <CardHeader className="gap-3 p-5 md:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle className="text-xl">Current balance</CardTitle>
              {dueInvoice ? (
                <StatusBadge variant={getInvoiceBadgeVariant(dueInvoice.status)}>
                  {dueInvoice.status}
                </StatusBadge>
              ) : (
                <StatusBadge variant="success">Nothing due</StatusBadge>
              )}
            </div>
            <CardDescription className="text-sm leading-6 text-muted-foreground">
              Pay securely through Stripe Checkout — your saved card and
              receipts stay in this portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
            {dueInvoice ? (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,19rem)]">
                <div className="space-y-4 rounded-[1rem] border border-primary/14 bg-primary/6 px-5 py-5">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-muted-foreground">{dueInvoice.label}</p>
                    <p className="text-4xl font-semibold tracking-tight text-foreground">
                      {dueInvoice.amount}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                    <CalendarDaysIcon className="size-4 text-primary" />
                    <span>Due {dueInvoice.dueDate}</span>
                  </div>
                  {upcomingInvoice ? (
                    <div className="rounded-[0.9rem] border border-border/60 bg-background/88 px-4 py-3">
                      <p className="text-sm font-medium text-foreground">Next invoice</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">
                        {upcomingInvoice.label} for {upcomingInvoice.amount} is expected {upcomingInvoice.dueDate}.
                      </p>
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col justify-between gap-4 rounded-[1rem] border border-border/65 bg-muted/16 px-4 py-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-foreground">Pay this invoice</p>
                    <p className="text-sm leading-6 text-muted-foreground">
                      You&apos;ll be redirected to Stripe Checkout in NGN, then
                      brought back here.
                    </p>
                  </div>
                  <PayWithCheckoutButton
                    invoiceId={dueInvoice.id}
                    label={`Pay ${dueInvoice.amount}`}
                    className="w-full justify-center rounded-full border-transparent bg-brand-yellow bg-none text-navy shadow-none hover:bg-brand-yellow/90"
                    checkoutEnabled={checkoutEnabled}
                  />
                </div>
              </div>
            ) : (
              <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(16rem,19rem)]">
                <div className="rounded-[1rem] border border-border/65 bg-background/90 px-5 py-5">
                  <p className="text-2xl font-semibold tracking-tight text-foreground">
                    You&apos;re all caught up.
                  </p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    There is no payment due right now. New invoices will appear here as soon as the school posts them.
                  </p>
                </div>

                <div className="rounded-[1rem] border border-border/65 bg-muted/16 px-4 py-4">
                  {upcomingInvoice ? (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Next invoice</p>
                      <p className="text-lg font-semibold text-foreground">
                        {upcomingInvoice.amount}
                      </p>
                      <p className="text-sm text-foreground">{upcomingInvoice.label}</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        Expected {upcomingInvoice.dueDate}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-foreground">Next invoice</p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        No upcoming invoice has been posted yet.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <ParentSavedCardPanel paymentMethod={paymentMethod} className="h-full" />
      </div>

      <Tabs defaultValue="invoices" className="gap-4">
        <TabsList className="bg-muted/30">
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="history">Payment history</TabsTrigger>
          <TabsTrigger value="statements">Statements</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <BillingSection
            title="Invoices"
            description="Review current, paid, and upcoming invoices in one place."
          >
            <InvoicesTable invoices={invoices} checkoutEnabled={checkoutEnabled} />
          </BillingSection>
        </TabsContent>

        <TabsContent value="history">
          <BillingSection
            title="Payment history"
            description={
              recentPayment
                ? `Last payment: ${recentPayment.amount} on ${recentPayment.date}.`
                : "Completed payments will appear here after the first successful charge."
            }
          >
            <PaymentHistoryTable payments={paymentHistory} />
          </BillingSection>
        </TabsContent>

        <TabsContent value="statements">
          <BillingSection
            title="Statements"
            description="Year-end and quarterly statements for tax or reimbursement."
          >
            <StatementsPanel />
          </BillingSection>
        </TabsContent>
      </Tabs>
    </PageShell>
  )
}
