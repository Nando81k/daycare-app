# Development Reference Guide

## Project Structure Overview

```
daycare-app/
├── src/
│   ├── app/              # Next.js App Router (pages, layouts, API)
│   ├── components/       # Reusable React components
│   ├── lib/              # Utilities and helpers
│   │   ├── auth/         # Password hashing
│   │   ├── security/     # Rate limiting, logging
│   │   ├── validation/   # Zod schemas
│   │   └── errors/       # Error handling
│   ├── auth/             # NextAuth config
│   ├── middleware.ts     # Security headers
│   └── app/globals.css   # Global styles
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.ts
└── .env.local            # Your local secrets
```

## Common Development Tasks

### Adding a New Public Page

1. Create file: `src/app/(public)/your-page/page.tsx`
2. Add navigation link to `src/components/Header.tsx`
3. Use the public layout (Header/Footer automatically included)

Example:
```typescript
// src/app/(public)/testimonials/page.tsx
export default function TestimonialsPage() {
  return (
    <>
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h1>Testimonials</h1>
          {/* Your content */}
        </div>
      </section>
    </>
  );
}
```

### Adding a New Protected Page

1. Create file: `src/app/dashboard/your-page/page.tsx`
2. Add to dashboard navigation in `src/app/dashboard/layout.tsx`
3. Use `getServerSession` for auth checks

Example:
```typescript
// src/app/dashboard/billing/page.tsx
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';

export default async function BillingPage() {
  const session = await getServerSession(authConfig);
  if (!session?.user?.id) redirect('/login');

  return (
    <>
      <h1>Billing</h1>
    </>
  );
}
```

### Creating a New API Endpoint

1. Create file: `src/app/api/your-endpoint/route.ts`
2. Add validation with Zod
3. Check authentication with `getServerSession`
4. Return consistent error responses

Example:
```typescript
// src/app/api/billing/invoices/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { ApiErrors, sendErrorResponse } from '@/lib/errors/ApiError';
import { authConfig } from '@/auth/config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return sendErrorResponse(ApiErrors.UNAUTHORIZED(), 401);
    }

    // Your logic here

    return NextResponse.json(data);
  } catch (error) {
    return sendErrorResponse(ApiErrors.INTERNAL_ERROR());
  }
}
```

### Adding Form Validation

1. Create schema in `src/lib/validation/your-feature.ts`
2. Use in API route and client form

Example:
```typescript
// src/lib/validation/payment.ts
import { z } from 'zod';

export const paymentSchema = z.object({
  amount: z.number().positive('Amount must be positive'),
  cardToken: z.string().min(10),
});

export type PaymentInput = z.infer<typeof paymentSchema>;
```

### Creating a New Component

1. Create file: `src/components/YourComponent.tsx`
2. Use TypeScript interfaces
3. Keep components small and focused

Example:
```typescript
// src/components/PricingCard.tsx
interface PricingCardProps {
  title: string;
  price: number;
  features: string[];
  isPopular?: boolean;
}

export function PricingCard({
  title,
  price,
  features,
  isPopular = false
}: PricingCardProps) {
  return (
    <Card className={isPopular ? 'ring-2 ring-blue-600' : ''}>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold text-blue-600">${price}/mo</p>
      <ul className="space-y-2">
        {features.map(feature => (
          <li key={feature}>✓ {feature}</li>
        ))}
      </ul>
    </Card>
  );
}
```

### Database Queries

Use Prisma for all database operations:

```typescript
// Get data
const user = await prisma.user.findUnique({
  where: { id: userId },
});

const children = await prisma.child.findMany({
  where: { parentId: userId },
  include: { enrollmentApplications: true },
});

// Create data
const newChild = await prisma.child.create({
  data: {
    firstName: 'John',
    lastName: 'Doe',
    parentId: userId,
    dateOfBirth: new Date('2022-01-01'),
  },
});

// Update data
const updated = await prisma.child.update({
  where: { id: childId },
  data: { firstName: 'Jane' },
});

// Delete data
await prisma.child.delete({
  where: { id: childId },
});
```

### Authentication Checks

Server-side (recommended):
```typescript
import { getServerSession } from 'next-auth';
import { authConfig } from '@/auth/config';

const session = await getServerSession(authConfig);
if (!session?.user?.id) {
  redirect('/login');
}
```

Client-side (optional):
```typescript
'use client';
import { useSession } from 'next-auth/react';

export function MyComponent() {
  const { data: session } = useSession();

  if (!session) return <div>Not logged in</div>;

  return <div>Welcome, {session.user.name}</div>;
}
```

### Handling Errors

Always use the error utility:
```typescript
import { ApiErrors, sendErrorResponse } from '@/lib/errors/ApiError';

// Validation error
if (!result.success) {
  return sendErrorResponse(ApiErrors.VALIDATION_ERROR(), 400);
}

// Not found
if (!user) {
  return sendErrorResponse(ApiErrors.NOT_FOUND('User not found'), 404);
}

// Unauthorized
if (!session?.user) {
  return sendErrorResponse(ApiErrors.UNAUTHORIZED(), 401);
}

// Forbidden
if (child.parentId !== session.user.id) {
  return sendErrorResponse(ApiErrors.FORBIDDEN('No access'), 403);
}

// Rate limited
if (!rateLimiter.isAllowed(ip, limit, window)) {
  logRateLimitExceeded('/api/endpoint', ip, limit, window);
  return sendErrorResponse(ApiErrors.TOO_MANY_REQUESTS(), 429);
}

// Server error
return sendErrorResponse(ApiErrors.INTERNAL_ERROR());
```

### Rate Limiting

```typescript
import {
  registerLimiter,
  REGISTER_LIMIT,
  REGISTER_WINDOW_MS,
  getClientIp
} from '@/lib/security/rateLimit';

const ip = getClientIp(request);

if (!registerLimiter.isAllowed(ip, REGISTER_LIMIT, REGISTER_WINDOW_MS)) {
  logRateLimitExceeded('/api/endpoint', ip, limit, window);
  return sendErrorResponse(ApiErrors.TOO_MANY_REQUESTS(), 429);
}
```

### Structured Logging

```typescript
import {
  logAuthEvent,
  logEnrollmentEvent,
  logTourRequest,
  logRateLimitExceeded,
  logSecurityEvent,
  logError,
} from '@/lib/security/logger';

// Auth events
logAuthEvent('register', email, true, ip);
logAuthEvent('login_failure', email, false, ip);

// Enrollment events
logEnrollmentEvent('created', parentId, enrollmentId, 'PENDING');
logEnrollmentEvent('status_changed', parentId, enrollmentId, 'APPROVED');

// Tour requests
logTourRequest(email, ip, true);

// Rate limits
logRateLimitExceeded('/api/endpoint', ip, limit, window);

// Security
logSecurityEvent('suspicious_activity', 'WARN', { details: 'value' });

// Errors
logError('database_error', error, { context: 'user_creation' });
```

### Styling with Tailwind

```typescript
<div className="
  bg-white
  rounded-lg
  shadow-md
  p-6
  hover:shadow-lg
  transition-shadow
">
  <h1 className="text-3xl font-bold text-gray-900 mb-4">Heading</h1>
  <p className="text-gray-600 leading-relaxed">Paragraph</p>

  {/* Responsive */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {/* Responsive columns */}
  </div>
</div>
```

### Client-side Data Fetching

```typescript
'use client';
import { useEffect, useState } from 'react';

export function MyComponent() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/endpoint')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <div>{data}</div>;
}
```

### Running Database Migrations

```bash
# Create and run migration
npm run prisma:migrate

# Seed database
npm run prisma:seed

# Open Prisma Studio
npm run prisma:studio
```

## Environment Variables

```
NEXTAUTH_SECRET=              # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000  # Your app URL
DATABASE_URL=postgresql://...  # PostgreSQL connection string
NODE_ENV=development           # development|production|test
LOG_LEVEL=info                # debug|info|warn|error
STRIPE_SECRET_KEY=            # Required for billing portal and invoice checkout
STRIPE_WEBHOOK_SECRET=        # Required for webhook reconciliation
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=  # Browser Stripe integrations
```

### Stripe Billing Setup Checklist
1. Use Stripe **test mode** keys locally (`sk_test_...` and `pk_test_...`).
2. In Stripe Dashboard, enable **Customer Portal** and activate at least one portal configuration.
3. Ensure card payments are enabled for Stripe Checkout in the same account mode (test vs live).
4. Confirm webhook endpoint is configured for `/api/stripe/webhook` with the matching `STRIPE_WEBHOOK_SECRET`.
5. Enable these webhook events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `invoice.created`
   - `invoice.finalized`
   - `invoice.paid`
   - `invoice.payment_failed`
   - `invoice.voided`
6. Restart `npm run dev` after changing Stripe env vars.
7. In `/dashboard/billing`, verify:
   - Button shows `Portal available` when correctly configured.
   - Button is disabled with an explanatory message when misconfigured.
8. In `/dashboard/billing/pay/[invoiceId]`, verify:
   - `Continue to Secure Checkout` redirects to Stripe Checkout.
   - Successful return (`?checkout=success`) transitions invoice to `PAID` after webhook processing.

## Testing Locally

### Test Authentication
1. Go to `/register`
2. Create account with password: `Test123!Pass`
3. Login at `/login`
4. Should redirect to `/dashboard`

### Test API
```bash
# Create child
curl -X POST http://localhost:3000/api/children \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","dateOfBirth":"2022-01-01"}'

# Get children
curl http://localhost:3000/api/children

# Create enrollment
curl -X POST http://localhost:3000/api/enrollments \
  -H "Content-Type: application/json" \
  -d '{"childId":"xxx","programType":"PRESCHOOL"}'
```

### Test Rate Limiting
Make multiple requests to `/api/tour-request`:
```bash
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/tour-request \
    -H "Content-Type: application/json" \
    -d '{"parentName":"Test","parentEmail":"test@test.com","parentPhone":"5551234567"}'
  sleep 1
done
```

## Debugging

### Enable Debug Logging
```typescript
// In any file
console.log('Debug:', variable);

// Check logs in terminal while running npm run dev
```

### Debug Database
```bash
npm run prisma:studio

# Opens Prisma Studio at http://localhost:5555
# View and edit database records visually
```

### Check TypeScript Errors
```bash
npm run build
```

## Performance Tips

1. Use **Server Components** by default for static content
2. Use **Client Components** (`'use client'`) only when needed for interactivity
3. **Lazy load** images with placeholders
4. **Memoize** expensive computations with `useMemo`
5. **Debounce** form inputs to reduce API calls
6. Use **loading states** to show progress to users

## Common Gotchas

1. **Async/await in Server Components**: Use directly in server components
2. **useEffect in Client Components**: Remember dependencies array
3. **Database Queries**: Always handle errors with try/catch
4. **Prisma Migrations**: Don't edit `prisma/migrations` files manually
5. **Environment Variables**: Must restart dev server when changed
6. **Session Data**: User data is immutable; don't try to mutate it

---

For more help, see `README.md` or check NextAuth, Prisma, and Tailwind documentation.
