'use client';

import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { Clock3, MapPin, Menu, Phone, UserRound, X } from 'lucide-react';
import { useState } from 'react';
import { BRAND } from '@/lib/branding';
import { buttonStyles } from '@/components/ui';
import { BrandLockup } from '@/components/brand';

export function Header() {
  const [open, setOpen] = useState(false);
  const { data: session, status } = useSession();
  const isAuthed = Boolean(session?.user?.id);
  const role = session?.user?.role;

  const dashboardHref = role === 'ADMIN' ? '/admin' : '/dashboard';

  async function handleSignOut() {
    await signOut({ callbackUrl: '/' });
  }

  return (
    <header className="public-header">
      <div className="public-header-top">
        <div className="page-wrap flex flex-wrap items-center justify-between gap-3 py-1.5 text-xs text-white/92 sm:text-sm">
          <div className="flex items-center gap-4">
            <a href={BRAND.phoneHref} className="inline-flex items-center gap-1.5 text-white/92 hover:text-white">
              <Phone className="h-3.5 w-3.5" />
              {BRAND.phone}
            </a>
            <span className="hidden items-center gap-1.5 text-white/85 sm:inline-flex">
              <MapPin className="h-3.5 w-3.5" />
              {BRAND.addressLine1}, {BRAND.addressLine2}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 text-white/85">
            <Clock3 className="h-3.5 w-3.5" />
            {BRAND.hours}
          </span>
        </div>
      </div>

      <div className="page-wrap py-3.5">
        <div className="flex items-center justify-between gap-3">
          <Link href="/" className="public-header-brand">
            <BrandLockup />
          </Link>

          <div className="hidden items-center gap-2 lg:flex">
            {status === 'loading' ? <span className="h-9 w-24 rounded-full bg-ink-100" /> : null}
            {isAuthed ? (
              <>
                <span className="public-header-account">
                  <UserRound className="h-4 w-4" />
                  {session?.user?.name || 'Account'}
                </span>
                <Link href={dashboardHref} className={buttonStyles({ variant: 'outline', size: 'sm' })}>
                  Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    void handleSignOut();
                  }}
                  className={buttonStyles({ variant: 'danger', size: 'sm' })}
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className={buttonStyles({ variant: 'ghost', size: 'sm', className: 'bg-transparent' })}>
                  Login
                </Link>
                <Link href="/register" className={buttonStyles({ variant: 'primary', size: 'sm' })}>
                  Start Enrollment
                </Link>
              </>
            )}
          </div>

          <button
            className={buttonStyles({
              variant: 'ghost',
              size: 'icon',
              className: 'border border-primary-200/80 bg-white/95 text-ink-700 shadow-sm lg:hidden',
            })}
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="public-header-mobile border-t border-primary-100/75 lg:hidden">
          <div className="page-wrap grid gap-2 py-3">
            <div className="mt-1 grid gap-2">
              {isAuthed ? (
                <>
                  <Link href={dashboardHref} className={buttonStyles({ variant: 'outline', fullWidth: true })}>
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    className={buttonStyles({ variant: 'danger', fullWidth: true })}
                    onClick={() => {
                      void handleSignOut();
                    }}
                  >
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className={buttonStyles({ variant: 'outline', fullWidth: true })}>
                    Login
                  </Link>
                  <Link href="/register" className={buttonStyles({ variant: 'primary', fullWidth: true })}>
                    Start Enrollment
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
