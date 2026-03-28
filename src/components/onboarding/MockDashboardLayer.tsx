'use client';

interface FrameRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

interface MockDashboardLayerProps {
  stepKey: string;
  frame: FrameRect;
}

type DemoVariant =
  | 'metrics'
  | 'trend'
  | 'admissions'
  | 'families'
  | 'invoices'
  | 'payments'
  | 'notifications'
  | 'intake'
  | 'enrollment'
  | 'chips'
  | 'none';

function demoVariant(stepKey: string): DemoVariant {
  if (stepKey.includes('overview-metrics')) return 'metrics';
  if (stepKey.includes('overview-trend')) return 'trend';
  if (stepKey.includes('admissions')) return 'admissions';
  if (stepKey.includes('families')) return 'families';
  if (stepKey.includes('billing-invoices')) return 'invoices';
  if (stepKey.includes('billing-history')) return 'payments';
  if (stepKey.includes('notifications-list')) return 'notifications';
  if (stepKey.includes('family-intake')) return 'intake';
  if (stepKey.includes('family-status') || stepKey.includes('overview-enrollment')) return 'enrollment';
  if (stepKey.includes('notifications-filters') || stepKey.includes('nav')) return 'chips';
  return 'none';
}

function MetricDemo() {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {[
        ['Pending', '14'],
        ['Receivables', '$6,420'],
        ['Collected', '$12,980'],
        ['Alerts', '3'],
      ].map(([label, value]) => (
        <article key={label} className="rounded-[12px] border border-white/65 bg-white/90 px-3 py-2.5 shadow-soft">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">{label}</p>
          <p className="mt-1 text-sm font-semibold text-ink-900">{value}</p>
        </article>
      ))}
    </div>
  );
}

function TrendDemo() {
  return (
    <div className="rounded-[12px] border border-white/65 bg-white/90 p-3 shadow-soft">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Demo trend</p>
      <div className="relative mt-2 h-28 rounded-[10px] bg-primary-50">
        <div className="absolute inset-x-2 top-4 flex items-end gap-1.5">
          {[22, 30, 20, 34, 27, 39, 33, 45, 37, 50].map((height, index) => (
            <span
              key={index}
              className="w-2.5 rounded-full bg-primary-300/90"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <div className="absolute inset-x-3 bottom-5 h-0.5 bg-primary-700/70" />
      </div>
    </div>
  );
}

function TableDemo(props: { rows: Array<{ label: string; meta: string; status: string }>; statusTone?: 'warning' | 'danger' | 'success' }) {
  return (
    <div className="rounded-[12px] border border-white/65 bg-white/90 p-2 shadow-soft">
      <div className="space-y-1.5">
        {props.rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between gap-2 rounded-[10px] border border-white/65 bg-white/90 px-2.5 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-ink-900">{row.label}</p>
              <p className="truncate text-[11px] text-ink-500">{row.meta}</p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                props.statusTone === 'danger'
                  ? 'bg-rose-100 text-rose-700'
                  : props.statusTone === 'warning'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-emerald-100 text-emerald-700'
              }`}
            >
              {row.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntakeDemo() {
  return (
    <div className="rounded-[12px] border border-white/65 bg-white/90 p-3 shadow-soft">
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-500">Guided intake demo</p>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-ink-100">
        <div className="h-full w-3/5 rounded-full bg-primary-600" />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {['Choose Path', 'Child Details', 'Review'].map((step, index) => (
          <div key={step} className={`rounded-[10px] border px-2 py-2 text-[11px] font-medium ${index === 1 ? 'border-primary-200 bg-primary-50 text-primary-900' : 'border-white/65 bg-white/90 text-ink-600'}`}>
            {step}
          </div>
        ))}
      </div>
    </div>
  );
}

function ChipDemo() {
  return (
    <div className="rounded-[12px] border border-white/65 bg-white/90 px-3 py-2.5 shadow-soft">
      <div className="flex flex-wrap gap-1.5">
        {['Overview', 'Admissions', 'Families', 'Billing'].map((item, index) => (
          <span
            key={item}
            className={`rounded-full border px-2 py-1 text-[11px] font-semibold ${
              index === 1
                ? 'border-primary-200 bg-primary-100 text-primary-800'
                : 'border-white/65 bg-white/90 text-ink-600'
            }`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

export function MockDashboardLayer({ stepKey, frame }: MockDashboardLayerProps) {
  const variant = demoVariant(stepKey);
  if (variant === 'none') return null;

  const inset = 14;
  const availableWidth = Math.max(0, frame.width - inset * 2);
  const availableHeight = Math.max(0, frame.height - inset * 2);
  if (availableWidth < 140 || availableHeight < 72) return null;

  const width = Math.min(availableWidth, 460);
  const height = Math.min(availableHeight, 260);
  const left = frame.left + (frame.width - width) / 2;
  const top = frame.top + (frame.height - height) / 2;
  const compact = width < 250 || height < 120;

  return (
    <div
      className="pointer-events-none absolute z-[131]"
      style={{ left, top, width, height }}
      aria-hidden
    >
      {compact ? (
        <div className="inline-flex rounded-full border border-primary-200 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-primary-800 shadow-soft">
          Demo data preview
        </div>
      ) : null}

      {!compact ? (
        <>
          {variant === 'metrics' ? <MetricDemo /> : null}
          {variant === 'trend' ? <TrendDemo /> : null}
          {variant === 'admissions' ? (
            <TableDemo
              statusTone="warning"
              rows={[
                { label: 'Mia Johnson', meta: 'Toddler • Parent: A. Johnson', status: 'PENDING' },
                { label: 'Leo Rivera', meta: 'Infant • Parent: C. Rivera', status: 'REQUEST_INFO' },
                { label: 'Noah Clarke', meta: 'Pre-K • Parent: K. Clarke', status: 'APPROVED' },
              ]}
            />
          ) : null}
          {variant === 'families' ? (
            <TableDemo
              statusTone="success"
              rows={[
                { label: 'Walker Family', meta: '2 children • Balance $420', status: 'ACTIVE' },
                { label: 'Patel Family', meta: '1 child • Balance $0', status: 'ACTIVE' },
                { label: 'Nguyen Family', meta: '3 children • Balance $190', status: 'ACTIVE' },
              ]}
            />
          ) : null}
          {variant === 'invoices' ? (
            <TableDemo
              statusTone="danger"
              rows={[
                { label: 'INV-1048', meta: 'Walker Family • Due Mar 3', status: 'PAST_DUE' },
                { label: 'INV-1050', meta: 'Patel Family • Due Mar 8', status: 'OPEN' },
                { label: 'INV-1051', meta: 'Nguyen Family • Due Mar 9', status: 'OPEN' },
              ]}
            />
          ) : null}
          {variant === 'payments' ? (
            <TableDemo
              statusTone="success"
              rows={[
                { label: '$820.00', meta: 'INV-1031 • Card', status: 'SUCCEEDED' },
                { label: '$190.00', meta: 'INV-1042 • Card', status: 'SUCCEEDED' },
                { label: '$420.00', meta: 'INV-1048 • Card', status: 'FAILED' },
              ]}
            />
          ) : null}
          {variant === 'notifications' ? (
            <TableDemo
              statusTone="warning"
              rows={[
                { label: 'Enrollment update', meta: 'Mia Johnson moved to review', status: 'NEW' },
                { label: 'Billing reminder', meta: 'Invoice INV-1050 due in 3 days', status: 'NEW' },
                { label: 'Admin message', meta: 'Please confirm pickup contact', status: 'NEW' },
              ]}
            />
          ) : null}
          {variant === 'intake' ? <IntakeDemo /> : null}
          {variant === 'enrollment' ? (
            <TableDemo
              statusTone="success"
              rows={[
                { label: 'Mia Johnson', meta: 'Toddler • Submitted Feb 20', status: 'APPROVED' },
                { label: 'Leo Rivera', meta: 'Infant • Submitted Feb 18', status: 'PENDING' },
                { label: 'Noah Clarke', meta: 'Pre-K • Submitted Feb 16', status: 'WAITLISTED' },
              ]}
            />
          ) : null}
          {variant === 'chips' ? <ChipDemo /> : null}
        </>
      ) : null}
    </div>
  );
}
