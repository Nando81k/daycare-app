import Stripe from 'stripe';

let cached: Stripe | null = null;

export function getStripeServer() {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) return null;
  if (cached) return cached;

  cached = new Stripe(key, {
    apiVersion: '2026-01-28.clover',
    typescript: true,
  });

  return cached;
}
