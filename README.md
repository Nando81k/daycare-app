# Daycare Web Application

A production-ready fullstack daycare management system built with Next.js, PostgreSQL, Prisma, NextAuth, and Tailwind CSS.

## Features

### Public Pages
- **Home**: Hero section with features, testimonials, and CTAs
- **About**: Team profiles, mission statement, and values
- **Programs**: Detailed information about Infant, Toddler, Preschool, and Pre-K programs
- **Safety**: Health protocols, background checks, emergency procedures
- **Gallery**: Photo gallery of facilities and activities
- **FAQ**: Common questions with expandable answers
- **Contact**: Tour request form and contact information

### Parent Portal (Protected)
- **Dashboard**: Overview with children count and enrollment status
- **Children Management**: Add, edit, and manage child profiles
- **Enrollment**: Submit program enrollment applications
- **Status Tracking**: View enrollment application status with color-coded badges
- **Account Management**: Secure login and session management

### Admin Features (Ready to Implement)
- View all enrollment applications
- Approve, deny, or waitlist applications
- Manage staff profiles and testimonials
- View tour requests

## Security Features

✅ **Authentication & Sessions**
- NextAuth with Credentials provider
- Bcrypt password hashing (12 salt rounds)
- Strong password policy (min 12 chars, uppercase, lowercase, number, special char)
- Secure, httpOnly cookies with SameSite=Strict
- Server-side session validation

✅ **API Security**
- Input validation with Zod
- Rate limiting (auth: 5-10/15min, tour: 3/hour)
- Consistent error responses without info leaks
- Parameterized database queries (Prisma)
- Role-based access control (PARENT/ADMIN)

✅ **CSRF/XSS Protection**
- CSRF tokens handled by NextAuth
- HTML escaping on all user-generated content
- Content Security Policy headers
- Honeypot field on public forms

✅ **Security Headers**
- Content-Security-Policy
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Referrer-Policy
- Permissions-Policy
- Strict-Transport-Security (production)

✅ **Logging & Monitoring**
- Structured logging without PII
- Authentication events logged
- Rate limit violations tracked
- Error logging without stack traces in production

## Project Structure

```
daycare-app/
├── src/
│   ├── app/
│   │   ├── (public)/              # Public pages with header/footer
│   │   │   ├── page.tsx           # Home page
│   │   │   ├── about/page.tsx
│   │   │   ├── programs/page.tsx
│   │   │   ├── safety/page.tsx
│   │   │   ├── gallery/page.tsx
│   │   │   ├── faq/page.tsx
│   │   │   └── contact/page.tsx
│   │   ├── dashboard/             # Protected parent portal
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx           # Dashboard home
│   │   │   ├── children/          # Children management
│   │   │   ├── enrollments/       # Enrollment tracking
│   │   │   └── enroll/            # New enrollment form
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── register/
│   │   │   │   └── [...nextauth]/
│   │   │   ├── children/          # Child CRUD
│   │   │   ├── enrollments/       # Enrollment management
│   │   │   ├── tour-request/      # Public tour requests
│   │   │   └── admin/
│   │   │       └── enrollments/   # Admin enrollment management
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx             # Root layout
│   ├── components/                # Reusable React components
│   │   ├── Button.tsx
│   │   ├── Input.tsx
│   │   ├── Card.tsx
│   │   ├── Badge.tsx
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   ├── TourRequestForm.tsx
│   │   └── Testimonial.tsx
│   ├── lib/
│   │   ├── env.ts                 # Environment validation
│   │   ├── prisma.ts              # Prisma client singleton
│   │   ├── auth/
│   │   │   └── password.ts        # Password hashing/verification
│   │   ├── validation/            # Zod schemas
│   │   │   ├── auth.ts
│   │   │   ├── child.ts
│   │   │   ├── enrollment.ts
│   │   │   └── tour.ts
│   │   ├── security/
│   │   │   ├── rateLimit.ts       # Rate limiting (in-memory)
│   │   │   └── logger.ts          # Structured logging
│   │   └── errors/
│   │       └── ApiError.ts        # Consistent error handling
│   ├── auth/
│   │   └── config.ts              # NextAuth configuration
│   ├── middleware.ts              # Security headers middleware
│   └── app/globals.css            # Global styles
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── seed.ts                    # Database seed script
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
├── next.config.ts
├── .env.example
└── .env.local
```

## Installation & Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Install Dependencies
```bash
cd daycare-app
npm install
```

### 2. Environment Variables
Copy `.env.example` to `.env.local` and fill in values:

```bash
# Generate a secure NEXTAUTH_SECRET
openssl rand -base64 32

# Update .env.local
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=postgresql://user:password@localhost:5432/daycare_db
```

### 3. Create Database & Run Migrations
```bash
# Create database (if using psql)
createdb daycare_db

# Run Prisma migrations
npm run prisma:migrate

# Seed sample data
npm run prisma:seed
```

### 4. Start Development Server
```bash
npm run dev
```

Visit `http://localhost:3000` to see the app.

## Test Credentials

After running `npm run prisma:seed`, use these credentials:

**Admin Account:**
- Email: `admin@ambassadorscare.com`
- Password: `AdminPassword123!`

**Parent Account:**
- Email: `parent@ambassadorscare.com`
- Password: `ParentPassword123!`

> Local/staging defaults only. Rotate these credentials and disable seeded accounts in production.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Create new parent account
- `POST /auth/signin` - NextAuth login (credentials)
- `GET /auth/signout` - Logout

### Children
- `POST /api/children` - Create child (auth required)
- `GET /api/children` - List children (auth required)
- `GET /api/children/[id]` - Get child details (auth required)
- `PATCH /api/children/[id]` - Update child (auth required)
- `DELETE /api/children/[id]` - Delete child (auth required)

### Enrollments
- `POST /api/enrollments` - Create enrollment (auth required)
- `GET /api/enrollments` - List parent's enrollments (auth required)
- `GET /api/admin/enrollments` - List all (admin only)
- `PATCH /api/admin/enrollments/[id]` - Update status (admin only)

### Public
- `POST /api/tour-request` - Submit tour request (rate limited)

## Database Schema

### Core Models
- **User**: Parents and admins with roles
- **Child**: Children with health/emergency info
- **EnrollmentApplication**: Program applications with status tracking
- **TourRequest**: Tour request submissions
- **StaffProfile**: Team member information
- **Testimonial**: Customer reviews
- **StripeCustomer**: Future payment integration

## Extending the Application

### Add Stripe Billing
1. Install Stripe SDK: `npm install stripe`
2. Add `STRIPE_SECRET_KEY` and `STRIPE_PUBLISHABLE_KEY` to `.env.local`
3. Create `/api/payments` endpoints
4. Use `StripeCustomer` model to track customers

### Enable Email Notifications
1. Install email provider (SendGrid, Mailgun, etc.)
2. Create email templates
3. Add notifications to:
   - `POST /api/auth/register` (welcome)
   - `POST /api/enrollments` (confirmation)
   - `PATCH /api/admin/enrollments/[id]` (status change)
   - `POST /api/tour-request` (admin notification)

### Upgrade Rate Limiting to Redis
Replace in-memory limiter with Redis:

```typescript
// src/lib/security/rateLimit.ts
import redis from 'redis';

const client = redis.createClient(process.env.REDIS_URL);

export async function isAllowed(id: string, limit: number, window: number) {
  const key = `rate:${id}`;
  const count = await client.incr(key);
  if (count === 1) await client.expire(key, Math.ceil(window / 1000));
  return count <= limit;
}
```

### Add 2FA/MFA
1. Install `speakeasy` for TOTP
2. Create `/api/auth/2fa/setup` and `/api/auth/2fa/verify`
3. Update login form to prompt for 2FA code
4. Store TOTP secret in User model

### Adding Admin Dashboard
1. Create `/app/admin/layout.tsx` with admin role check
2. Add pages for:
   - Enrollment management (`/admin/enrollments`)
   - Staff management (`/admin/staff`)
   - Tour requests (`/admin/tours`)
   - Analytics dashboard

## Performance Optimization

### Current
- ✅ Next.js Server Components for static content
- ✅ Image lazy loading placeholders
- ✅ CSS-in-JS with Tailwind (minimal)
- ✅ Database indexing on hot fields

### Future
- Add image optimization with `next/image`
- Implement ISR (Incremental Static Regeneration) for marketing pages
- Add SWR/React Query for client-side data fetching
- Enable API response caching with Redis
- Compress API responses with gzip

## Deployment

### Vercel (Recommended)
```bash
npm install -g vercel
vercel
```

### Self-Hosted
1. Build: `npm run build`
2. Start: `npm run start`
3. Use process manager like PM2:
   ```bash
   pm2 start "npm run start" --name daycare
   pm2 save
   ```

### Environment Variables (Production)
- Set `NEXTAUTH_SECRET` to a secure 32+ character string
- Set `NEXTAUTH_URL` to production domain
- Set `DATABASE_URL` to production PostgreSQL
- Set `NODE_ENV=production`
- Add any Stripe/email service credentials

## Testing

### Running Tests
```bash
# API route tests (add jest)
npm test

# E2E tests (add cypress or playwright)
npm run test:e2e
```

## Security Checklist

- [ ] Change all default passwords
- [ ] Set up HTTPS/SSL
- [ ] Enable database encryption
- [ ] Set all required environment variables
- [ ] Review and customize CSP headers
- [ ] Set up database backups
- [ ] Monitor auth logs for suspicious activity
- [ ] Update all dependencies regularly
- [ ] Enable rate limiting with Redis in production
- [ ] Set up email notifications
- [ ] Implement audit logging for admin actions
- [ ] Consider adding 2FA for admin accounts

## Contributing

This scaffold is meant to be a starting point. Customize as needed for your specific requirements.

## License

MIT

## Support

For questions or issues, reach out to: info@ambassadorscare.com

---

**Built with ❤️ for daycare providers and families**
