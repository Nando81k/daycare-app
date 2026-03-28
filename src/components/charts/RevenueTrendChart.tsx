'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { formatCurrency } from '@/lib/format';
import { cn } from '@/lib/utils';
import { ChartCard } from './ChartCard';

export interface RevenuePoint {
  date: string;
  label: string;
  invoicedCents: number;
  collectedCents: number;
  stripeGrossCollectedCents?: number;
  stripeNetCollectedCents?: number;
  stripeFeeCents?: number;
  stripeRefundedCents?: number;
  stripePaymentCount?: number;
}

interface MixPoint {
  status: string;
  count: number;
}

interface Props {
  data: RevenuePoint[];
  mix?: MixPoint[];
  title?: string;
  subtitle?: string;
}

const PRESETS = [
  { key: '7D', days: 7 },
  { key: '30D', days: 30 },
  { key: '60D', days: 60 },
  { key: '90D', days: 90 },
] as const;

const STATUS_COLORS: Record<string, string> = {
  PAID: '#0b9a74',
  OPEN: '#1f74f0',
  PAST_DUE: '#cf4061',
  DRAFT: '#4f87bd',
  VOID: '#c4d9ec',
};

function compactCurrency(cents: number) {
  const dollars = cents / 100;
  if (Math.abs(dollars) >= 1000) {
    return `$${(dollars / 1000).toFixed(1)}k`;
  }
  return `$${Math.round(dollars)}`;
}

export function RevenueTrendChart({ data, mix = [], title = 'Revenue Trend', subtitle }: Props) {
  const [presetDays, setPresetDays] = useState<number>(90);
  const chartData = useMemo(
    () =>
      data.slice(-presetDays).map((row) => ({
        ...row,
        stripeGrossCollectedCents: row.stripeGrossCollectedCents ?? 0,
        stripeNetCollectedCents: row.stripeNetCollectedCents ?? 0,
        stripeFeeCents: row.stripeFeeCents ?? 0,
        stripeRefundedCents: row.stripeRefundedCents ?? 0,
        stripePaymentCount: row.stripePaymentCount ?? 0,
      })),
    [data, presetDays],
  );
  const hasChartData = useMemo(
    () =>
      chartData.some(
        (point) =>
          point.invoicedCents > 0 ||
          point.collectedCents > 0 ||
          point.stripeGrossCollectedCents > 0 ||
          point.stripeNetCollectedCents > 0,
      ),
    [chartData],
  );
  const hasStripeData = useMemo(
    () =>
      chartData.some(
        (point) =>
          point.stripeGrossCollectedCents > 0 ||
          point.stripeNetCollectedCents > 0 ||
          point.stripeFeeCents > 0 ||
          point.stripeRefundedCents > 0 ||
          point.stripePaymentCount > 0,
      ),
    [chartData],
  );

  const [activeDate, setActiveDate] = useState<string | null>(chartData[chartData.length - 1]?.date || null);

  useEffect(() => {
    if (!chartData.find((point) => point.date === activeDate)) {
      setActiveDate(chartData[chartData.length - 1]?.date || null);
    }
  }, [activeDate, chartData]);

  const active = useMemo(() => chartData.find((d) => d.date === activeDate) || null, [chartData, activeDate]);

  const totals = useMemo(() => {
    const invoiced = chartData.reduce((sum, row) => sum + row.invoicedCents, 0);
    const collected = chartData.reduce((sum, row) => sum + row.collectedCents, 0);
    const stripeGross = chartData.reduce((sum, row) => sum + row.stripeGrossCollectedCents, 0);
    const stripeNet = chartData.reduce((sum, row) => sum + row.stripeNetCollectedCents, 0);
    const rate = invoiced > 0 ? Math.round((collected / invoiced) * 100) : 0;
    return { invoiced, collected, stripeGross, stripeNet, rate };
  }, [chartData]);

  const labelByDate = useMemo(() => {
    return new Map(chartData.map((point) => [point.date, point.label]));
  }, [chartData]);

  const mixSummary = useMemo(() => {
    const total = mix.reduce((sum, row) => sum + row.count, 0);
    return mix
      .filter((row) => row.count > 0)
      .sort((a, b) => b.count - a.count)
      .map((row) => ({
        ...row,
        percent: total > 0 ? Math.round((row.count / total) * 100) : 0,
      }));
  }, [mix]);

  return (
    <ChartCard
      title={title}
      subtitle={subtitle}
      bodyClassName="h-[420px] overflow-y-auto lg:h-[312px] lg:overflow-hidden"
      info={{
        label: 'Collections trend help',
        title: 'How to read this trend',
        description: (
          <ul className="space-y-1">
            <li>Select a preset to compare short-term vs longer-term collections.</li>
            <li>Click a point to lock day insights on the right panel.</li>
            <li>Invoiced is amount billed; Collected is successful payment volume.</li>
            <li>Collections mix is shown under day insights in this same panel.</li>
          </ul>
        ),
      }}
    >
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex items-center gap-1 rounded-field border border-line bg-white p-1 shadow-sm">
          {PRESETS.map((preset) => (
            <button
              key={preset.key}
              type="button"
              onClick={() => setPresetDays(preset.days)}
              className={cn(
                'rounded-field px-2.5 py-1 text-xs font-semibold transition',
                presetDays === preset.days
                  ? 'bg-primary-700 text-white'
                  : 'text-ink-600 hover:bg-bg-soft hover:text-ink-900'
              )}
            >
              {preset.key}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="rounded-field border border-line bg-white px-2 py-1 text-ink-700 shadow-sm">
            Invoiced <strong className="text-ink-900">{formatCurrency(totals.invoiced)}</strong>
          </span>
          <span className="rounded-field border border-line bg-white px-2 py-1 text-ink-700 shadow-sm">
            Collected <strong className="text-ink-900">{formatCurrency(totals.collected)}</strong>
          </span>
          {hasStripeData ? (
            <span className="rounded-field border border-line bg-white px-2 py-1 text-ink-700 shadow-sm">
              Stripe Gross <strong className="text-ink-900">{formatCurrency(totals.stripeGross)}</strong>
            </span>
          ) : null}
          {hasStripeData ? (
            <span className="rounded-field border border-line bg-white px-2 py-1 text-ink-700 shadow-sm">
              Stripe Net <strong className="text-ink-900">{formatCurrency(totals.stripeNet)}</strong>
            </span>
          ) : null}
          <span className="rounded-field border border-line bg-white px-2 py-1 text-ink-700 shadow-sm">
            Collection rate <strong className="text-ink-900">{totals.rate}%</strong>
          </span>
        </div>
      </div>

      <div className="grid h-full min-h-0 min-w-0 gap-3 lg:grid-cols-[1fr_248px]">
        <div className="h-[220px] min-h-[220px] min-w-0 overflow-hidden rounded-field border border-line/70 bg-white/70 p-2 shadow-sm lg:h-full lg:min-h-0">
          {hasChartData ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 10, right: 18, bottom: 30, left: 74 }}
                onClick={(state: any) => {
                  const nextDate = state?.activeLabel;
                  if (typeof nextDate === 'string') {
                    setActiveDate(nextDate);
                  }
                }}
              >
                <CartesianGrid stroke="#adc8e8" strokeDasharray="4 4" vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={10}
                  tickFormatter={(value) => labelByDate.get(String(value)) || String(value)}
                  style={{ fontSize: 12, fill: '#365f87' }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={70}
                  tickMargin={10}
                  tickFormatter={(value) => compactCurrency(Number(value))}
                  style={{ fontSize: 12, fill: '#365f87' }}
                />
                <Tooltip
                  cursor={{ stroke: '#18be98', strokeWidth: 1, strokeDasharray: '4 4' }}
                  content={({ active: isActive, payload, label }) => {
                    if (!isActive || !payload || !payload.length) return null;
                    const dateLabel = labelByDate.get(String(label)) || String(label);
                    return (
                      <div className="rounded-[12px] border border-line bg-white px-3 py-2 text-xs shadow-lg">
                        <p className="mb-1 font-semibold text-ink-900">{dateLabel}</p>
                        <div className="space-y-1">
                          {payload.map((entry) => (
                            <div key={entry.name} className="flex items-center justify-between gap-3">
                              <span className="inline-flex items-center gap-1.5 text-ink-600">
                                <span
                                  className="h-2.5 w-2.5 rounded-full"
                                  style={{ backgroundColor: String(entry.color || '#86acd8') }}
                                />
                                {entry.name}
                              </span>
                              <span className="font-semibold text-ink-900">{formatCurrency(Number(entry.value) || 0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }}
                />
                {activeDate ? (
                  <ReferenceLine x={activeDate} stroke="#5f89b3" strokeWidth={1} strokeDasharray="4 4" />
                ) : null}
                <Line
                  type="monotone"
                  dataKey="invoicedCents"
                  name="Invoiced"
                  stroke="#1f7cff"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="collectedCents"
                  name="Collected"
                  stroke="#0d2b5a"
                  strokeWidth={2.5}
                  dot={false}
                  activeDot={{ r: 4 }}
                />
                {hasStripeData ? (
                  <Line
                    type="monotone"
                    dataKey="stripeNetCollectedCents"
                    name="Stripe Net"
                    stroke="#18be98"
                    strokeWidth={2.3}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                ) : null}
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm font-medium text-ink-600">No data</div>
          )}
        </div>

        <aside className="min-w-0 overflow-y-auto rounded-field border border-line bg-white p-3 shadow-sm lg:h-full">
          <div className="mb-2 flex items-center gap-3 text-xs font-semibold text-ink-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#1f7cff]" />
              Invoiced
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#0d2b5a]" />
              Collected
            </span>
            {hasStripeData ? (
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-[#18be98]" />
                Stripe Net
              </span>
            ) : null}
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Day Insights</p>
          {hasChartData && active ? (
            <>
              <p className="mt-1 text-sm font-semibold text-ink-900">{active.label}</p>
              <dl className="mt-3 space-y-2 text-sm text-ink-700">
                <div className="flex justify-between gap-2">
                  <dt>Invoiced</dt>
                  <dd className="font-semibold">{formatCurrency(active.invoicedCents)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Collected</dt>
                  <dd className="font-semibold">{formatCurrency(active.collectedCents)}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt>Outstanding</dt>
                  <dd className="font-semibold">{formatCurrency(active.invoicedCents - active.collectedCents)}</dd>
                </div>
                {hasStripeData ? (
                  <div className="flex justify-between gap-2">
                    <dt>Stripe gross</dt>
                    <dd className="font-semibold">{formatCurrency(active.stripeGrossCollectedCents)}</dd>
                  </div>
                ) : null}
                {hasStripeData ? (
                  <div className="flex justify-between gap-2">
                    <dt>Stripe net</dt>
                    <dd className="font-semibold">{formatCurrency(active.stripeNetCollectedCents)}</dd>
                  </div>
                ) : null}
                {hasStripeData ? (
                  <div className="flex justify-between gap-2">
                    <dt>Stripe fees</dt>
                    <dd className="font-semibold">{formatCurrency(active.stripeFeeCents)}</dd>
                  </div>
                ) : null}
                {hasStripeData ? (
                  <div className="flex justify-between gap-2">
                    <dt>Stripe refunds</dt>
                    <dd className="font-semibold">{formatCurrency(active.stripeRefundedCents)}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : (
            <p className="mt-3 text-sm text-ink-600">{hasChartData ? 'Click a point to inspect day details.' : 'No data'}</p>
          )}

          <div className="mt-3 border-t border-line pt-3">
            <p className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-500">Collections Mix</p>
            {mixSummary.length ? (
              <div className="mt-2 space-y-1.5">
                {mixSummary.map((entry) => (
                  <div key={entry.status} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-xs">
                      <span className="inline-flex items-center gap-1.5 text-ink-600">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[entry.status] || '#86acd8' }}
                        />
                        {entry.status.replace('_', ' ')}
                      </span>
                      <span className="font-semibold text-ink-900">
                        {entry.count} ({entry.percent}%)
                      </span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-bg-soft">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.max(6, entry.percent)}%`,
                          backgroundColor: STATUS_COLORS[entry.status] || '#86acd8',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-xs text-ink-600">No mix data</p>
            )}
          </div>
        </aside>
      </div>
    </ChartCard>
  );
}
