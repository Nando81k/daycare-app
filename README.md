# Abassadors Care

Next.js 16 App Router application for a daycare marketing site plus parent/admin portals.

## Stack

- Next.js 16 + React 19 + TypeScript + Tailwind 4
- shadcn/ui components
- Auth.js credentials auth + Prisma adapter
- Prisma + PostgreSQL (Neon target)
- Stripe (billing, setup intents, webhooks)
- Resend (transactional email)
- Vercel Blob (enrollment document uploads)

## Environment

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

## Local setup

```bash
pnpm install
pnpm prisma:generate
pnpm prisma:migrate:dev
pnpm prisma:seed
pnpm dev
```

## Scripts

- `pnpm lint`
- `pnpm build`
- `pnpm test`
- `pnpm prisma:generate`
- `pnpm prisma:migrate:dev`
- `pnpm prisma:seed`

## Core backend routes

- Auth: `/api/auth/[...nextauth]`
- Stripe setup intent: `/api/stripe/setup-intent`
- Stripe manual checkout fallback: `/api/stripe/manual-pay`
- Stripe webhook: `/api/stripe/webhook`
- Vercel Blob signed upload: `/api/blob/upload`
- Admin invite acceptance API: `/api/invites/accept`
