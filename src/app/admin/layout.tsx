import { redirect } from 'next/navigation';
import { AppShell, type ShellItem } from '@/components/shell';
import { getSessionUser } from '@/lib/auth';
import { getUiRevampFlags } from '@/lib/ui-revamp';

const ITEMS: ShellItem[] = [
  { href: '/admin/admissions', label: 'Applications', icon: 'admissions' },
  { href: '/admin/billing', label: 'Payments', icon: 'billing' },
];

export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getSessionUser();
  const flags = getUiRevampFlags();

  if (!user) {
    redirect('/login?callbackUrl=/admin');
  }

  if (user.role !== 'ADMIN') {
    redirect('/dashboard');
  }

  return (
    <div
      className="theme-admin"
      data-ui-revamp-admin={flags.admin ? 'on' : 'off'}
      data-ui-revamp-foundation={flags.foundation ? 'on' : 'off'}
    >
      <AppShell
        title="Admin Suite"
        subtitle="Applications and tuition payments"
        items={ITEMS}
        primaryAction={{ href: '/admin/admissions', label: 'Review Applications' }}
        mode="rail"
        showHomeButton
        showSignOutButton
      >
        {children}
      </AppShell>
    </div>
  );
}
