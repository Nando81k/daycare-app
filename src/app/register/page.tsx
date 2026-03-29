import Image from 'next/image';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { FileCheck2, House, ShieldCheck, Sparkles, UserRoundPlus, WalletCards } from 'lucide-react';
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
    <div className="tech-auth-surface min-h-screen">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">
        <section className="relative isolate flex items-center border-b border-[#33557f] bg-[linear-gradient(160deg,#0c1a30_0%,#122c50_52%,#1a3e6f_100%)] px-6 py-8 text-white sm:px-10 lg:border-b-0 lg:border-r lg:px-14 lg:py-12">
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(119,146,184,0.2)_1px,transparent_1px),linear-gradient(rgba(119,146,184,0.16)_1px,transparent_1px)] bg-[length:52px_52px]" />
          <div className="relative z-10 w-full max-w-2xl">
            <CinematicReveal>
              <div className="flex items-center gap-3">
                <BrandMark className="border-[#7fa8de] bg-[#e7f0ff] shadow-none" size={30} />
                <div>
                  <p className="font-display text-lg font-semibold text-white">{BRAND.name}</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-[#b9cff1]">Enrollment Intake</p>
                </div>
              </div>

              <p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-[#9ec2ff]">Create Parent Account</p>
              <h1 className="mt-3 max-w-[15ch] text-3xl font-semibold leading-[1.04] text-white sm:text-4xl lg:text-5xl">
                Start enrollment with a clear guided workflow.
              </h1>
              <p className="mt-4 max-w-[56ch] text-base leading-relaxed text-[#d5e5ff]">
                Build your family profile, submit child details, and track admissions status in one structured platform.
              </p>
            </CinematicReveal>

            <CinematicStagger className="mt-7 grid gap-3 sm:grid-cols-2" y={18}>
              <article className="tech-auth-feature px-3.5 py-3" data-stagger-item>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <UserRoundPlus className="h-4 w-4 text-[#a9c7ff]" />
                  Guided account setup
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#c8daf8]">Simple step-by-step registration and profile capture.</p>
              </article>
              <article className="tech-auth-feature px-3.5 py-3" data-stagger-item>
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-white">
                  <FileCheck2 className="h-4 w-4 text-[#a9c7ff]" />
                  Admissions-ready details
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#c8daf8]">Submit required child and contact information once.</p>
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
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#1f5ab2]">Start Enrollment</p>
                <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#4a607a] hover:text-[#0f1726]">
                  <House className="h-3.5 w-3.5" />
                  Home
                </Link>
              </div>
              <h2 className="mt-2 text-[2rem] font-semibold text-[#0f1726] sm:text-[2.2rem]">Create Account</h2>
              <p className="mt-2 text-base leading-relaxed text-[#33485f]">Parent onboarding in a few clear steps.</p>
            </CinematicReveal>

            <div className="mt-6">
              <RegisterForm />
            </div>

            <CinematicReveal delay={0.1}>
              <div className="mt-6 border-t border-[#c7d3e6] pt-4 text-sm text-[#41556f]">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-[#0f4fc9] hover:text-[#0b3d9e]">
                  Sign in
                </Link>
                <div>
                  <Link href="/contact" className={buttonStyles({ variant: 'link', className: 'mt-1 h-auto px-0 py-0 text-sm text-[#0f4fc9]' })}>
                    Contact admissions
                  </Link>
                </div>
              </div>

              <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-[#4a607a]">
                <ShieldCheck className="h-3.5 w-3.5 text-[#0f4fc9]" />
                Secure account creation
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#4a607a]">
                <WalletCards className="h-3.5 w-3.5 text-[#0f4fc9]" />
                Billing setup follows after admissions approval
              </p>
              <p className="mt-1 inline-flex items-center gap-1.5 text-xs font-medium text-[#4a607a]">
                <Sparkles className="h-3.5 w-3.5 text-[#0f4fc9]" />
                Designed for clear parent experience
              </p>
            </CinematicReveal>
          </div>
        </section>
      </div>
    </div>
  );
}
