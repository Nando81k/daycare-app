import type { BillingCadence } from '@prisma/client';

export const BILLING_DEFAULTS = {
  graceDays: 3,
  lateFeeCents: 2500,
  holdHours: 24,
  reminderOffsets: [7, 3, 0],
} as const;

export function deriveRecurringAmount(monthlyAmountCents: number, cadence: BillingCadence) {
  if (cadence === 'MONTHLY') return monthlyAmountCents;
  if (cadence === 'BIWEEKLY') return Math.round((monthlyAmountCents * 12) / 26);
  return Math.round((monthlyAmountCents * 12) / 52);
}

export function cadenceLabel(cadence: BillingCadence) {
  if (cadence === 'MONTHLY') return 'Monthly';
  if (cadence === 'BIWEEKLY') return 'Biweekly';
  return 'Weekly';
}

export function cadenceToStripeInterval(cadence: BillingCadence) {
  if (cadence === 'MONTHLY') {
    return { interval: 'month' as const, interval_count: 1 };
  }

  if (cadence === 'BIWEEKLY') {
    return { interval: 'week' as const, interval_count: 2 };
  }

  return { interval: 'week' as const, interval_count: 1 };
}
