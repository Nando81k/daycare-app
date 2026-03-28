'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { signOut } from 'next-auth/react';
import {
  BarChart3,
  BellRing,
  CircleHelp,
  ClipboardList,
  CreditCard,
  Home,
  LogOut,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  UserRound,
  Users,
  X,
} from 'lucide-react';
import type { AdminRole } from '@prisma/client';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { BrandMark } from '@/components/brand';
import { buttonStyles } from '@/components/ui';
import { cn } from '@/lib/utils';
import { OnboardingOverlay, useOnboarding } from '@/components/onboarding';
import { getScopeSteps, type TutorialScope } from '@/lib/onboarding/definitions';
import { isUiRevampEnabled } from '@/lib/ui-revamp';

const ICONS = {
  overview: Home,
  admissions: ClipboardList,
  families: Users,
  billing: CreditCard,
  family: UserRound,
  analytics: BarChart3,
  notifications: BellRing,
  help: CircleHelp,
} as const;

export interface ShellItem {
  href: string;
  label: string;
  icon: keyof typeof ICONS;
  badgeCount?: number;
  badgeTone?: 'default' | 'warning' | 'danger' | 'success';
}

interface AppShellProps {
  title: string;
  subtitle?: string;
  items: ShellItem[];
  primaryAction?: { href: string; label: string };
  mode?: 'rail' | 'horizontal';
  showHomeButton?: boolean;
  showSignOutButton?: boolean;
  onboardingScope?: TutorialScope;
  onboardingEnabled?: boolean;
  onboardingAdminRole?: AdminRole | null;
  children: React.ReactNode;
}

function isActive(pathname: string, href: string) {
  if (href === '/admin' || href === '/dashboard') return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

function routeMatches(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function formatBadgeCount(count: number) {
  if (count > 99) return '99+';
  return String(count);
}

export function AppShell({
  title,
  subtitle,
  items,
  primaryAction,
  showHomeButton = false,
  showSignOutButton = false,
  onboardingScope,
  onboardingEnabled = true,
  onboardingAdminRole = null,
  children,
}: AppShellProps) {
  const revampEnabled = isUiRevampEnabled('foundation');
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const tutorialAction = searchParams.get('tutorial');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [liveBadgeCounts, setLiveBadgeCounts] = useState<Record<string, number>>({});
  const lastTutorialAutoOpenPathRef = useRef<string | null>(null);
  const handledTutorialActionRef = useRef<string | null>(null);
  const onboardingSteps = useMemo(
    () => (onboardingScope ? getScopeSteps(onboardingScope, onboardingAdminRole) : []),
    [onboardingAdminRole, onboardingScope],
  );
  const itemHrefSet = useMemo(() => new Set(items.map((item) => item.href)), [items]);
  const onboarding = useOnboarding({
    scope: onboardingScope,
    enabled: onboardingEnabled && onboardingSteps.length > 0,
    steps: onboardingSteps,
    mode: 'overlay',
  });
  const openTutorialFromStart = onboarding.openFromStart;
  const onboardingLoading = onboarding.loading;
  const onboardingCurrentStep = onboarding.currentStep;
  const setOnboardingOpen = onboarding.setIsOpen;
  const restartOnboarding = onboarding.restart;
  const onboardingIsOpen = onboarding.isOpen;
  const onboardingStepIndex = onboarding.stepIndex;
  const onboardingTotalSteps = onboarding.totalSteps;
  const onboardingIsLastStep = onboarding.isLastStep;
  const onboardingSaving = onboarding.saving;
  const onboardingError = onboarding.error;
  const goToPreviousOnboardingStep = onboarding.back;
  const goToNextOnboardingStep = onboarding.next;
  const skipOnboarding = onboarding.skip;

  useEffect(() => {
    const value = window.localStorage.getItem('ac-shell-collapsed');
    setCollapsed(value === '1');
  }, []);

  useEffect(() => {
    window.localStorage.setItem('ac-shell-collapsed', collapsed ? '1' : '0');
  }, [collapsed]);

  useEffect(() => {
    if (!onboardingScope || !onboardingSteps.length) return;
    const tutorialRoute = onboardingScope === 'ADMIN_DASHBOARD' ? '/admin/tutorial' : '/dashboard/tutorial';
    if (pathname !== tutorialRoute) {
      handledTutorialActionRef.current = null;
      return;
    }

    if (onboardingScope === 'ADMIN_DASHBOARD') {
      if (!tutorialAction || onboardingLoading) return;

      const actionKey = `${pathname}?tutorial=${tutorialAction}`;
      if (handledTutorialActionRef.current === actionKey) return;
      handledTutorialActionRef.current = actionKey;

      if (tutorialAction === 'continue') {
        if (!onboardingCurrentStep) {
          void openTutorialFromStart();
          return;
        }

        setOnboardingOpen(true);
        if (!routeMatches(pathname, onboardingCurrentStep.route)) {
          router.push(onboardingCurrentStep.route);
        }
        return;
      }

      if (tutorialAction === 'restart') {
        void restartOnboarding();
        return;
      }

      if (tutorialAction === 'start') {
        void openTutorialFromStart();
      }
      return;
    }

    if (lastTutorialAutoOpenPathRef.current === pathname) return;
    lastTutorialAutoOpenPathRef.current = pathname;
    void openTutorialFromStart();
  }, [
    onboardingCurrentStep,
    onboardingLoading,
    onboardingScope,
    onboardingSteps.length,
    openTutorialFromStart,
    pathname,
    restartOnboarding,
    router,
    setOnboardingOpen,
    tutorialAction,
  ]);

  async function handleSignOut() {
    await signOut({ callbackUrl: '/' });
  }

  const shellScope = pathname.startsWith('/admin')
    ? 'admin'
    : pathname.startsWith('/dashboard')
      ? 'parent'
      : 'unknown';

  const refreshLiveBadges = useCallback(async () => {
    const next: Record<string, number> = {};

    try {
      if (shellScope === 'parent') {
        if (itemHrefSet.has('/dashboard/notifications')) {
          const notificationsRes = await fetch('/api/v3/parent/notifications?status=UNREAD&limit=1', { cache: 'no-store' });
          if (notificationsRes.ok) {
            const payload = (await notificationsRes.json().catch(() => null)) as
              | { counts?: { unread?: number } }
              | null;
            next['/dashboard/notifications'] = Math.max(0, payload?.counts?.unread || 0);
          }
        }

        if (itemHrefSet.has('/dashboard/billing')) {
          const billingRes = await fetch('/api/v3/parent/billing/summary', { cache: 'no-store' });
          if (billingRes.ok) {
            const payload = (await billingRes.json().catch(() => null)) as
              | { openInvoices?: number; pastDueInvoices?: number }
              | null;
            next['/dashboard/billing'] = Math.max(
              0,
              (payload?.openInvoices || 0) + (payload?.pastDueInvoices || 0),
            );
          }
        }
      }

      if (shellScope === 'admin' && itemHrefSet.has('/admin/billing')) {
        const billingRes = await fetch('/api/v3/admin/billing/overview', { cache: 'no-store' });

        if (billingRes.ok) {
          const payload = (await billingRes.json().catch(() => null)) as
            | { metrics?: { openInvoices?: number; pastDueInvoices?: number } }
            | null;
          next['/admin/billing'] = Math.max(
            0,
            (payload?.metrics?.openInvoices || 0) + (payload?.metrics?.pastDueInvoices || 0),
          );
        }
      }
    } catch {
      return;
    }

    setLiveBadgeCounts((previous) => {
      const previousKeys = Object.keys(previous);
      const nextKeys = Object.keys(next);
      if (previousKeys.length === nextKeys.length && nextKeys.every((key) => previous[key] === next[key])) {
        return previous;
      }
      return next;
    });
  }, [itemHrefSet, shellScope]);

  useEffect(() => {
    void refreshLiveBadges();

    const intervalId = window.setInterval(() => {
      void refreshLiveBadges();
    }, 30000);

    const onFocus = () => {
      void refreshLiveBadges();
    };
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        void refreshLiveBadges();
      }
    };
    const onRefreshRequest = () => {
      void refreshLiveBadges();
    };

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('ac:sidebar-counts-refresh', onRefreshRequest);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('ac:sidebar-counts-refresh', onRefreshRequest);
    };
  }, [pathname, refreshLiveBadges]);

  const navItemBaseClass = cn(
    'group relative flex items-center gap-3 rounded-[12px] border border-transparent px-3 py-2.5 text-sm font-semibold tracking-[0.01em] text-white/90 transition-colors duration-180 ease-fluid',
    'hover:border-primary-300/70 hover:bg-primary-600 hover:text-white',
    'focus-visible:border-teal-300 focus-visible:bg-primary-600 focus-visible:text-white',
    revampEnabled && 'text-[0.93rem]',
  );
  const navItemActiveClass =
    'border-primary-200/90 bg-primary-500 text-white shadow-[0_14px_24px_-18px_rgba(3,42,92,0.9)]';
  const navItemIconClass =
    'relative inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-white/15 bg-white/8 text-white/85 transition-colors duration-180 group-hover:border-white/40 group-hover:bg-white/18 group-hover:text-white';
  const railUtilityItemClass =
    'flex items-center gap-3 rounded-[12px] border border-white/25 px-3 py-2.5 text-sm font-semibold text-white/90 transition-colors duration-180 ease-fluid hover:border-primary-300/70 hover:bg-primary-600 hover:text-white';

  return (
    <div className="shell">
      <div className={cn('shell-layout', collapsed && 'shell-layout-collapsed', revampEnabled && 'bg-transparent')}>
        <aside
          className={cn(
            'shell-rail',
            collapsed && 'px-2',
            revampEnabled &&
              'border-primary-700/70 bg-[#0b2e53] shadow-[0_34px_68px_-42px_rgba(2,31,71,0.95)]',
          )}
        >
          <div
            className={cn(
              'flex items-center justify-between gap-2 border-b border-white/15 pb-4',
              collapsed && 'justify-center',
            )}
          >
            <div className="min-w-0">
              <BrandMark />
              {!collapsed ? (
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/65">
                  Ambassadors Care
                </p>
              ) : null}
            </div>
          </div>

          {!collapsed ? (
            <p className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Navigation</p>
          ) : null}

          <nav className={cn('space-y-1.5 overflow-y-auto pr-1', collapsed ? 'mt-4' : 'mt-2')} data-tour-id="shell-nav">
            {items.map((item) => {
              const Icon = ICONS[item.icon];
              const active = isActive(pathname, item.href);
              const badgeCount = liveBadgeCounts[item.href] ?? Math.max(0, item.badgeCount || 0);
              const showBadge = badgeCount > 0;
              const badgeTone = item.badgeTone ?? (item.href.includes('notifications') ? 'warning' : item.href.includes('billing') ? 'danger' : 'default');

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    navItemBaseClass,
                    collapsed && 'justify-center px-0',
                    active && navItemActiveClass,
                  )}
                >
                  <span
                    className={cn(
                      'absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-teal-300 transition-opacity duration-180',
                      active ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <span className={cn(navItemIconClass, active && 'border-white/45 bg-white/20 text-white')}>
                    <Icon className="h-4 w-4 shrink-0" />
                    {collapsed && showBadge ? (
                      <span
                        className={cn(
                          'absolute -right-1.5 -top-1.5 inline-flex min-w-[1rem] items-center justify-center rounded-full border px-1 text-[10px] font-semibold leading-none',
                          badgeTone === 'warning' && 'border-amber-200 bg-amber-300 text-amber-950',
                          badgeTone === 'danger' && 'border-rose-200 bg-rose-300 text-rose-950',
                          badgeTone === 'success' && 'border-emerald-200 bg-emerald-300 text-emerald-950',
                          badgeTone === 'default' && 'border-sky-200 bg-sky-300 text-sky-950',
                        )}
                      >
                        {formatBadgeCount(badgeCount)}
                      </span>
                    ) : null}
                  </span>
                  {!collapsed ? (
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="truncate">{item.label}</span>
                      {showBadge ? (
                        <span
                          className={cn(
                            'inline-flex min-w-[1.2rem] items-center justify-center rounded-full border px-1.5 py-0.5 text-[11px] font-semibold leading-none',
                            badgeTone === 'warning' && 'border-amber-200 bg-amber-300 text-amber-950',
                            badgeTone === 'danger' && 'border-rose-200 bg-rose-300 text-rose-950',
                            badgeTone === 'success' && 'border-emerald-200 bg-emerald-300 text-emerald-950',
                            badgeTone === 'default' && 'border-sky-200 bg-sky-300 text-sky-950',
                          )}
                        >
                          {formatBadgeCount(badgeCount)}
                        </span>
                      ) : null}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          <div className="mt-auto space-y-1.5 border-t border-white/15 pt-3">
            <button
              type="button"
              onClick={() => setCollapsed((prev) => !prev)}
              title={collapsed ? 'Expand navigation' : undefined}
              className={cn(
                'hidden w-full lg:flex',
                railUtilityItemClass,
                collapsed && 'justify-center px-0',
              )}
              aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
            >
              <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-white/15 bg-white/8 text-white/90">
                {collapsed ? <PanelLeftOpen className="h-4 w-4 shrink-0" /> : <PanelLeftClose className="h-4 w-4 shrink-0" />}
              </span>
              {!collapsed ? <span>Collapse</span> : null}
            </button>

            {showHomeButton ? (
              <Link
                href="/"
                title={collapsed ? 'Home' : undefined}
                className={cn(
                  railUtilityItemClass,
                  'border-transparent',
                  collapsed && 'justify-center px-0',
                )}
                data-tour-id="shell-home-button"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-white/15 bg-white/8 text-white/90">
                  <Home className="h-4 w-4 shrink-0" />
                </span>
                {!collapsed ? <span>Home</span> : null}
              </Link>
            ) : null}

            {showSignOutButton ? (
              <button
                type="button"
                onClick={() => {
                  void handleSignOut();
                }}
                title={collapsed ? 'Sign out' : undefined}
                className={cn(
                  'flex w-full items-center gap-3 rounded-[12px] border border-rose-300/60 bg-rose-500/25 px-3 py-2.5 text-sm font-semibold text-rose-50 transition-colors duration-180 ease-fluid hover:border-rose-200 hover:bg-rose-500/36 hover:text-white',
                  collapsed && 'justify-center px-0',
                )}
                data-tour-id="shell-signout-button"
              >
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-rose-200/45 bg-rose-100/15 text-rose-50">
                  <LogOut className="h-4 w-4 shrink-0" />
                </span>
                {!collapsed ? <span>Sign out</span> : null}
              </button>
            ) : null}
          </div>
        </aside>

        <div className="shell-main-column min-w-0">
          <header
            className={cn(
              'shell-topbar',
              revampEnabled &&
                'border-white/80 bg-white/90 shadow-[0_16px_32px_-24px_rgba(10,48,90,0.45)]',
            )}
          >
            <div className="flex min-w-0 items-start gap-3" data-tour-id="shell-topbar">
              <button
                type="button"
                className={buttonStyles({ variant: 'outline', size: 'icon', className: 'lg:hidden' })}
                onClick={() => setMobileOpen(true)}
                aria-label="Open navigation"
              >
                <Menu className="h-4 w-4" />
              </button>
              <div className="min-w-0">
                <p className="kicker">Dashboard Workspace</p>
                <h1
                  className={cn(
                    'truncate font-sans text-[1.22rem] font-semibold tracking-tight text-ink-900',
                    revampEnabled && 'text-[1.28rem]',
                  )}
                >
                  {title}
                </h1>
                {subtitle ? <p className="text-sm leading-relaxed text-ink-500">{subtitle}</p> : null}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onboardingScope && onboardingSteps.length ? (
                <button
                  type="button"
                  className={buttonStyles({ variant: 'outline', size: 'sm' })}
                  onClick={() => {
                    void openTutorialFromStart();
                  }}
                >
                  Tutorial
                </button>
              ) : null}
              {primaryAction ? (
                <Link
                  href={primaryAction.href}
                  className={buttonStyles({ variant: 'primary', size: 'sm' })}
                  data-tour-id="shell-primary-action"
                >
                  {primaryAction.label}
                </Link>
              ) : null}
            </div>
          </header>

          <main className="shell-canvas" data-tour-id="shell-main">
            <div className="shell-content-wrap">{children}</div>
          </main>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[55] bg-ink-900/40 lg:hidden" onClick={() => setMobileOpen(false)}>
          <aside
            className="glass-strong fixed inset-y-0 left-0 z-[56] w-[18.5rem] border-r border-primary-700/75 bg-[#0b2e53] p-3 text-white shadow-float"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/15 pb-4">
              <BrandMark />
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">Navigation</p>
            <nav className="mt-2 space-y-1.5">
              {items.map((item) => {
                const Icon = ICONS[item.icon];
                const active = isActive(pathname, item.href);
                const badgeCount = liveBadgeCounts[item.href] ?? Math.max(0, item.badgeCount || 0);
                const showBadge = badgeCount > 0;
                const badgeTone = item.badgeTone ?? (item.href.includes('notifications') ? 'warning' : item.href.includes('billing') ? 'danger' : 'default');
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      navItemBaseClass,
                      'justify-between',
                      active && navItemActiveClass,
                    )}
                  >
                    <span
                      className={cn(
                        navItemIconClass,
                        active && 'border-white/45 bg-white/20 text-white',
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="flex min-w-0 flex-1 items-center justify-between gap-2">
                      <span className="truncate">{item.label}</span>
                      {showBadge ? (
                        <span
                          className={cn(
                            'inline-flex min-w-[1.2rem] items-center justify-center rounded-full border px-1.5 py-0.5 text-[11px] font-semibold leading-none',
                            badgeTone === 'warning' && 'border-amber-200 bg-amber-300 text-amber-950',
                            badgeTone === 'danger' && 'border-rose-200 bg-rose-300 text-rose-950',
                            badgeTone === 'success' && 'border-emerald-200 bg-emerald-300 text-emerald-950',
                            badgeTone === 'default' && 'border-sky-200 bg-sky-300 text-sky-950',
                          )}
                        >
                          {formatBadgeCount(badgeCount)}
                        </span>
                      ) : null}
                    </span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-3 space-y-1.5 border-t border-white/15 pt-3">
              {showHomeButton ? (
                <Link
                  href="/"
                  onClick={() => setMobileOpen(false)}
                  className={cn(railUtilityItemClass, 'border-transparent')}
                  data-tour-id="shell-home-button"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-white/15 bg-white/8 text-white/90">
                    <Home className="h-4 w-4" />
                  </span>
                  Home
                </Link>
              ) : null}

              {showSignOutButton ? (
                <button
                  type="button"
                  onClick={() => {
                    void handleSignOut();
                  }}
                  className="flex w-full items-center gap-3 rounded-[12px] border border-rose-300/60 bg-rose-500/25 px-3 py-2.5 text-sm font-semibold text-rose-50 transition-colors duration-180 ease-fluid hover:border-rose-200 hover:bg-rose-500/36 hover:text-white"
                  data-tour-id="shell-signout-button"
                >
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] border border-rose-200/45 bg-rose-100/15 text-rose-50">
                    <LogOut className="h-4 w-4" />
                  </span>
                  Sign out
                </button>
              ) : null}
            </div>
          </aside>
        </div>
      ) : null}

      <OnboardingOverlay
        open={onboardingIsOpen}
        step={onboardingCurrentStep}
        stepIndex={onboardingStepIndex}
        totalSteps={onboardingTotalSteps}
        isLastStep={onboardingIsLastStep}
        isSaving={onboardingSaving}
        error={onboardingError}
        onBack={() => {
          void goToPreviousOnboardingStep();
        }}
        onNext={() => {
          void goToNextOnboardingStep();
        }}
        onSkip={() => {
          void skipOnboarding();
        }}
        onRestart={() => {
          void restartOnboarding();
        }}
      />
    </div>
  );
}
