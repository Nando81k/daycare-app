import { getStripeServer } from '@/lib/stripe';

export interface StripeRevenueSeriesPoint {
  date: string;
  grossCollectedCents: number;
  netCollectedCents: number;
  feeCents: number;
  refundedCents: number;
  paymentCount: number;
}

export interface StripeRevenueSummary {
  available: boolean;
  reason?: 'STRIPE_NOT_CONFIGURED' | 'STRIPE_UNAVAILABLE';
  checkedAt: string;
  rangeStart: string;
  rangeEnd: string;
  grossCollectedCents: number;
  netCollectedCents: number;
  feeCents: number;
  refundedCents: number;
  paymentCount: number;
  series: StripeRevenueSeriesPoint[];
}

const CHARGE_TYPES = new Set(['charge', 'payment']);
const REFUND_TYPES = new Set(['refund', 'payment_refund', 'charge_refund']);

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function isoDay(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function isoDayFromUnix(ts: number) {
  return new Date(ts * 1000).toISOString().slice(0, 10);
}

function buildSeriesMap(startDate: Date, endDate: Date) {
  const from = startOfDay(startDate);
  const to = startOfDay(endDate);
  const map = new Map<string, StripeRevenueSeriesPoint>();
  for (let cursor = new Date(from); cursor <= to; cursor.setDate(cursor.getDate() + 1)) {
    const date = isoDay(cursor);
    map.set(date, {
      date,
      grossCollectedCents: 0,
      netCollectedCents: 0,
      feeCents: 0,
      refundedCents: 0,
      paymentCount: 0,
    });
  }
  return map;
}

function unavailableSummary(
  startDate: Date,
  endDate: Date,
  reason: StripeRevenueSummary['reason'],
): StripeRevenueSummary {
  return {
    available: false,
    reason,
    checkedAt: new Date().toISOString(),
    rangeStart: isoDay(startDate),
    rangeEnd: isoDay(endDate),
    grossCollectedCents: 0,
    netCollectedCents: 0,
    feeCents: 0,
    refundedCents: 0,
    paymentCount: 0,
    series: Array.from(buildSeriesMap(startDate, endDate).values()),
  };
}

export async function getStripeRevenueSummary(
  startDate: Date,
  endDate: Date,
): Promise<StripeRevenueSummary> {
  const stripe = getStripeServer();
  if (!stripe) {
    return unavailableSummary(startDate, endDate, 'STRIPE_NOT_CONFIGURED');
  }

  const seriesMap = buildSeriesMap(startDate, endDate);
  const createdGte = Math.floor(startOfDay(startDate).getTime() / 1000);
  const createdLte = Math.floor(endDate.getTime() / 1000);

  try {
    let processed = 0;
    for await (const txn of stripe.balanceTransactions.list({
      created: { gte: createdGte, lte: createdLte },
      limit: 100,
    })) {
      processed += 1;
      if (processed > 5000) break;

      const key = isoDayFromUnix(txn.created);
      const row = seriesMap.get(key);
      if (!row) continue;

      const amount = txn.amount ?? 0;
      const fee = txn.fee ?? 0;
      const net = txn.net ?? 0;
      const type = String(txn.type || '');

      if (CHARGE_TYPES.has(type) && amount > 0) {
        row.grossCollectedCents += amount;
        row.netCollectedCents += net;
        row.feeCents += fee;
        row.paymentCount += 1;
      }

      if (REFUND_TYPES.has(type) || amount < 0) {
        row.refundedCents += Math.abs(amount);
      }
    }

    const series = Array.from(seriesMap.values());
    const grossCollectedCents = series.reduce((sum, point) => sum + point.grossCollectedCents, 0);
    const netCollectedCents = series.reduce((sum, point) => sum + point.netCollectedCents, 0);
    const feeCents = series.reduce((sum, point) => sum + point.feeCents, 0);
    const refundedCents = series.reduce((sum, point) => sum + point.refundedCents, 0);
    const paymentCount = series.reduce((sum, point) => sum + point.paymentCount, 0);

    return {
      available: true,
      checkedAt: new Date().toISOString(),
      rangeStart: isoDay(startDate),
      rangeEnd: isoDay(endDate),
      grossCollectedCents,
      netCollectedCents,
      feeCents,
      refundedCents,
      paymentCount,
      series,
    };
  } catch (error) {
    console.error('STRIPE_REVENUE_SUMMARY_FAILED', error);
    return unavailableSummary(startDate, endDate, 'STRIPE_UNAVAILABLE');
  }
}
