import Link from 'next/link';
import { Badge, Button, Card } from '@/components/ui';
import { PayInvoiceButton } from '@/components/billing';
import { MarkAllNotificationsReadButton } from '@/components/dashboard/notifications/MarkAllNotificationsReadButton';
import { formatCurrency, formatDate, formatDateTime, formatRelativeTime } from '@/lib/format';
import type { getParentOverview } from '@/lib/v3/queries';

type ParentOverviewData = Awaited<ReturnType<typeof getParentOverview>>;

interface ParentOverviewContentProps {
  data: ParentOverviewData;
}

function statusVariant(status: string): 'default' | 'info' | 'warning' | 'danger' | 'success' {
  if (status === 'APPROVED' || status === 'PAID' || status === 'SUCCEEDED') return 'success';
  if (status === 'WAITLISTED' || status === 'REQUEST_INFO' || status === 'OPEN') return 'warning';
  if (status === 'PAST_DUE' || status === 'DENIED' || status === 'FAILED') return 'danger';
  if (status === 'PENDING') return 'info';
  return 'default';
}

export function ParentOverviewContent({ data }: ParentOverviewContentProps) {
  const visibleQueue = data.actionQueue.slice(0, 2);
  const remainingQueue = data.actionQueue.slice(2);
  const visibleEnrollmentLane = data.enrollmentLane.slice(0, 3);
  const hiddenEnrollmentLaneCount = Math.max(0, data.enrollmentLane.length - visibleEnrollmentLane.length);
  const visibleNotificationPreview = data.notificationSummary.previewItems.slice(0, 2);
  const hiddenNotificationCount = Math.max(
    0,
    data.notificationSummary.previewItems.length - visibleNotificationPreview.length,
  );

  return (
    <div className="space-y-3">
      <section className="grid gap-3 xl:grid-cols-[1.2fr_1fr]">
        <Card title="Today" subtitle="Priority actions for your family" data-tour-id="parent-overview-today">
          {visibleQueue.length ? (
            <>
              <div className="space-y-1.5">
                {visibleQueue.map((item) => {
                  const tone =
                    item.kind === 'ENROLLMENT_REQUEST_INFO'
                      ? 'border-amber-200 bg-amber-50'
                      : item.kind === 'ENROLLMENT_PENDING'
                        ? 'border-sky-200 bg-sky-50'
                        : item.kind === 'INVOICE_PAST_DUE'
                          ? 'border-rose-200 bg-rose-50'
                          : item.kind === 'INVOICE_DUE_SOON'
                            ? 'border-orange-200 bg-orange-50'
                            : 'border-emerald-200 bg-emerald-50';

                  return (
                    <article key={item.id} className={`rounded-field border px-3 py-2 ${tone}`}>
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-ink-900">{item.title}</p>
                          <p className="mt-0.5 text-sm text-ink-700">{item.description}</p>
                        </div>
                        <Badge variant={statusVariant(item.kind.includes('INVOICE') ? 'OPEN' : 'PENDING')}>
                          {item.kind === 'ENROLLMENT_REQUEST_INFO'
                            ? 'Request Info'
                            : item.kind === 'ENROLLMENT_PENDING'
                              ? 'Pending'
                              : item.kind === 'INVOICE_PAST_DUE'
                                ? 'Past Due'
                                : item.kind === 'INVOICE_DUE_SOON'
                                  ? 'Due Soon'
                                  : 'Unread'}
                        </Badge>
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {item.kind === 'INVOICE_PAST_DUE' || item.kind === 'INVOICE_DUE_SOON' ? (
                          <>
                            {item.invoiceId ? (
                              <PayInvoiceButton
                                invoiceId={item.invoiceId}
                                label="Pay Now"
                                size="sm"
                                fullWidth={false}
                              />
                            ) : null}
                            <Button asChild size="sm" variant="ghost">
                              <Link href={item.href}>View Invoice</Link>
                            </Button>
                          </>
                        ) : item.kind === 'NOTIFICATION_UNREAD' ? (
                          <>
                            <MarkAllNotificationsReadButton unreadCount={item.unreadCount || 0} size="sm" />
                            <Button asChild size="sm" variant="ghost">
                              <Link href={item.href}>Open Notifications</Link>
                            </Button>
                          </>
                        ) : (
                          <Button asChild size="sm" variant="outline">
                            <Link href={item.href}>{item.ctaLabel}</Link>
                          </Button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>

              {remainingQueue.length ? (
                <details className="mt-2 rounded-field border border-line bg-white px-3 py-2">
                  <summary className="cursor-pointer text-sm font-semibold text-ink-800">
                    View all tasks ({data.actionQueue.length})
                  </summary>
                  <div className="mt-1.5 space-y-1.5">
                    {remainingQueue.map((item) => (
                      <div key={item.id} className="rounded-field border border-line bg-bg-soft px-3 py-2">
                        <p className="text-sm font-semibold text-ink-900">{item.title}</p>
                        <p className="text-xs text-ink-600">{item.description}</p>
                      </div>
                    ))}
                  </div>
                </details>
              ) : null}
            </>
          ) : (
            <div className="space-y-3">
              <p className="rounded-field border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                You&apos;re caught up. No urgent actions right now.
              </p>
              <Button asChild size="sm">
                <Link href="/dashboard/family">Open Family Hub</Link>
              </Button>
            </div>
          )}
        </Card>

        <Card
          title="Enrollment Lane"
          subtitle="Latest status by child, prioritized for admissions progress"
          data-tour-id="parent-overview-enrollment-lane"
        >
          <div className="space-y-1.5">
            {visibleEnrollmentLane.length ? (
              visibleEnrollmentLane.map((row) => (
                <article key={row.enrollmentId} className="rounded-field border border-line bg-white px-3 py-2 shadow-sm">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-ink-900">{row.childName}</p>
                    <Badge variant={statusVariant(row.status)}>{row.status.replace('_', ' ')}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-ink-500">
                    {row.programType.replace('_', ' ')} • updated {formatRelativeTime(row.updatedAt)}
                  </p>
                  {row.startDate ? (
                    <p className="mt-1 text-xs text-ink-600">Preferred start: {formatDate(row.startDate)}</p>
                  ) : null}
                </article>
              ))
            ) : (
              <p className="rounded-field border border-dashed border-line bg-white px-3 py-3 text-sm text-ink-600">
                No enrollments yet. Start from Family Hub to submit your first application.
              </p>
            )}
          </div>

          {hiddenEnrollmentLaneCount > 0 ? (
            <p className="mt-2 text-xs text-ink-500">
              +{hiddenEnrollmentLaneCount} more child status update{hiddenEnrollmentLaneCount === 1 ? '' : 's'} in Family Hub.
            </p>
          ) : null}

          <div className="mt-2.5 grid gap-2 sm:grid-cols-2">
            <Button asChild size="sm" fullWidth>
              <Link href="/dashboard/family">Continue Enrollment</Link>
            </Button>
            <Button asChild size="sm" variant="ghost" fullWidth>
              <Link href="/dashboard/family">Review Child Profiles</Link>
            </Button>
          </div>
        </Card>
      </section>

      <section>
        <Card
          title="Money + Messages"
          subtitle="Billing clarity and notifications in one compact module"
          data-tour-id="parent-overview-money-messages"
        >
          <div className="grid gap-2.5 lg:grid-cols-2">
            <div className="space-y-1.5 rounded-field border border-line bg-white p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Billing</p>
              <p className="text-base font-semibold text-ink-900">
                Due now: {formatCurrency(data.financeSummary.dueNowCents)}
              </p>
              <p className="text-sm text-ink-700">
                {data.financeSummary.pastDueCount} past due • {data.financeSummary.dueSoonCount} due soon
              </p>
              {data.financeSummary.nextDueInvoice ? (
                <article className="rounded-field border border-sky-200 bg-sky-50 px-2.5 py-2">
                  <p className="text-sm font-semibold text-ink-900">
                    Next: {data.financeSummary.nextDueInvoice.invoiceNumber}
                  </p>
                  <p className="text-xs text-ink-700">
                    {data.financeSummary.nextDueInvoice.childName} • due{' '}
                    {formatDate(data.financeSummary.nextDueInvoice.dueDate)} •{' '}
                    {formatCurrency(data.financeSummary.nextDueInvoice.amountDueCents)}
                  </p>
                  {(data.financeSummary.nextDueInvoice.status === 'OPEN' ||
                    data.financeSummary.nextDueInvoice.status === 'PAST_DUE') ? (
                    <div className="mt-2">
                      <PayInvoiceButton
                        invoiceId={data.financeSummary.nextDueInvoice.id}
                        label="Pay Next Invoice"
                        size="sm"
                        fullWidth={false}
                      />
                    </div>
                  ) : null}
                </article>
              ) : (
                <p className="text-sm text-emerald-700">No unpaid invoices right now.</p>
              )}
              {data.financeSummary.lastPayment ? (
                <p className="text-xs text-ink-600">
                  Last payment: {formatCurrency(data.financeSummary.lastPayment.amountCents)} on{' '}
                  {formatDateTime(
                    data.financeSummary.lastPayment.processedAt ||
                      data.financeSummary.lastPayment.createdAt,
                  )}
                </p>
              ) : null}
            </div>

            <div className="space-y-1.5 rounded-field border border-line bg-white p-2.5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">
                Notifications
              </p>
              <p className="text-base font-semibold text-ink-900">
                {data.notificationSummary.unreadCount} unread
              </p>
              {visibleNotificationPreview.length ? (
                <div className="space-y-1.5">
                  {visibleNotificationPreview.map((item) => (
                    <article key={item.id} className="rounded-field border border-line bg-bg-soft px-3 py-2">
                      <p className="text-sm font-semibold text-ink-900">{item.subject}</p>
                      <p className="mt-0.5 text-xs text-ink-700">{item.message}</p>
                      <p className="mt-1 text-xs text-ink-500">{formatRelativeTime(item.createdAt)}</p>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-600">No unread admin messages.</p>
              )}

              {hiddenNotificationCount > 0 ? (
                <p className="text-xs text-ink-500">
                  +{hiddenNotificationCount} more unread message{hiddenNotificationCount === 1 ? '' : 's'}.
                </p>
              ) : null}

              <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                <MarkAllNotificationsReadButton unreadCount={data.notificationSummary.unreadCount} />
                <div className="flex items-center justify-between gap-2">
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/dashboard/notifications">Open Notifications</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </section>
    </div>
  );
}
