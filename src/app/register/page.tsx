import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { CreditCard, FileCheck2, House, Sparkles, UserRoundPlus } from 'lucide-react';
import { BrandMark } from '@/components/brand/BrandMark';
import { RegisterForm } from '@/components/RegisterForm';
import { buttonStyles } from '@/components/ui';
import { getSessionUser } from '@/lib/auth';
import { BRAND } from '@/lib/branding';
import { CinematicReveal, CinematicStagger } from '@/components/animations';
import { resolveCustomerMediaSlot } from '@/lib/public-media';

export const dynamic = 'force-dynamic';

const PANEL_MEDIA = resolveCustomerMediaSlot('registerPanel');

export default async function RegisterPage() {
  const user = await getSessionUser();

  if (user) {
    redirect(user.role === 'ADMIN' ? '/admin' : '/dashboard');
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="grid min-h-screen lg:grid-cols-2">
        <section className="relative isolate flex items-center border-b border-white/15 bg-primary-900 px-6 py-8 text-white sm:px-10 sm:py-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-primary-300/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 right-10 h-48 w-48 rounded-full bg-teal-300/24 blur-3xl" />
          <div className="relative z-10 w-full max-w-2xl">
            <CinematicReveal>
              <div className="flex items-center gap-3">
                <BrandMark className="border-white/25 bg-white/95 shadow-none" size={30} />
                <div>
                  <p className="font-display text-lg font-semibold text-white">{BRAND.name}</p>
                  <p className="text-xs text-primary-100">{BRAND.tagline}</p>
                </div>
              </div>

              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-teal-100">Start Enrollment</p>
              <h1 className="mt-3 max-w-[15ch] text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
                Create your family account in minutes.
              </h1>
              <p className="mt-4 max-w-[54ch] text-base text-[#dff6ff]">
                Set up your profile, add child details, and move through admissions with clear next steps.
              </p>
            </CinematicReveal>

            <CinematicStagger className="mt-6 grid gap-3 sm:grid-cols-2">
              <article className="rounded-field border border-white/24 bg-white/10 px-3.5 py-3" data-stagger-item>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <UserRoundPlus className="h-4 w-4" />
                  Guided onboarding
                </p>
                <p className="mt-1 text-xs text-[#d9ecff]">Simple setup with clear milestones.</p>
              </article>
              <article className="rounded-field border border-white/24 bg-white/10 px-3.5 py-3" data-stagger-item>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <FileCheck2 className="h-4 w-4" />
                  Enrollment ready
                </p>
                <p className="mt-1 text-xs text-[#d9ecff]">Complete child and intake details in one place.</p>
              </article>
            </CinematicStagger>

            <CinematicReveal delay={0.2}>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/24 bg-white/12 px-3 py-1.5 text-xs text-teal-100">
                <CreditCard className="h-3.5 w-3.5" />
                Secure billing and payment tracking
              </div>
            </CinematicReveal>

            <CinematicReveal delay={0.26}>
              <div className="public-image-frame mt-5 aspect-[16/9] border-white/30">
                <Image
                  src={PANEL_MEDIA.media.src}
                  alt={PANEL_MEDIA.media.alt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: PANEL_MEDIA.media.focalPoint }}
                  sizes={PANEL_MEDIA.sizes}
                />
                <div className="public-image-overlay" />
              </div>
            </CinematicReveal>
          </div>
        </section>

        <section className="relative flex items-center justify-center bg-[#eef5ff] px-6 py-8 sm:px-10 sm:py-10 lg:px-14 lg:py-12">
          <div className="w-full max-w-[31rem]">
            <CinematicReveal>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-primary-700">Start Enrollment</p>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-500 hover:text-ink-800">
                  <House className="h-3.5 w-3.5" />
                  Home
                </Link>
              </div>
              <h2 className="mt-2 text-3xl font-semibold text-ink-900 sm:text-[2.1rem]">Create Account</h2>
              <p className="mt-2 text-base text-ink-600">Parent onboarding in a few simple steps.</p>
            </CinematicReveal>

            <div className="mt-5">
              <RegisterForm />
            </div>

            <CinematicReveal delay={0.1}>
              <div className="mt-5 border-t border-line pt-4 text-sm text-ink-600">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary-700 hover:text-primary-800">
                  Sign in
                </Link>
                <div>
                  <Link href="/contact" className={buttonStyles({ variant: 'link', className: 'mt-1 h-auto px-0 py-0 text-sm' })}>
                    Contact admissions
                  </Link>
                </div>
              </div>

              <p className="mt-3 inline-flex items-center gap-1.5 text-xs text-ink-500">
                <Sparkles className="h-3.5 w-3.5 text-primary-700" />
                Secure signup with password-strength guidance
              </p>
            </CinematicReveal>
          </div>
        </section>
      </div>
    </div>
  );
}
