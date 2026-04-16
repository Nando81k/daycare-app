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

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `NEXT_PUBLIC_APP_URL`

Production webhook endpoint:

```text
https://<your-production-domain>/api/stripe/webhook
```

Subscribe the webhook to these events:

- `setup_intent.succeeded`
- `payment_intent.succeeded`
- `payment_intent.processing`
- `payment_intent.payment_failed`

Recommended go-live verification:

1. Save a card from the parent billing page.
2. Pay a due invoice from `/parent/billing/pay/[invoiceId]`.
3. Confirm the webhook updates the local payment record and invoice status.
4. Confirm the saved payment record includes the Stripe receipt URL.
5. Confirm production env vars use live Stripe keys, not test keys.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
