'use client';

import Link from 'next/link';
import { AnimatePresence, motion } from 'motion/react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { Clock3, MapPin, Menu, Phone, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { BRAND } from '@/lib/branding';
import { PUBLIC_NAV_ITEMS } from '@/lib/public-content';
import { buttonStyles } from '@/components/ui';
import { BrandLockup } from '@/components/brand';
import { cn } from '@/lib/utils';

function isActive(pathname: string, href: string) {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthed = Boolean(session?.user?.id);
  const role = session?.user?.role;

  const dashboardHref = role === 'ADMIN' ? '/admin' : '/dashboard';

  async function handleSignOut() {
    await signOut({ callbackUrl: '/' });
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#c7d2e2]/82 bg-[#f3f6fa]/92 backdrop-blur-xl">
      <div className="border-b border-[#1d3558] bg-[#0f1726]">
        <div className="tech-wrap flex flex-wrap items-center justify-between gap-3 py-2 text-xs font-medium text-[#d7e5ff] sm:text-sm">
          <div className="flex flex-wrap items-center gap-4">
            <a href={BRAND.phoneHref} className="inline-flex items-center gap-1.5 text-[#dbe8ff] transition hover:text-white">
              <Phone className="h-3.5 w-3.5" />
              {BRAND.phone}
            </a>
            <span className="hidden items-center gap-1.5 text-[#bfd0ef] lg:inline-flex">
              <MapPin className="h-3.5 w-3.5" />
              {BRAND.addressLine1}, {BRAND.addressLine2}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[#bfd0ef]">
            <Clock3 className="h-3.5 w-3.5" />
            {BRAND.hours}
          </span>
        </div>
      </div>

      <div className="tech-wrap flex items-center justify-between gap-3 py-4">
        <Link href="/" className="rounded-[7px] border border-transparent p-1 transition hover:border-[#c6d2e2] hover:bg-white/72" aria-label="Go to homepage">
          <BrandLockup compact={false} showTagline />
        </Link>

        <nav className="hidden items-center gap-1.5 xl:flex" aria-label="Primary">
          {PUBLIC_NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'inline-flex h-9 items-center border px-3 text-[0.79rem] font-semibold uppercase tracking-[0.13em] transition',
                'border-transparent text-[#30465f] hover:border-[#c5d3e7] hover:bg-white hover:text-[#0f1726]',
                isActive(pathname, item.href) &&
                  'border-[#9db9ec] bg-[#e9f0fb] text-[#0f4fc9] shadow-[inset_0_-2px_0_0_rgba(15,79,201,0.45)]',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-2 xl:flex">
          {status === 'loading' ? <span className="h-9 w-24 rounded-[6px] bg-[#d8e1ee]" /> : null}
          {isAuthed ? (
            <>
              <span className="inline-flex h-9 items-center gap-2 border border-[#c3d1e3] bg-white px-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#2d435d]">
                <UserRound className="h-4 w-4" />
                {session?.user?.name || 'Account'}
              </span>
              <Link href={dashboardHref} className={buttonStyles({ variant: 'outline', size: 'sm', className: 'rounded-[7px] px-4' })}>
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  void handleSignOut();
                }}
                className={buttonStyles({ variant: 'danger', size: 'sm', className: 'rounded-[7px] px-4' })}
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="inline-flex h-9 items-center px-2.5 text-xs font-semibold uppercase tracking-[0.13em] text-[#2d435d] transition hover:text-[#0f1726]">
                Sign In
              </Link>
              <Link href="/contact" className={buttonStyles({ variant: 'outline', size: 'sm', className: 'rounded-[7px] px-4' })}>
                Contact Admissions
              </Link>
              <Link href="/register" className={buttonStyles({ variant: 'primary', size: 'sm', className: 'rounded-[7px] px-4' })}>
                Start Enrollment
              </Link>
            </>
          )}
        </div>

        <button
          className={buttonStyles({
            variant: 'outline',
            size: 'icon',
            className: 'rounded-[7px] border-[#c3d1e3] bg-white text-[#23384f] xl:hidden',
          })}
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -16, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -14, height: 0 }}
            transition={{ duration: 0.34, ease: [0.2, 0.8, 0.2, 1] }}
            className="overflow-hidden border-t border-[#c7d2e2] bg-[#f6f9fc] xl:hidden"
          >
            <div className="tech-wrap grid gap-2 py-3">
              {PUBLIC_NAV_ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'inline-flex h-11 items-center justify-between border px-4 text-sm font-semibold uppercase tracking-[0.12em] transition',
                    'border-[#c5d3e7] bg-white text-[#2d435d] hover:border-[#9db9ec] hover:text-[#0f1726]',
                    isActive(pathname, item.href) && 'border-[#9db9ec] bg-[#e9f0fb] text-[#0f4fc9]',
                  )}
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-1 grid gap-2 border-t border-[#cdd8e8] pt-3">
                {isAuthed ? (
                  <>
                    <Link href={dashboardHref} className={buttonStyles({ variant: 'outline', fullWidth: true, className: 'rounded-[7px]' })}>
                      Dashboard
                    </Link>
                    <button
                      type="button"
                      className={buttonStyles({ variant: 'danger', fullWidth: true, className: 'rounded-[7px]' })}
                      onClick={() => {
                        void handleSignOut();
                      }}
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className={buttonStyles({ variant: 'ghost', fullWidth: true, className: 'rounded-[7px]' })}>
                      Sign In
                    </Link>
                    <Link href="/contact" className={buttonStyles({ variant: 'outline', fullWidth: true, className: 'rounded-[7px]' })}>
                      Contact Admissions
                    </Link>
                    <Link href="/register" className={buttonStyles({ variant: 'primary', fullWidth: true, className: 'rounded-[7px]' })}>
                      Start Enrollment
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
