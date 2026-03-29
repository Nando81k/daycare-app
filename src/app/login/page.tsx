import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { House, ShieldCheck, Sparkles, WalletCards, Workflow } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { LoginForm } from '@/components/LoginForm';
import { buttonStyles } from '@/components/ui';
import { getSessionUser } from '@/lib/auth';
import { BRAND } from '@/lib/branding';
import { CinematicReveal, CinematicStagger } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

export const dynamic = 'force-dynamic';

const PANEL_MEDIA = resolveCustomerMediaSlot('loginPanel');

export default async function LoginPage() {
  const user = await getSessionUser();

  if (user) {
    redirect(user.role === 'ADMIN' ? '/admin' : '/dashboard');
  }

  return (
    <div className="tech-auth-surface min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative isolate flex items-center border-b border-[#33557f] bg-[linear-gradient(158deg,#0d1b31_0%,#132d52_54%,#1b3f71_100%)] px-6 py-8 text-white sm:px-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(119,146,184,0.2)_1px,transparent_1px),linear-gradient(rgba(119,146,184,0.16)_1px,transparent_1px)] bg-[length:52px_52px]" />
          <div className="relative z-10 w-full max-w-2xl">
            <CinematicReveal>
              <div className="flex items-center gap-3">
                <BrandMark className="border-[#7fa8de] bg-[#e7f0ff] shadow-none" size={30} />
                <div>
                  <p className="font-display text-lg font-semibold text-white">{BRAND.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#b9cff1]">Family Portal</p>
                </div>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#9ec2ff]">Secure Parent Access</p>
              <h1 className="mt-3 max-w-[15ch] text-3xl font-semibold leading-[1.04] text-white sm:text-4xl lg:text-5xl">
                Sign in to manage enrollment and tuition.
              </h1>
              <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-[#d5e5ff]">
                Access admissions status, child records, and payment visibility from a single secure account.
              </p>
            </CinematicReveal>

            <CinematicStagger className="mt-7 grid gap-3 sm:grid-cols-2" y={18}>
              <article className="tech-auth-feature px-3.5 py-3" data-stagger-item>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <ShieldCheck className="h-4 w-4 text-[#a9c7ff]" />
                  Protected account sessions
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#c8daf8]">Designed for secure family records access.</p>
              </article>
              <article className="tech-auth-feature px-3.5 py-3" data-stagger-item>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <WalletCards className="h-4 w-4 text-[#a9c7ff]" />
                  Tuition visibility
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#c8daf8]">Review due invoices and billing updates quickly.</p>
              </article>
            </CinematicStagger>

            <CinematicReveal delay={0.16}>
              <div className="tech-image-shell mt-6 aspect-[16/9] border-[#5c83ba]">
                <Image
                  src={PANEL_MEDIA.media.src}
                  alt={PANEL_MEDIA.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: PANEL_MEDIA.media.focalPoint }}
                  sizes={PANEL_MEDIA.sizes}
                />
                <div className="tech-image-overlay" />
              </div>
            </CinematicReveal>
          </div>
        </section>

        <section className="flex items-center justify-center px-6 py-8 sm:px-10 lg:px-14 lg:py-12">
          <div className="tech-auth-panel w-full max-w-[34rem] p-6 sm:p-8">
            <CinematicReveal>
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1f5ab2]">Sign In</p>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#4a607a] hover:text-[#0f1726]">
                  <House className="h-3.5 w-3.5" />
                  Home
                </Link>
              </div>
              <h2 className="mt-2 text-[2rem] font-semibold text-[#0f1726] sm:text-[2.2rem]">Welcome Back</h2>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">Secure access for parents and administrators.</p>
            </CinematicReveal>

            <div className="mt-6">
              <LoginForm />
            </div>

            <CinematicReveal delay={0.1}>
              <div className="mt-6 border-t border-[#c7d3e6] pt-4 text-sm text-[#41556f]">
                Need an account?{' '}
                <Link href="/register" className="font-semibold text-[#0f4fc9] hover:text-[#0b3d9e]">
                  Create one
                </Link>
                <div>
                  <Link href="/contact" className={buttonStyles({ variant: 'link', className: 'mt-1 h-auto px-0 py-0 text-sm text-[#0f4fc9]' })}>
                    Contact admissions
                  </Link>
                </div>
              </div>

              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#4a607a]">
                <Workflow className="h-3.5 w-3.5 text-[#0f4fc9]" />
                Structured onboarding and billing workflow
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#4a607a]">
                <Sparkles className="h-3.5 w-3.5 text-[#0f4fc9]" />
                High-trust parent experience
              </p>
            </CinematicReveal>
          </div>
        </section>
      </div>
    </div>
  );
}
