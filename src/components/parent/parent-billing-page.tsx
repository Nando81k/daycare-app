import type { ReactNode } from "react"
import Link from "next/link"
import {
  CalendarDaysIcon,
  CircleDollarSignIcon,
  HistoryIcon,
  MailIcon,
  ReceiptTextIcon,
} from "lucide-react"

import { ParentBillingControls } from "@/components/parent/parent-billing-controls"
import { ParentPageHeader } from "@/components/parent/parent-page-header"
import {
  getInvoiceBadgeVariant,
  getPaymentBadgeVariant,
} from "@/components/parent/parent-status"
import { PageShell } from "@/components/shared/page-shell"
import { StatusBadge } from "@/components/shared/status-badge"
import { Badge } from "@/components/ui/badge"
import { buttonVariants } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { parentBillingPageContent } from "@/data/parent"
import type {
  MinimalInvoicePreview,
  ParentPaymentMethodPreview,
  ParentPaymentPreview,
  ParentSettingsPreview,
} from "@/types/app"

function BillingSummaryItem({
  icon,
  label,
  value,
  supporting,
}: {
  icon: ReactNode
  label: string
  value: string
  supporting?: string
}) {
  return (
    <div className="rounded-[1.05rem] border border-border/60 bg-muted/16 px-4 py-4">
      <div className="flex items-start gap-3">
        <span className="flex size-10 items-center justify-center rounded-full border border-border/60 bg-background/88 text-primary [&_svg]:size-4">
          {icon}
        </span>
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {label}
          </p>
          <p className="truncate text-sm font-medium text-foreground">{value}</p>
          {supporting ? <p className="text-sm leading-6 text-muted-foreground">{supporting}</p> : null}
        </div>
      </div>
    </div>
  )
}

function BillingTableContainer({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: ReactNode
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="space-y-1.5">
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="overflow-hidden rounded-[1.1rem] border border-border/60 bg-background/90">
        {children}
      </div>
    </div>
  )
}

function InvoicesTable({ invoices }: { invoices: MinimalInvoicePreview[] }) {
  if (invoices.length === 0) {
    return (
      <Empty className="rounded-none border-0 py-12">
        <EmptyHeader>
          <EmptyTitle>No invoices yet</EmptyTitle>
          <EmptyDescription>
            Upcoming tuition and completed monthly charges will appear here once billing starts.
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  return (
    <ScrollArea className="w-full">
      <Table className="min-w-[38rem] text-left text-sm">
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
                {invoice.status === "due" && (
                  <Link
                    href={`/parent/billing/pay/${invoice.id}`}
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                  >
                    Pay now
                  </Link>
                )}
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
            Completed card charges and manual payments will appear here once the first invoice is settled.
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

export function ParentBillingPageView({
  invoices,
  paymentHistory,
  paymentMethod,
  settings,
}: {
  invoices: MinimalInvoicePreview[]
  paymentHistory: ParentPaymentPreview[]
  paymentMethod: ParentPaymentMethodPreview
  settings: ParentSettingsPreview
}) {
  const currentInvoice = invoices[0] as MinimalInvoicePreview | undefined
  const recentPayment = paymentHistory[0]
  const upcomingInvoice = invoices.find((invoice) => invoice.status === "draft")

  return (
    <PageShell variant="portal" className="gap-6 pb-10">
      <ParentPageHeader
        eyebrow={parentBillingPageContent.eyebrow}
        title={parentBillingPageContent.title}
        description={parentBillingPageContent.description}
        actions={
          <>
            <Link href="/parent/messages" className={buttonVariants({ variant: "outline" })}>
              Contact school
            </Link>
            <Link href="/parent/forms" className={buttonVariants({ variant: "ghost" })}>
              Forms
            </Link>
          </>
        }
      />

      <Card className="gap-0 overflow-hidden">
        <CardHeader className="gap-5 pb-0">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <Badge variant="secondary">Billing at a glance</Badge>
              <div className="space-y-1.5">
                <CardTitle>Billing visibility that feels closer to a parent app than a finance tool.</CardTitle>
                <CardDescription>
                  The next tuition charge stays in focus, while saved payment details and family
                  billing information stay compact and easy to scan.
                </CardDescription>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {currentInvoice ? (
                <StatusBadge variant={getInvoiceBadgeVariant(currentInvoice.status)}>
                  {currentInvoice.status}
                </StatusBadge>
              ) : null}
              <Badge variant={paymentMethod.stripeConfigured ? "success" : "info"}>
                {paymentMethod.stripeConfigured ? "Stripe ready" : "Local Stripe setup needed"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="gap-6 pt-6">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_minmax(21rem,0.82fr)]">
            <div className="rounded-[1.35rem] border border-primary/14 bg-primary/6 px-5 py-5">
              {currentInvoice ? (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Due now</Badge>
                    <StatusBadge variant={getInvoiceBadgeVariant(currentInvoice.status)}>
                      {currentInvoice.status}
                    </StatusBadge>
                  </div>

                  <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,0.9fr)_minmax(15rem,1.1fr)]">
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{currentInvoice.label}</p>
                      <p className="text-balance text-4xl font-semibold tracking-tight text-foreground">
                        {currentInvoice.amount}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <CalendarDaysIcon className="size-4 text-primary" />
                        <span>Due {currentInvoice.dueDate}</span>
                      </div>
                      <p className="max-w-md pt-2 text-sm leading-6 text-muted-foreground">
                        The overview below keeps payment actions together, while invoices and past
                        payments stay tucked into tabs until a family actually needs them.
                      </p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Badge variant="secondary">No outstanding invoices</Badge>
                  <p className="text-sm leading-6 text-muted-foreground">
                    There are no invoices on file yet. Once the school creates the first tuition
                    charge it will appear here automatically.
                  </p>
                </div>
              )}
            </div>

            <div className="grid gap-3">
              <BillingSummaryItem
                icon={<MailIcon />}
                label="Billing contact"
                value={settings.billingContact}
                supporting={settings.accountEmail}
              />
              <BillingSummaryItem
                icon={<ReceiptTextIcon />}
                label="Most recent payment"
                value={recentPayment ? `${recentPayment.amount} · ${recentPayment.date}` : "No payments yet"}
                supporting={
                  recentPayment
                    ? recentPayment.method
                    : "The first successful payment will appear here."
                }
              />
              {upcomingInvoice ? (
                <BillingSummaryItem
                  icon={<CalendarDaysIcon />}
                  label="Upcoming invoice"
                  value={`${upcomingInvoice.label} · ${upcomingInvoice.amount}`}
                  supporting={`Expected ${upcomingInvoice.dueDate}`}
                />
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="gap-0 overflow-hidden">
        <CardHeader className="gap-4 pb-0">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-1.5">
              <CardTitle>Billing workspace</CardTitle>
              <CardDescription>
                The overview keeps the next payment action visible first, while invoices and
                completed history stay one tap away instead of always occupying the page.
              </CardDescription>
            </div>
            <p className="max-w-md text-sm leading-6 text-muted-foreground">
              This keeps the page calmer for repeat parent use while preserving the full detail
              when a family needs it.
            </p>
          </div>
        </CardHeader>
        <CardContent className="gap-5 pt-5">
          <Tabs defaultValue="overview" className="gap-5">
            <TabsList className="h-auto w-full justify-start gap-2 rounded-[1rem] bg-muted/40 p-1.5">
              <TabsTrigger value="overview" className="min-w-[8rem] flex-none px-3 py-2">
                <CircleDollarSignIcon data-icon="inline-start" />
                Overview
              </TabsTrigger>
              <TabsTrigger value="invoices" className="min-w-[8rem] flex-none px-3 py-2">
                <ReceiptTextIcon data-icon="inline-start" />
                Invoices
              </TabsTrigger>
              <TabsTrigger value="history" className="min-w-[8rem] flex-none px-3 py-2">
                <HistoryIcon data-icon="inline-start" />
                Payment history
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="pt-1">
              <ParentBillingControls paymentMethod={paymentMethod} invoices={invoices} />
            </TabsContent>

            <TabsContent value="invoices" className="pt-1">
              <BillingTableContainer
                title="Invoices"
                description="Current, paid, and upcoming tuition charges are grouped here so families can verify status without scanning a separate billing rail."
              >
                <InvoicesTable invoices={invoices} />
              </BillingTableContainer>
            </TabsContent>

            <TabsContent value="history" className="pt-1">
              <BillingTableContainer
                title="Payment history"
                description="Completed card charges and manual payments stay in one running record for quick reassurance and easy look-back."
              >
                <PaymentHistoryTable payments={paymentHistory} />
              </BillingTableContainer>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageShell>
  )
}
