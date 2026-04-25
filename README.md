This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Branch Strategy

- `main`: current default branch and shared source of truth
- `dev`: integration branch for active development
- `production`: release branch for live deployments

`dev` and `production` should be created from the current committed `main` HEAD, then protected in GitHub so production deployments only come from reviewed changes.

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Stripe Production Checklist

Before enabling live billing, configure all of the following in your production environment:

- `STRIPE_SECRET_KEY` — **live** secret key (starts with `sk_live_`).
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — **live** publishable key (starts with `pk_live_`).
- `STRIPE_WEBHOOK_SECRET` — signing secret for the live webhook endpoint (starts with `whsec_`).
- `NEXT_PUBLIC_APP_URL` — production domain (e.g. `https://ambassadorscare.com`).
- `RESEND_API_KEY` and `RESEND_FROM_EMAIL` — required so dunning emails on failed payments actually send. The `from` domain must be DNS-verified in Resend before the live key flip.

Pinned Stripe API version: `2026-03-25.dahlia` (see [src/lib/stripe.ts](src/lib/stripe.ts)). Bump alongside Stripe SDK upgrades.

### Production webhook endpoint

```text
https://<your-production-domain>/api/stripe/webhook
```

Register this endpoint in the Stripe Dashboard (live mode) and subscribe it to these events:

- `setup_intent.succeeded`
- `payment_intent.succeeded`
- `payment_intent.processing`
- `payment_intent.payment_failed`

The handler is idempotent: every received event is recorded in the `StripeWebhookEvent` table, and duplicates are short-circuited with a 200 response. `payment_intent.create` calls also use idempotency keys keyed off `invoiceId + invoice.updatedAt`, so retried client calls cannot create duplicate intents.

### Go-live verification

1. **Resend DNS** — confirm the `RESEND_FROM_EMAIL` domain shows verified DKIM/SPF/DMARC in the Resend dashboard.
2. **Webhook signing** — copy the live signing secret from Stripe Dashboard → Webhooks → your endpoint, set it as `STRIPE_WEBHOOK_SECRET` on Vercel, redeploy.
3. **Save card** — sign in as a real parent in production, save a card from the parent billing page.
4. **Pay invoice** — pay a real $1 due invoice from `/parent/billing/pay/[invoiceId]`. Confirm:
   - `payment_intent.succeeded` arrives at the webhook (Stripe Dashboard → Webhook → Events).
   - `Invoice.status` flips to `PAID` and `Payment.receiptUrl` is populated.
   - A row exists in `StripeWebhookEvent` with `processedAt` set.
5. **Duplicate event test** — in Stripe Dashboard, resend the same `payment_intent.succeeded` event. Confirm the handler returns `{ received: true, duplicate: true }` and no second `Payment` row is created.
6. **Failed-payment test** — use a [decline test card](https://docs.stripe.com/testing#cards) (in test mode, before flip), trigger `payment_intent.payment_failed`, confirm a dunning email arrives at the billing-contact parent's address.
7. **Confirm key types** — `STRIPE_SECRET_KEY` starts with `sk_live_`, not `sk_test_`. Same for the publishable key.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
